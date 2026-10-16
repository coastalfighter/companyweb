import { type ComponentPropsWithRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * Button: spec in docs/blueprint/07-component-library.md (G1).
 * Radius is always md (8px). Never pill-shaped.
 */
export const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out-expo",
    "active:scale-[0.98] active:duration-75",
    "disabled:pointer-events-none aria-disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "btn-shine bg-accent text-on-accent hover:bg-accent-hover hover:shadow-glow active:bg-accent-active",
          "focus-visible:outline-fg",
          "disabled:bg-ink-700 disabled:text-ink-400 aria-disabled:bg-ink-700 aria-disabled:text-ink-400",
        ],
        "primary-ink": [
          "bg-ink-950 text-paper hover:bg-ink-800 active:bg-black",
          "focus-visible:outline-ink-950",
          "disabled:bg-ink-700 disabled:text-ink-400",
        ],
        secondary: [
          "border border-line bg-surface-2 text-fg hover:border-line-strong hover:bg-surface-3",
          "disabled:text-fg-disabled",
        ],
        ghost: [
          "border border-line-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-white/[0.04]",
          "disabled:border-line disabled:text-fg-disabled",
        ],
        link: [
          "h-auto! px-0! text-accent-text underline-offset-4 hover:underline active:scale-100",
          "disabled:text-fg-disabled",
        ],
        destructive: [
          "border border-error/30 bg-error/10 text-error hover:bg-error/20",
          "focus-visible:outline-error",
        ],
      },
      size: {
        sm: "h-8 px-3 text-[0.875rem] [&_svg]:size-4",
        md: "h-10 px-4 text-[0.9375rem] [&_svg]:size-4",
        lg: "h-12 px-5 text-base [&_svg]:size-[18px]",
        xl: "h-14 px-6 text-base [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
        icon: "size-10 [&_svg]:size-5",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [{ variant: "ghost", size: ["icon", "icon-sm"], className: "border-transparent" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ComponentPropsWithRef<"button">, ButtonVariantProps {
  /** Render the child element (e.g. next/link) with button styles. */
  asChild?: boolean;
  /** Shows a spinner, locks interaction and sets aria-busy. Ignored with asChild. */
  loading?: boolean;
  iconLeft?: ReactNode;
  /** `"arrow"` renders the standard CTA arrow that nudges 3px on hover. */
  iconRight?: ReactNode | "arrow";
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  children,
  type,
  ...props
}: ButtonProps) {
  const right =
    iconRight === "arrow" ? (
      <ArrowRightIcon
        aria-hidden
        weight="regular"
        className="transition-transform duration-150 ease-out-expo group-hover/button:translate-x-[3px]"
      />
    ) : (
      iconRight
    );

  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {iconLeft}
        <Slot.Slottable>{children}</Slot.Slottable>
        {right}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <CircleNotchIcon aria-hidden className="animate-spin" /> : iconLeft}
      {children}
      {!loading && right}
    </button>
  );
}
