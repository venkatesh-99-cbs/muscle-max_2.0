import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const PRODUCT_ICONS = {
  Protein: "🥛",
  "Performance Supplements": "⚡",
  "Health & Nutrition": "🌿",
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const total = typeof totalPrice === "number" ? totalPrice : 0;
  const shippingThreshold = 999;
  const isFreeShipping = total >= shippingThreshold;
  const shipping = isFreeShipping ? 0 : 79;
  const discount = promoApplied ? Math.round(total * 0.1) : 0;
  const grandTotal = total - discount + shipping;
  const progressToFreeShipping = Math.min(100, Math.round((total / shippingThreshold) * 100));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promo.trim()) return;
    if (promo.trim().toUpperCase() === "MUSCLE10" || promo.trim().toUpperCase() === "MAX10") {
      setPromoApplied(true);
      showToast("✓ 10% discount applied!");
    } else {
      showToast("Invalid coupon code. Try MUSCLE10");
    }
  };

  // ═══════════════════════════════════════════
  // EMPTY CART STATE
  // ═══════════════════════════════════════════
  if (!items || items.length === 0) {
    return (
      <div style={{ minHeight: "80vh", background: "#0a0a0a", padding: "4rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: "var(--radius-xl)",
              padding: "3.5rem 2rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                width: "5rem",
                height: "5rem",
                background: "rgba(158,230,0,0.08)",
                border: "1px solid rgba(158,230,0,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.2rem",
                margin: "0 auto 1.5rem",
              }}
            >
              🛒
            </div>
            <h1 style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              YOUR CART IS EMPTY
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Looks like you haven't added any supplements yet. Explore our high-performance proteins, creatines, and workout essentials.
            </p>

            <Link
              to="/products"
              className="btn btn-primary"
              style={{ padding: "0.9rem 2.2rem", fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase" }}
            >
              Browse Catalog →
            </Link>

            {/* Guarantees */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "1rem",
                marginTop: "2.5rem",
                paddingTop: "2rem",
                borderTop: "1px solid #222",
              }}
            >
              <div>
                <span style={{ color: "var(--brand-primary)", fontSize: "1.2rem", display: "block" }}>⚡</span>
                <span style={{ color: "#ccc", fontSize: "0.8rem", fontWeight: 600 }}>Fast Shipping</span>
              </div>
              <div>
                <span style={{ color: "var(--brand-primary)", fontSize: "1.2rem", display: "block" }}>✓</span>
                <span style={{ color: "#ccc", fontSize: "0.8rem", fontWeight: 600 }}>100% Authentic</span>
              </div>
              <div>
                <span style={{ color: "var(--brand-primary)", fontSize: "1.2rem", display: "block" }}>🛡</span>
                <span style={{ color: "#ccc", fontSize: "0.8rem", fontWeight: 600 }}>7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // POPULATED CART STATE
  // ═══════════════════════════════════════════
  return (
    <div style={{ minHeight: "80vh", background: "#0a0a0a", padding: "3rem 0 5rem" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <span className="section-label">Checkout Bag</span>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", marginTop: "0.25rem" }}>
            YOUR CART ({items.reduce((s, i) => s + (i.quantity || 1), 0)})
          </h1>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div
          style={{
            background: "#141414",
            border: "1px solid #262626",
            borderRadius: "var(--radius-lg)",
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.6rem" }}>
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {isFreeShipping
                ? "🎉 You've unlocked FREE Express Shipping!"
                : `Add ₹${(shippingThreshold - total).toLocaleString("en-IN")} more to qualify for FREE Shipping`}
            </span>
            <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>
              {isFreeShipping ? "FREE" : `₹${shipping}`}
            </span>
          </div>
          <div style={{ height: "6px", background: "#222", borderRadius: "99px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressToFreeShipping}%`,
                height: "100%",
                background: "var(--gradient-brand)",
                borderRadius: "99px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Responsive Grid: Items Left, Summary Right */}
        <div className="cart-layout-grid">
          {/* Cart Item Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => {
              const productName = item.product?.name || item.name || "MuscleMax Supplement";
              const productPrice = parseFloat(item.product?.price || item.price || 0);
              const productImage = item.product?.image || item.image;
              const productCategory = item.product?.category?.name || item.category?.name || item.category || "Supplement";
              const icon = PRODUCT_ICONS[productCategory] || "⚡";
              const itemQty = item.quantity || 1;
              const lineTotal = productPrice * itemQty;
              const productId = item.product?.id || item.product_id || item.id;

              return (
                <div key={item.id} className="cart-item-row">
                  {/* Thumbnail */}
                  <Link
                    to={productId ? `/products/${productId}` : "#"}
                    className="cart-item-img"
                    style={{ textDecoration: "none" }}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "2rem" }}>{icon}</span>
                    )}
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.7rem",
                        color: "var(--brand-primary)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {productCategory}
                    </span>
                    <Link
                      to={productId ? `/products/${productId}` : "#"}
                      style={{ textDecoration: "none" }}
                    >
                      <h3 className="cart-item-name">{productName}</h3>
                    </Link>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      ₹{productPrice.toLocaleString("en-IN")} each
                    </div>
                  </div>

                  {/* Controls / Stepper */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                    <div className="qty-stepper">
                      <button
                        className="qty-btn"
                        onClick={() => {
                          if (itemQty <= 1) {
                            removeItem(item.id);
                            showToast("Item removed");
                          } else {
                            updateQuantity(item.id, itemQty - 1);
                          }
                        }}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{itemQty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, itemQty + 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ minWidth: "75px", textAlign: "right" }}>
                      <div className="cart-item-price">
                        ₹{lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        showToast("Item removed from cart");
                      }}
                      title="Remove from cart"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ff5555",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        padding: "0.4rem",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <Link
                to="/products"
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div
            style={{
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: "var(--radius-xl)",
              padding: "1.75rem",
              position: "sticky",
              top: "5.5rem",
            }}
          >
            <h2 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.25rem" }}>
              ORDER SUMMARY
            </h2>

            {/* Promo Form */}
            <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Coupon (e.g. MUSCLE10)"
                style={{
                  flex: 1,
                  background: "#0d0d0d",
                  border: "1px solid #333",
                  borderRadius: "var(--radius-md)",
                  padding: "0.6rem 0.85rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
              <button
                type="submit"
                className="btn btn-outline"
                style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Bag Subtotal</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</span>
              </div>

              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--brand-primary)" }}>
                  <span>Promo Discount (10%)</span>
                  <span style={{ fontWeight: 700 }}>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Standard Delivery</span>
                <span style={{ color: isFreeShipping ? "var(--brand-primary)" : "#fff", fontWeight: 600 }}>
                  {isFreeShipping ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "#262626",
                  margin: "0.5rem 0",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 900 }}>
                <span style={{ color: "#fff" }}>Total</span>
                <span style={{ color: "var(--brand-primary)" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login?redirect=/checkout");
                } else {
                  navigate("/checkout");
                }
              }}
              className="btn btn-primary btn-full"
              style={{
                marginTop: "1.5rem",
                padding: "0.95rem",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                borderRadius: "var(--radius-md)",
              }}
            >
              PROCEED TO CHECKOUT →
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
              🔒 256-Bit Encrypted & Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
