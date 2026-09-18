import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        padding: "4rem 0 2rem",
        marginTop: "auto",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span
                style={{
                  width: "2rem",
                  height: "2rem",
                  background: "var(--gradient-brand)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                ⚡
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 800 }}>
                MUSCLE<span style={{ color: "var(--brand-primary)" }}>MAX</span>
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6" }}>
              Pure performance nutrition engineered for serious athletes and fitness enthusiasts.
              100% authentic, batch-tested, and delivered straight across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Explore
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <li>
                <Link to="/" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Quality & Trust */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Why Muscle Max
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              <li>✓ 100% Authentic Supplements</li>
              <li>✓ Free Shipping on Orders &gt; ₹999</li>
              <li>✓ 7-Day Hassle-Free Returns</li>
              <li>✓ Direct from Certified Manufacturers</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Customer Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              <p>📧 support@musclemax.in</p>
              <p>📞 +91-98765-43210</p>
              <p>🕒 Mon – Sat, 10 AM – 7 PM IST</p>
              <p>📍 Online Store — Pan India Shipping</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
          }}
        >
          <p>© {new Date().getFullYear()} Muscle Max Nutrition India. All rights reserved.</p>
          <p>Dietary supplements are not intended to diagnose, treat, cure, or prevent any disease.</p>
        </div>
      </div>
    </footer>
  );
}
