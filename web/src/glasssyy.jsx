"use client";

/**
 * GlassButton — Quvanti Frosted Milk iOS-grade button component
 *
 * Design spec: Deep obsidian canvas, rgba(255,255,255,0.12) base,
 * backdrop-filter blur(20px) saturate(160%), 1px solid rgba(255,255,255,0.22) border.
 * Refracts the background aura — not hollow, not opaque.
 *
 * Variants:
 *   default  — standard frosted milk
 *   primary  — brighter milk, higher contrast
 *   danger   — red-tinted glass for destructive actions
 *   ghost    — near-invisible, border-only
 *
 * Usage:
 *   <GlassButton>Click Me</GlassButton>
 *   <GlassButton variant="primary" onClick={fn}>Submit</GlassButton>
 *   <GlassButton variant="danger" disabled>Delete</GlassButton>
 *   <GlassButton as="a" href="/dashboard">Go to Dashboard</GlassButton>
 */

import { forwardRef } from "react";

// ── Variant style maps ────────────────────────────────────────────────────────
const VARIANT_STYLES = {
  default: {
    background: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.22)",
    color: "#FFFFFF",
    boxShadow:
      "0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.1)",
  },
  primary: {
    background: "rgba(248, 250, 252, 0.16)",
    border: "1px solid rgba(248, 250, 252, 0.38)",
    color: "#FFFFFF",
    boxShadow:
      "0 4px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.22), 0 0 30px rgba(255, 255, 255, 0.04)",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    color: "#FCA5A5",
    boxShadow:
      "0 4px 24px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.06)",
  },
  ghost: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#CBD5E1",
    boxShadow: "none",
  },
  accent: {
    background: "rgba(91, 140, 255, 0.16)",
    border: "1px solid rgba(91, 140, 255, 0.32)",
    color: "#FFFFFF",
    boxShadow:
      "0 4px 28px rgba(91, 140, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
  },
};

// ── Hover style overrides ─────────────────────────────────────────────────────
const VARIANT_HOVER = {
  default: {
    background: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    boxShadow:
      "0 8px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.18), 0 0 20px rgba(255, 255, 255, 0.04)",
  },
  primary: {
    background: "rgba(248, 250, 252, 0.24)",
    borderColor: "rgba(248, 250, 252, 0.56)",
    boxShadow:
      "0 10px 50px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.06)",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.5)",
    boxShadow: "0 6px 32px rgba(239, 68, 68, 0.25)",
  },
  ghost: {
    background: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  accent: {
    background: "rgba(91, 140, 255, 0.26)",
    borderColor: "rgba(91, 140, 255, 0.52)",
    boxShadow:
      "0 8px 40px rgba(91, 140, 255, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
  },
};

// ── Size map ──────────────────────────────────────────────────────────────────
const SIZE_STYLES = {
  sm: {
    padding: "8px 16px",
    fontSize: "12px",
    borderRadius: "10px",
    gap: "6px",
  },
  md: {
    padding: "12px 24px",
    fontSize: "14px",
    borderRadius: "14px",
    gap: "8px",
  },
  lg: {
    padding: "15px 32px",
    fontSize: "15px",
    borderRadius: "16px",
    gap: "10px",
  },
  xl: {
    padding: "18px 40px",
    fontSize: "16px",
    borderRadius: "18px",
    gap: "12px",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
const GlassButton = forwardRef(function GlassButton(
  {
    children,
    variant = "default",
    size = "md",
    disabled = false,
    className = "",
    style = {},
    as: Tag = "button",
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref,
) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const hoverStyle = VARIANT_HOVER[variant] || VARIANT_HOVER.default;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  // We manage hover state via CSS class injection — no useState to avoid
  // hydration mismatch and to keep this render-pure.
  // All hover transitions defined via the .glass-btn class in globals.

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sizeStyle.gap,
    padding: sizeStyle.padding,
    borderRadius: sizeStyle.borderRadius,
    fontSize: sizeStyle.fontSize,
    fontWeight: 600,
    letterSpacing: "0.02em",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    WebkitFontSmoothing: "antialiased",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.3 : 1,
    pointerEvents: disabled ? "none" : "auto",
    textDecoration: "none",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    backdropFilter: "blur(20px) saturate(160%)",
    ...variantStyle,
    ...style,
  };

  // Inline shimmer pseudo-element simulation via a child span
  // (pseudo-elements aren't accessible from inline style — this is the production pattern)
  return (
    <>
      <Tag
        ref={ref}
        disabled={Tag === "button" ? disabled : undefined}
        aria-disabled={disabled}
        className={`glass-btn ${className}`}
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, {
              background: hoverStyle.background,
              borderColor: hoverStyle.borderColor,
              boxShadow: hoverStyle.boxShadow,
              transform: "translateY(-1px)",
            });
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, {
              background: variantStyle.background,
              borderColor: "transparent", // reset to border shorthand
              border: variantStyle.border,
              boxShadow: variantStyle.boxShadow,
              transform: "translateY(0px)",
            });
          }
          onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(1px)";
            e.currentTarget.style.boxShadow =
              "0 2px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)";
          }
          props.onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = hoverStyle.boxShadow;
          }
          props.onMouseUp?.(e);
        }}
        {...props}
      >
        {/* Shimmer sweep layer */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            pointerEvents: "none",
            // Shimmer handled by .glass-btn::before in globals
          }}
        />
        {/* Actual content — sits above shimmer */}
        <span style={{ position: "relative", zIndex: 1, display: "contents" }}>
          {children}
        </span>
      </Tag>
    </>
  );
});

GlassButton.displayName = "GlassButton";

export default GlassButton;
export { GlassButton };



