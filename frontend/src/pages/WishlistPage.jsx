import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const PRODUCT_ICONS = {
  Protein: "🥛",
  "Performance Supplements": "⚡",
  "Health & Nutrition": "🌿",
};

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setAddingId(product.id);
      await addItem(product.id, 1);
      showToast(`✓ Added ${product.name} to cart!`);
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div style={{ minHeight: "80vh", background: "#0b0b0b", padding: "3rem 0" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-label">Saved Items</span>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#fff",
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            My Wishlist ({items.length})
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
            Save your favorite fuels and supplements here. Add them to your cart whenever you're ready to crush your goals.
          </p>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "#151515",
              borderRadius: "var(--radius-xl)",
              border: "1px solid #292929",
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🖤</div>
            <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
              Explore our performance products, premium proteins, and elite nutrition to find what powers your regimen.
            </p>
            <Link to="/products" className="btn btn-primary" style={{ padding: "0.85rem 2rem" }}>
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {items.map((p) => {
              const catName = p.category?.name || p.category || "Supplements";
              const icon = PRODUCT_ICONS[catName] || "⚡";
              const price = parseFloat(p.price || 0);

              return (
                <div
                  key={p.id}
                  className="product-card"
                  style={{
                    position: "relative",
                    background: "#151515",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid #292929",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeItem(p.id);
                      showToast("Removed from wishlist");
                    }}
                    title="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: "0.85rem",
                      right: "0.85rem",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ff4d4d",
                      cursor: "pointer",
                      zIndex: 2,
                      fontSize: "1.1rem",
                      transition: "background 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "rgba(255, 77, 77, 0.2)";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.6)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ✕
                  </button>

                  {/* Thumbnail */}
                  <Link
                    to={`/products/${p.id}`}
                    style={{
                      height: "220px",
                      background: "#1c1c1c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "1rem",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "4.5rem", userSelect: "none" }}>{icon}</span>
                    )}
                  </Link>

                  {/* Content */}
                  <div
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "var(--brand-primary)",
                          marginBottom: "0.4rem",
                        }}
                      >
                        {catName}
                      </span>
                      <Link
                        to={`/products/${p.id}`}
                        style={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          textDecoration: "none",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.35,
                        }}
                      >
                        {p.name}
                      </Link>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #242424",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 900,
                          color: "#fff",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        ₹{price.toLocaleString("en-IN")}
                      </span>

                      <button
                        onClick={(e) => handleAddToCart(e, p)}
                        disabled={addingId === p.id}
                        className="btn btn-primary"
                        style={{
                          padding: "0.6rem 1.1rem",
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        {addingId === p.id ? "Adding…" : "+ ADD TO CART"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
