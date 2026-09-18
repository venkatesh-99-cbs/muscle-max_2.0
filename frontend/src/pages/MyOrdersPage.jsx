import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listOrders } from "../services/ordersApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await listOrders();
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
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
      <span className={`badge ${classMap[s] || "badge-default"}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            My Orders
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Track the live shipment status and view details of your previous orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
            <span style={{ fontSize: "3rem", marginBottom: "1rem", display: "block" }}>📦</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>No orders placed yet</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              You haven't made any purchases yet. Your confirmed orders will show up here.
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => {
              const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div className="flex" style={{ alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      Placed on {formattedDate}
                    </div>
                  </div>

                  <div className="flex" style={{ alignItems: "center", gap: "2rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        Total Amount
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--brand-primary)" }}>
                        ₹{parseFloat(order.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                      View Order →
                    </Link>
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
