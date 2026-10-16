import { type JobBlock } from "./types";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  euro: "€",
  pound: "£",
};

/** Decodes named and numeric HTML entities. Unknown entities are left as written. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function clean(text: string): string {
  return decodeEntities(text.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turns an ATS job description (HTML) into text blocks: headings, paragraphs and
 * lists. The output is rendered by React as text, so no markup from the ATS ever
 * reaches the page; this only has to be good at preserving structure, not at
 * being a sanitizer. Scripts and styles are dropped with their content.
 */
export function htmlToBlocks(html: string): JobBlock[] {
  // Greenhouse returns the HTML entity-encoded; decode once if it looks that way.
  const source = /&lt;[a-z/]/i.test(html) && !/<[a-z/]/i.test(html) ? decodeEntities(html) : html;
  const body = source
    .replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const blocks: JobBlock[] = [];
  const tokens = body.split(/(<\/?(?:h[1-6]|p|div|ul|ol|li|br|section)\b[^>]*>)/i);
  let list: string[] | null = null;
  let item: string | null = null;
  let heading = false;
  let buffer = "";

  const flushText = () => {
    const text = clean(buffer);
    buffer = "";
    if (!text) return;
    if (item !== null) {
      item = item ? `${item} ${text}` : text;
      return;
    }
    blocks.push({ kind: heading ? "heading" : "paragraph", text });
  };
  const flushItem = () => {
    if (item !== null && list) {
      const text = item.trim();
      if (text) list.push(text);
    }
    item = null;
  };
  const flushList = () => {
    flushItem();
    if (list && list.length > 0) blocks.push({ kind: "list", items: list });
    list = null;
  };

  // split() with a capture group alternates text (even indices) and block tags (odd).
  for (const [index, token] of tokens.entries()) {
    const tag = index % 2 === 1 ? /^<(\/?)([a-z0-9]+)/i.exec(token) : null;
    if (!tag) {
      buffer += token;
      continue;
    }
    const closing = tag[1] === "/";
    const name = tag[2]!.toLowerCase();

    if (name === "ul" || name === "ol") {
      flushText();
      if (closing) flushList();
      else {
        flushList();
        list = [];
      }
    } else if (name === "li") {
      flushText();
      flushItem();
      if (!closing) {
        list ??= [];
        item = "";
      }
    } else if (/^h[1-6]$/.test(name)) {
      flushText();
      heading = !closing;
    } else if (name === "br") {
      if (item !== null) buffer += " ";
      else flushText();
    } else {
      // p, div, section: a block boundary.
      flushText();
      heading = false;
    }
  }
  flushText();
  flushList();

  // A short paragraph that is only bold text reads as a heading ("<p><strong>What you'll do</strong></p>").
  return blocks.map((block) =>
    block.kind === "paragraph" && /^[^.!?]{2,60}:?$/.test(block.text) && isBoldOnly(body, block.text)
      ? { kind: "heading", text: block.text.replace(/:$/, "") }
      : block,
  );
}

/** True when the text appears in the source wrapped entirely in <strong>/<b>. */
function isBoldOnly(html: string, text: string): boolean {
  const pattern = /<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(pattern)) {
    if (clean(match[2] ?? "") === text) return true;
  }
  return false;
}

/** Plain-text description (Ashby/Lever "descriptionPlain") into paragraphs and "- " / "• " lists. */
export function plainToBlocks(plain: string): JobBlock[] {
  const blocks: JobBlock[] = [];
  for (const chunk of plain.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    const bullet = /^([-•*·]|\d+[.)])\s+/;
    const bullets = lines.filter((l) => bullet.test(l));
    if (bullets.length === lines.length) {
      blocks.push({ kind: "list", items: lines.map((l) => l.replace(bullet, "")) });
    } else if (bullets.length > 0 && !bullet.test(lines[0]!) && bullets.length === lines.length - 1) {
      blocks.push({ kind: "heading", text: lines[0]!.replace(/:$/, "") });
      blocks.push({ kind: "list", items: lines.slice(1).map((l) => l.replace(bullet, "")) });
    } else {
      blocks.push({ kind: "paragraph", text: lines.join(" ") });
    }
  }
  return blocks;
}

/** The description as one plain string (JSON-LD `description`, meta description). */
export function blocksToText(blocks: readonly JobBlock[]): string {
  return blocks
    .map((b) => (b.kind === "list" ? b.items.map((i) => `• ${i}`).join("\n") : b.text))
    .join("\n\n");
}
