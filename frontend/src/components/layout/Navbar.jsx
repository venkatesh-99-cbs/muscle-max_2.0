import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(15, 15, 16, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="container flex-between"
        style={{ height: "4.5rem", padding: "0 1.5rem" }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: "2.25rem",
              height: "2.25rem",
              background: "var(--gradient-brand)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              boxShadow: "0 0 15px rgba(249,115,22,0.4)",
            }}
          >
            ⚡
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(to right, #ffffff, #d4d4d8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MUSCLE<span style={{ color: "var(--brand-primary)", WebkitTextFillColor: "var(--brand-primary)" }}>MAX</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hide-mobile flex"
          style={{ alignItems: "center", gap: "1.5rem" }}
        >
          <Link
            to="/"
            style={{
              color: "var(--text-secondary)",
              fontWeight: 500,
              transition: "color var(--transition-fast)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Home
          </Link>
          <Link
            to="/products"
            style={{
              color: "var(--text-secondary)",
              fontWeight: 500,
              transition: "color var(--transition-fast)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Products
          </Link>
          {user && (
            <Link
              to="/orders"
              style={{
                color: "var(--text-secondary)",
                fontWeight: 500,
                transition: "color var(--transition-fast)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              My Orders
            </Link>
          )}
        </nav>

        {/* Right Action Icons (Cart + Auth) */}
        <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
          {/* Cart Icon & Badge */}
          <Link
            to="/cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-moderate)",
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "border-color var(--transition-fast)",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🛒</span>
            {itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minWidth: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.3rem",
                  boxShadow: "0 0 8px rgba(249,115,22,0.6)",
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop User / Auth Button */}
          <div className="hide-mobile">
            {user ? (
              <div className="flex" style={{ alignItems: "center", gap: "0.75rem" }}>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={user.email}
                >
                  Hi, {user.name || user.email.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.8125rem", padding: "0.4rem 0.75rem" }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex" style={{ alignItems: "center", gap: "0.5rem" }}>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="show-mobile-only btn btn-ghost"
            style={{ padding: "0.5rem", fontSize: "1.3rem" }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="show-mobile-only"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-moderate)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--text-primary)", fontWeight: 500, padding: "0.5rem 0" }}
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--text-primary)", fontWeight: 500, padding: "0.5rem 0" }}
          >
            Products
          </Link>
          {user && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: "var(--text-primary)", fontWeight: 500, padding: "0.5rem 0" }}
            >
              My Orders
            </Link>
          )}

          <div style={{ height: "1px", background: "var(--border-subtle)", margin: "0.5rem 0" }} />

          {user ? (
            <div className="flex-between">
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex" style={{ gap: "0.5rem" }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, textAlign: "center" }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, textAlign: "center" }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
