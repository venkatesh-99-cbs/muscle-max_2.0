import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    color: isActive(path) ? "var(--brand-primary)" : "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.9rem",
    transition: "color var(--transition-fast)",
    position: "relative",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(11,11,11,0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid #1f1f1f",
      }}
    >
      <div
        className="container flex-between"
        style={{ height: "4.5rem", padding: "0 1.5rem" }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <span
            style={{
              width: "2.25rem",
              height: "2.25rem",
              background: "var(--brand-primary)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 900,
              color: "#000",
              boxShadow: "0 0 18px rgba(183,255,0,0.45)",
            }}
          >
            M
          </span>
          <span style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>
            MUSCLE<span style={{ color: "var(--brand-primary)" }}>MAX</span>
          </span>
          <span
            className="hide-mobile"
            style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "0.25rem", fontWeight: 500, letterSpacing: "0.04em" }}
          >
            FUEL YOUR JOURNEY
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hide-mobile flex" style={{ alignItems: "center", gap: "2rem" }}>
          <Link to="/" style={navLinkStyle("/")}
            onMouseOver={(e) => !isActive("/") && (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => !isActive("/") && (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Home
          </Link>
          <Link to="/products" style={navLinkStyle("/products")}
            onMouseOver={(e) => !isActive("/products") && (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseOut={(e) => !isActive("/products") && (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Products
          </Link>
          {user && (
            <Link to="/orders" style={navLinkStyle("/orders")}
              onMouseOver={(e) => !isActive("/orders") && (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseOut={(e) => !isActive("/orders") && (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              My Orders
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex" style={{ alignItems: "center", gap: "0.75rem" }}>
          {/* Wishlist */}
          <Link
            to="/wishlist"
            title="Wishlist"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-md)",
              background: "#1a1a1a",
              border: "1px solid #292929",
              color: wishlistCount > 0 ? "var(--danger)" : "var(--text-secondary)",
              textDecoration: "none",
              transition: "border-color var(--transition-fast)",
              fontSize: "1.15rem",
            }}
          >
            {wishlistCount > 0 ? "♥" : "♡"}
            {wishlistCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "var(--danger)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: "1.15rem",
                  height: "1.15rem",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.25rem",
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            title="Cart"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-md)",
              background: "#1a1a1a",
              border: "1px solid #292929",
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
                  color: "#000",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: "1.15rem",
                  height: "1.15rem",
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.25rem",
                  boxShadow: "var(--shadow-glow-sm)",
                }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Auth */}
          <div className="hide-mobile">
            {user ? (
              <div className="flex" style={{ alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={user.email}>
                  Hi, {user.name || user.email.split("@")[0]}
                </span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ fontSize: "0.8125rem" }}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex" style={{ alignItems: "center", gap: "0.5rem" }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
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

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div
          className="show-mobile-only"
          style={{
            background: "#111",
            borderBottom: "1px solid #222",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/products", label: "Products" },
            { to: "/wishlist", label: "❤ Wishlist" },
            ...(user ? [{ to: "/orders", label: "My Orders" }] : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive(item.to) ? "var(--brand-primary)" : "var(--text-primary)",
                fontWeight: 600,
                padding: "0.5rem 0",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ marginTop: "0.5rem" }}>
            {user ? (
              <div className="flex-between">
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{user.email}</span>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">Log out</button>
              </div>
            ) : (
              <div className="flex" style={{ gap: "0.5rem" }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: "center" }}>Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: "center" }}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
