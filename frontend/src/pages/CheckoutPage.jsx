import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/ordersApi";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, navigate]);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.total || 0);
  const isFreeShipping = subtotal >= 999;
  const shippingCharge = isFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingCharge;

  if (items.length === 0 && !loading) {
    return (
      <div className="section container">
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "1rem" }}>Your Cart is Empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Add some products to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      setError("Please fill in all shipping address fields.");
      return;
    }

    const formattedAddress = `${shippingAddress.fullName}, Phone: ${shippingAddress.phone}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`;

    try {
      setLoading(true);
      const res = await createOrder({
        shipping_address: formattedAddress,
        payment_method: paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid (Demo)",
      });
      await fetchCart(); // Refresh cart to empty state
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      console.error("Order creation failed", err);
      setError(err.response?.data?.detail || "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            Secure Checkout
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Enter your delivery information and confirm your order.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2.5rem",
              alignItems: "start",
            }}
          >
            {/* Left: Shipping & Payment Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Shipping Address Box */}
              <div className="card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                  1. Delivery Address
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Street Address & Flat / Door No. *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="e.g. 104, Sunrise Heights, 4th Cross"
                    className="form-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card" style={{ padding: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                  2. Payment Method
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      background: paymentMethod === "cod" ? "rgba(249,115,22,0.08)" : "var(--bg-elevated)",
                      border: paymentMethod === "cod" ? "1px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>💵 Cash on Delivery (COD)</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        Pay cash or UPI upon delivery to your doorstep.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      background: paymentMethod === "prepaid" ? "rgba(249,115,22,0.08)" : "var(--bg-elevated)",
                      border: paymentMethod === "prepaid" ? "1px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "prepaid"}
                      onChange={() => setPaymentMethod("prepaid")}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>💳 UPI / Instant NetBanking (Instant Demo Confirmation)</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                        Verified instant transaction demo.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem" }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {items.map((item) => (
                  <div key={item.id} className="flex-between" style={{ fontSize: "0.875rem" }}>
                    <div style={{ maxWidth: "200px" }}>
                      <div style={{ fontWeight: 600 }}>{item.product?.name}</div>
                      <div style={{ color: "var(--text-muted)" }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ₹{(parseFloat(item.product?.price || 0) * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}

                <div className="divider" />

                <div className="flex-between" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex-between" style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                  <span>Delivery Charges</span>
                  <span style={{ color: isFreeShipping ? "var(--success)" : "var(--text-primary)" }}>
                    {isFreeShipping ? "FREE" : "₹99.00"}
                  </span>
                </div>

                <div className="divider" />

                <div className="flex-between" style={{ fontSize: "1.25rem", fontWeight: 900 }}>
                  <span>Total Amount</span>
                  <span style={{ color: "var(--brand-primary)" }}>
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="btn-full"
                loading={loading}
              >
                Place Order Now →
              </Button>

              <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                🔒 256-bit Encrypted Checkout • 100% Authentic Product Guarantee
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
