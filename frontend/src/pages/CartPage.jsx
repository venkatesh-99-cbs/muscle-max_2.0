import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
  const shipping = total >= 999 ? 0 : 79;
  const discount = promoApplied ? Math.round(total * 0.1) : 0;
  const grandTotal = total - discount + shipping;

  const PRODUCT_ICONS = { Protein: "🥛", "Performance Supplements": "⚡", "Health & Nutrition": "🌿" };

  if (!items || items.length === 0) {
    return (
      <div
        style={{
          minHeight: "70vh",
          background: "#0b0b0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "1.5rem" }}>🛒</div>
        <h2 style={{ color: "#fff", fontSize: "1.8rem", marginBottom: "0.75rem" }}>Your cart is empty</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Looks like you haven't added any products yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Browse Products →</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", background: "#0b0b0b", padding: "3rem 0 5rem" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="section-label">Shopping</span>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "2.2rem" }}>YOUR CART</h1>
          <p style={{ color: "var(--text-muted)" }}>{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Cart Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => {
              const productName = item.product?.name || item.name || "Product";
              const productPrice = parseFloat(item.product?.price || item.price || 0);
              const productImage = item.product?.image || item.image;
              const productCategory = item.product?.category?.name || item.category?.name || "";
              const icon = PRODUCT_ICONS[productCategory] || "⚡";
              const itemQty = item.quantity || 1;

              return (
                <div key={item.id} className="cart-item-row">
                  {/* Image */}
                  <div className="cart-item-img">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--radius-md)" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentNode.querySelector("span").style.display = "block"; }}
                      />
                    ) : null}
                    <span style={{ display: productImage ? "none" : "block", fontSize: "2rem" }}>{icon}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                      {productCategory}
                    </div>
                    <div className="cart-item-name">{productName}</div>
                    <div className="cart-item-price">₹{productPrice.toLocaleString("en-IN")}</div>
                  </div>

                  {/* Qty controls */}
                  <div className="qty-stepper">
                    <button
                      className="qty-btn"
                      onClick={() => {
                        if (itemQty <= 1) removeItem(item.id);
                        else updateQuantity(item.id, itemQty - 1);
                      }}
                    >−</button>
                    <span className="qty-value">{itemQty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, itemQty + 1)}
                    >+</button>
                  </div>

                  {/* Line total */}
                  <div style={{ minWidth: "80px", textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "var(--brand-primary)", fontSize: "1rem" }}>
                      ₹{(productPrice * itemQty).toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => { removeItem(item.id); showToast("Item removed from cart"); }}
                    style={{
                      background: "rgba(239,68,68,.1)",
                      border: "1px solid rgba(239,68,68,.2)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--danger)",
                      padding: "0.4rem 0.65rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.2)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.1)")}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}

            <div style={{ marginTop: "0.5rem" }}>
              <Link to="/products" style={{ color: "var(--text-muted)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div
            style={{
              background: "#171717",
              border: "1px solid #292929",
              borderRadius: "var(--radius-xl)",
              padding: "1.75rem",
              position: "sticky",
              top: "5rem",
            }}
          >
            <h3 style={{ color: "#fff", fontWeight: 800, marginBottom: "1.5rem", fontSize: "1.1rem" }}>Order Summary</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                <span>Subtotal ({items.length} items)</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              {promoApplied && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)", fontSize: "0.9rem" }}>
                  <span>Promo Discount (10%)</span>
                  <span>−₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "var(--success)" : "var(--text-secondary)" }}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  Add ₹{(999 - total).toLocaleString("en-IN")} more for free shipping
                </p>
              )}
            </div>

            {/* Promo Code */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  border: "1px solid #333",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "0.65rem 0.9rem",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    if (promo === "MUSCLEMAX10") {
                      setPromoApplied(true);
                      showToast("🎉 Promo code applied! 10% off");
                    } else {
                      showToast("Invalid promo code");
                    }
                  }}
                  style={{
                    background: "var(--brand-primary)",
                    color: "#000",
                    border: "none",
                    padding: "0.65rem 1rem",
                    fontWeight: 700,
                    fontSize: "0.825rem",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                Try: <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>MUSCLEMAX10</span> for 10% off
              </p>
            </div>

            <div style={{ height: "1px", background: "#292929", marginBottom: "1.25rem" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>Grand Total</span>
              <span style={{ fontWeight: 900, color: "var(--brand-primary)", fontSize: "1.5rem" }}>
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                if (!user) { navigate("/login"); return; }
                navigate("/checkout");
              }}
              style={{ fontSize: "1rem", padding: "1rem" }}
            >
              Proceed to Checkout →
            </button>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {["UPI", "Card", "COD", "Netbanking"].map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    background: "#1a1a1a",
                    border: "1px solid #292929",
                    borderRadius: "4px",
                    padding: "0.2rem 0.5rem",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .cart-item-row { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
