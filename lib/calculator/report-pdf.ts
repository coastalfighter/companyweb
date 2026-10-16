import "server-only";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { pdfSafe, type ReportContent } from "./report-content";

/** US Letter, points. */
const PAGE = { width: 612, height: 792 } as const;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

const INK = rgb(10 / 255, 10 / 255, 10 / 255);
const MUTED = rgb(0.32, 0.32, 0.32);
const LINE = rgb(0.86, 0.86, 0.88);
const VOLT = rgb(163 / 255, 230 / 255, 53 / 255);

/** Greedy word wrap by measured width. */
export function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of pdfSafe(text).split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Draws the report as a one- or two-page PDF with the standard Helvetica fonts
 * (no font files to ship). Light paper with an Ink header band and a lime rule,
 * matching the site's Paper theme for long-form reading.
 */
export async function renderReportPdf(content: ReportContent, siteName: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(pdfSafe(`${siteName} ${content.title}`));
  doc.setAuthor(pdfSafe(siteName));
  doc.setSubject(pdfSafe(content.preparedFor));
  doc.setCreator(pdfSafe(siteName));
  doc.setProducer(pdfSafe(siteName));

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE.width, PAGE.height]);
  let y: number = PAGE.height;

  const newPage = () => {
    page = doc.addPage([PAGE.width, PAGE.height]);
    y = PAGE.height - MARGIN;
  };
  const ensure = (height: number) => {
    if (y - height < MARGIN + 30) newPage();
  };
  const text = (value: string, x: number, size: number, font = regular, color = INK) =>
    page.drawText(pdfSafe(value), { x, y, size, font, color });
  const paragraph = (value: string, size = 10.5, font = regular, color = INK, gap = 4) => {
    for (const line of wrap(value, font, size, CONTENT_WIDTH)) {
      ensure(size + gap);
      y -= size + gap;
      text(line, MARGIN, size, font, color);
    }
  };
  const heading = (value: string) => {
    ensure(40);
    y -= 26;
    text(value, MARGIN, 13, bold);
    y -= 6;
  };

  // Header band.
  page.drawRectangle({ x: 0, y: PAGE.height - 96, width: PAGE.width, height: 96, color: INK });
  page.drawRectangle({ x: 0, y: PAGE.height - 100, width: PAGE.width, height: 4, color: VOLT });
  y = PAGE.height - 44;
  text(siteName, MARGIN, 12, bold, VOLT);
  y -= 26;
  text(content.title, MARGIN, 20, bold, rgb(1, 1, 1));
  y = PAGE.height - 100 - 26;
  paragraph(content.preparedFor, 10, regular, MUTED);

  // Summary.
  y -= 8;
  paragraph(content.summary, 12, bold, INK, 5);

  // Key figures, two columns.
  heading("Key figures");
  const colWidth = CONTENT_WIDTH / 2;
  for (let i = 0; i < content.keyFigures.length; i += 2) {
    ensure(44);
    y -= 14;
    const rowTop = y;
    for (const [j, figure] of content.keyFigures.slice(i, i + 2).entries()) {
      const x = MARGIN + j * colWidth;
      y = rowTop;
      text(figure[0], x, 9.5, regular, MUTED);
      y -= 18;
      text(figure[1], x, 15, bold);
    }
    y = rowTop - 30;
  }

  // Breakdown table.
  if (content.tableRows.length > 0) {
    heading("Breakdown");
    const columns = content.tableHead.length;
    const first = columns === 6 ? 150 : 170;
    const rest = (CONTENT_WIDTH - first) / (columns - 1);
    const xs = Array.from({ length: columns }, (_, i) => MARGIN + (i === 0 ? 0 : first + rest * (i - 1)));
    const row = (cells: string[], font: PDFFont, color = INK) => {
      ensure(22);
      y -= 16;
      cells.forEach((cell, i) => text(cell, xs[i]!, 9.5, font, color));
      y -= 6;
      page.drawLine({
        start: { x: MARGIN, y },
        end: { x: MARGIN + CONTENT_WIDTH, y },
        thickness: 0.5,
        color: LINE,
      });
    };
    row(content.tableHead, bold, MUTED);
    for (const cells of content.tableRows) row(cells, regular);
  }

  if (content.caveat) {
    heading("Worth knowing");
    paragraph(content.caveat);
  }

  heading("How we calculate this");
  for (const item of content.methodology) {
    paragraph(item, 9.5, regular, MUTED);
    y -= 4;
  }

  heading("Next step");
  paragraph(content.nextStep);

  y -= 10;
  paragraph(content.disclaimer, 8.5, regular, MUTED);

  // Page numbers.
  const pages = doc.getPages();
  pages.forEach((p, i) =>
    p.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE.width - MARGIN - 24,
      y: MARGIN - 24,
      size: 8,
      font: regular,
      color: MUTED,
    }),
  );

  return doc.save();
}
