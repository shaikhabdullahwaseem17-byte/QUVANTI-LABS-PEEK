"use client";

import {
  Mail,
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowRight,
  Download,
  Smartphone,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <footer
      style={{
        position: "relative",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        background: "#080B10",
        overflow: "hidden",
      }}
    >
      {/* Subtle ambient — single faint orb, no rainbow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "10%",
            width: "500px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.018) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "64px 24px 40px",
        }}
      >
        {/* ── TOP: Logo + CTA ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            marginBottom: "56px",
            paddingBottom: "48px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src="https://ucarecdn.com/d39e423f-56fe-46e4-b20b-04ba0efd4bdc/-/format/auto/"
              alt="Quvanti Labs"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#EEF2FF",
                  margin: 0,
                  letterSpacing: "-0.03em",
                  fontFamily: "var(--font-heading, sans-serif)",
                }}
              >
                Quvanti Labs
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  margin: "2px 0 0 0",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Autonomous Quant Telemetry
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {!isInstalled && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#EEF2FF",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Download size={14} />
                Install App
              </button>
            )}
            <a
              href="/agents/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#080B10",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s",
                letterSpacing: "-0.01em",
              }}
            >
              Get Started Free
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* ── LINKS GRID ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {[
            {
              label: "Product",
              links: [
                { text: "Live Demo", href: "/demo" },
                { text: "Pricing", href: "/upgrade" },
                { text: "Strategy Lab", href: "/strategy-lab" },
                { text: "Dashboard", href: "/dashboard" },
              ],
            },
            {
              label: "Features",
              links: [
                { text: "AI Agent Builder", href: "/agents/create" },
                { text: "Pro Analytics", href: "/pro-dashboard" },
                { text: "Backtesting Engine", href: null },
                { text: "Risk Management", href: null },
              ],
            },
            {
              label: "Company",
              links: [
                { text: "About", href: "/" },
                { text: "Privacy Policy", href: "/privacy" },
                { text: "Terms of Service", href: "/terms" },
              ],
            },
            {
              label: "Account",
              links: [
                { text: "Sign Up Free", href: "/account/signup" },
                { text: "Sign In", href: "/account/signin" },
                { text: "Upgrade to Pro", href: "/upgrade" },
              ],
            },
          ].map(({ label, links }) => (
            <div key={label}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "16px",
                }}
              >
                {label}
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {links.map(({ text, href }) => (
                  <li key={text} style={{ marginBottom: "10px" }}>
                    {href ? (
                      <a
                        href={href}
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.45)",
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.9)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.45)")
                        }
                      >
                        {text}
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.22)",
                        }}
                      >
                        {text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── INSTITUTIONAL LEGAL DISCLAIMER ──────────────────────── */}
        <div
          style={{
            marginBottom: "32px",
            padding: "20px 24px",
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "10px",
            borderLeft: "3px solid rgba(239,68,68,0.6)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            <Shield
              size={14}
              style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ef4444",
                  marginBottom: "6px",
                }}
              >
                Risk Disclosure & Legal Notice
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: "1.7",
                  margin: 0,
                }}
              >
                Quvanti Labs is a{" "}
                <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                  research-first terminal
                </strong>
                . All backtested results are{" "}
                <strong style={{ color: "rgba(255,255,255,0.6)" }}>
                  simulated and hypothetical
                </strong>{" "}
                — they do not represent actual trading results.{" "}
                <strong style={{ color: "#ef4444" }}>
                  Trading financial instruments involves a 100% risk of capital
                  loss.
                </strong>{" "}
                Past performance is not indicative of future results. This
                platform does not constitute financial advice or any form of
                regulated financial service.
              </p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────────────── */}
        <div
          style={{
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Quvanti Labs. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <a
              href="mailto:helloquvanti@gmail.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                fontFamily: "monospace",
                letterSpacing: "0.02em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.75)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
              }
            >
              <Mail size={11} />
              helloquvanti@gmail.com
            </a>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 5px #10b981",
                }}
              />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}



