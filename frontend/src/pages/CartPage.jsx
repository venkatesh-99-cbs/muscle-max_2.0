import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="section container">
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <span style={{ fontSize: "3rem", marginBottom: "1rem", display: "block" }}>🔒</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Login to View Your Cart</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Please sign in to your Muscle Max account to manage your items and proceed to checkout.
          </p>
          <div className="flex-center" style={{ gap: "1rem" }}>
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];
  const total = parseFloat(cart?.total || 0);
  const freeShippingThreshold = 999;
  const isFreeShipping = total >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - total);

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            Shopping Cart
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Review your selected supplement formulas before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <span style={{ fontSize: "3.5rem", marginBottom: "1rem", display: "block" }}>🛒</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your cart is empty</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Looks like you haven't added any fitness supplements to your cart yet.
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* Left Column: Items List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Free Shipping Notice */}
              <div
                className="card-glass"
                style={{
                  padding: "1rem 1.25rem",
                  borderLeft: isFreeShipping ? "4px solid var(--success)" : "4px solid var(--brand-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: isFreeShipping ? "var(--success)" : "var(--text-primary)" }}>
                    {isFreeShipping ? "🎉 You've unlocked FREE Shipping!" : `Add ₹${amountToFreeShipping.toFixed(0)} more for FREE Delivery!`}
                  </span>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
                    Standard pan-India delivery charges apply under ₹999.
                  </p>
                </div>
              </div>

              {items.map((item) => {
                const product = item.product || {};
                const lineTotal = (parseFloat(product.price || 0) * item.quantity).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      gap: "1.25rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: "5rem",
                        height: "5rem",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-elevated)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: "2rem" }}>⚡</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: "1 1 200px" }}>
                      <Link
                        to={`/products/${product.id}`}
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "var(--text-primary)",
                          textDecoration: "none",
                          display: "block",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {product.name}
                      </Link>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                        ₹{parseFloat(product.price || 0).toLocaleString("en-IN")} each
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex" style={{ alignItems: "center", gap: "0.75rem" }}>
                        <div
                          className="flex"
                          style={{
                            alignItems: "center",
                            background: "var(--bg-surface)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-moderate)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItem(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-primary)",
                              padding: "0.25rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "1rem",
                            }}
                          >
                            -
                          </button>
                          <span style={{ padding: "0.25rem 0.5rem", fontWeight: 700, minWidth: "2rem", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-primary)",
                              padding: "0.25rem 0.75rem",
                              cursor: "pointer",
                              fontSize: "1rem",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--danger)", padding: "0.3rem 0.6rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--brand-primary)" }}>
                        ₹{parseFloat(lineTotal).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem" }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div className="flex-between" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                  <span>Subtotal ({items.length} unique item{items.length > 1 ? "s" : ""})</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex-between" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                  <span>Estimated Shipping</span>
                  <span style={{ color: isFreeShipping ? "var(--success)" : "var(--text-primary)", fontWeight: 600 }}>
                    {isFreeShipping ? "FREE" : "₹99.00"}
                  </span>
                </div>

                <div className="divider" />

                <div className="flex-between" style={{ fontSize: "1.25rem", fontWeight: 900 }}>
                  <span>Total Due</span>
                  <span style={{ color: "var(--brand-primary)" }}>
                    ₹{(total + (isFreeShipping ? 0 : 99)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                variant="primary"
                className="btn-full"
                onClick={() => navigate("/checkout")}
                style={{ marginBottom: "1rem" }}
              >
                Proceed to Checkout →
              </Button>

              <Link to="/products" className="btn btn-secondary btn-full" style={{ textAlign: "center" }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
