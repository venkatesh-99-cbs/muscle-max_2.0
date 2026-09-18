import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrder } from "../services/ordersApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/orders/${id}`);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError("Unable to load order details. You may not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section container">
        <div className="card" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "1rem" }}>{error || "Order not found"}</h2>
          <Link to="/orders" className="btn btn-secondary">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    const classMap = {
      pending: "status-pending",
      paid: "status-paid",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return (
      <span className={`badge ${classMap[s] || "badge-default"}`} style={{ fontSize: "0.8125rem" }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = order.items || [];

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          <Link to="/" style={{ color: "var(--text-secondary)" }}>Home</Link>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <Link to="/orders" style={{ color: "var(--text-secondary)" }}>My Orders</Link>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Order #{order.id}</span>
        </div>

        {/* Top Header Card */}
        <div
          className="card"
          style={{
            padding: "2rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div className="flex" style={{ alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Order #{order.id}</h1>
              {getStatusBadge(order.status)}
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Placed on {formattedDate}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Billed
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--brand-primary)" }}>
              ₹{parseFloat(order.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Items List */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Items Ordered ({items.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {items.map((item) => {
                const product = item.product || {};
                const price = parseFloat(item.price_at_purchase || product.price || 0);
                const lineTotal = price * item.quantity;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "1.25rem",
                      borderBottom: "1px solid var(--border-subtle)",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div
                        style={{
                          width: "3.5rem",
                          height: "3.5rem",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-elevated)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        ⚡
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {product.name || `Product #${item.product_id || item.product}`}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          Qty: {item.quantity} × ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" style={{ padding: "1.75rem" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                Delivery Information
              </h4>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                {order.shipping_address}
              </div>
            </div>

            <div className="card" style={{ padding: "1.75rem" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
                Payment Method
              </h4>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                {order.payment_method || "Cash on Delivery"}
              </div>
            </div>

            <div className="card-glass" style={{ padding: "1.5rem", textAlign: "center" }}>
              <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>💬</span>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Questions about this order?</div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Our AI coach and customer support can help you track or answer delivery questions.
              </p>
              <button
                onClick={() => {
                  const chatBtn = document.getElementById("chat-widget-toggle");
                  if (chatBtn) chatBtn.click();
                }}
                className="btn btn-secondary btn-sm"
              >
                Open AI Chat Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
