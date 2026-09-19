import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "All Products" },
  { to: "/cart", label: "Cart" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/orders", label: "My Orders" },
];

const CATEGORIES = [
  { label: "Protein", slug: "protein" },
  { label: "Creatine", slug: "Creatine Monohydrate" },
  { label: "Pre-Workout", slug: "pre-workout" },
  { label: "BCAA & EAA", slug: "bcaa" },
  { label: "Vitamins", slug: "multivitamins" },
  { label: "Protein Bars", slug: "protein-bars" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#050505",
        borderTop: "1px solid #1a1a1a",
        marginTop: "auto",
      }}
    >
      {/* Main Footer Grid */}
      <div
        className="container"
        style={{
          padding: "3.5rem 1.5rem 2.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2.5rem",
        }}
      >
        {/* Brand Column */}
        <div>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span
              style={{
                width: "2rem",
                height: "2rem",
                background: "var(--brand-primary)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 900,
                color: "#000",
              }}
            >
              M
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>
              MUSCLE<span style={{ color: "var(--brand-primary)" }}>MAX</span>
            </span>
          </Link>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "220px" }}>
            Premium sports nutrition, delivered across India. 100% authentic products from trusted brands.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <a
              href="https://www.instagram.com/musclemax.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "#1a1a1a",
                border: "1px solid #292929",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "border-color var(--transition-fast)",
                color: "var(--text-secondary)",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#292929"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              📸
            </a>
            <a
              href="https://www.musclemax.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "2.25rem",
                height: "2.25rem",
                background: "#1a1a1a",
                border: "1px solid #292929",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                transition: "border-color var(--transition-fast)",
                color: "var(--text-secondary)",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; e.currentTarget.style.color = "var(--brand-primary)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#292929"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              🌐
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: "var(--brand-primary)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem", transition: "color var(--transition-fast)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ color: "var(--brand-primary)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            Categories
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  style={{ color: "var(--text-muted)", fontSize: "0.875rem", transition: "color var(--transition-fast)" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: "var(--brand-primary)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            Contact Us
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { icon: "✉️", label: "support@musclemax.in" },
              { icon: "📞", label: "+91-98765-43210" },
              { icon: "🕐", label: "Mon–Sat, 10AM – 7PM IST" },
              { icon: "🚚", label: "Ships across all of India" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{item.icon}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: "1px solid #111",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
          className="container flex-between"
          style={{ flexWrap: "wrap", gap: "0.75rem" }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0 }}>
            © {new Date().getFullYear()} MuscleMax. All rights reserved. Online-only store.
          </p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
              <span
                key={item}
                style={{ color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer", transition: "color var(--transition-fast)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
