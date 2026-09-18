import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState("usage");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProduct(id);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Could not load product details. It may not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setAdding(true);
      await addItem(product.id, quantity);
      setToastMessage(`Added ${quantity} item(s) to your cart!`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Failed to add to cart");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="section container">
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <h2 style={{ marginBottom: "1rem" }}>{error || "Product not found"}</h2>
          <Link to="/products" className="btn btn-secondary">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-surface)",
            color: "var(--brand-primary)",
            border: "1px solid var(--brand-primary)",
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-glow)",
            zIndex: 100,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {toastMessage}
        </div>
      )}

      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          <Link to="/" style={{ color: "var(--text-secondary)" }}>Home</Link>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <Link to="/products" style={{ color: "var(--text-secondary)" }}>Products</Link>
          <span style={{ margin: "0 0.5rem" }}>/</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{product.name}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Left Column: Image */}
          <div>
            <div
              className="card"
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "var(--bg-card)",
                padding: "1rem",
              }}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  display: product.image ? "none" : "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "5rem" }}>⚡</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Muscle Max Authentic Formula
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              <div className="card-glass" style={{ padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem" }}>🔬</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Lab Certified</div>
              </div>
              <div className="card-glass" style={{ padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem" }}>🛡️</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>100% Genuine</div>
              </div>
              <div className="card-glass" style={{ padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.2rem" }}>🚀</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fast Delivery</div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Action */}
          <div>
            <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span className="badge badge-warning">
                {product.category?.name || "Supplement"}
              </span>
              {product.in_stock ? (
                <span className="badge badge-success">In Stock</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            <h1
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: "var(--brand-primary)",
                marginBottom: "1.5rem",
              }}
            >
              ₹{parseFloat(product.price).toLocaleString("en-IN")}
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 400, marginLeft: "0.5rem" }}>
                (Inclusive of all taxes)
              </span>
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "2rem" }}>
              {product.description || "Premium performance supplement engineered for athletes seeking maximum effectiveness and clean nutrition."}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div
              className="card-glass"
              style={{
                padding: "1.5rem",
                marginBottom: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Quantity:
                </span>
                <div className="flex" style={{ alignItems: "center", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-moderate)" }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !product.in_stock}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: "0.5rem 1rem", fontWeight: 700, minWidth: "3rem", textAlign: "center" }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.in_stock}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-primary)",
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex" style={{ gap: "1rem", flexWrap: "wrap" }}>
                <Button
                  size="lg"
                  variant="primary"
                  className="btn-full"
                  disabled={!product.in_stock}
                  loading={adding}
                  onClick={handleAddToCart}
                >
                  {product.in_stock ? `Add ${quantity} to Cart • ₹${(parseFloat(product.price) * quantity).toLocaleString("en-IN")}` : "Currently Out of Stock"}
                </Button>
              </div>
            </div>

            {/* Information Tabs */}
            <div>
              <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", gap: "1rem", marginBottom: "1rem" }}>
                <button
                  onClick={() => setActiveTab("usage")}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === "usage" ? "2px solid var(--brand-primary)" : "2px solid transparent",
                    color: activeTab === "usage" ? "var(--brand-primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    padding: "0.75rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  How to Use
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === "specs" ? "2px solid var(--brand-primary)" : "2px solid transparent",
                    color: activeTab === "specs" ? "var(--brand-primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    padding: "0.75rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("precautions")}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === "precautions" ? "2px solid var(--brand-primary)" : "2px solid transparent",
                    color: activeTab === "precautions" ? "var(--brand-primary)" : "var(--text-secondary)",
                    fontWeight: 600,
                    padding: "0.75rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  Precautions
                </button>
              </div>

              <div style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                {activeTab === "usage" && (
                  <div>
                    <p>{product.how_to_use || "Mix 1 scoop with 200-250ml of cold water or skimmed milk. Consume as recommended by your trainer or dietary requirements."}</p>
                    {product.who_should_use && (
                      <div style={{ marginTop: "1rem" }}>
                        <strong style={{ color: "var(--text-primary)" }}>Recommended for: </strong>
                        {product.who_should_use}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "specs" && (
                  <div>
                    {product.specs && Object.keys(product.specs).length > 0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                          {Object.entries(product.specs).map(([key, val]) => (
                            <tr key={key} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "0.5rem 0", fontWeight: 600, textTransform: "capitalize", color: "var(--text-primary)" }}>{key.replace(/_/g, " ")}</td>
                              <td style={{ padding: "0.5rem 0", textAlign: "right" }}>{String(val)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>Standard pharmaceutical-grade supplement formulation.</p>
                    )}
                  </div>
                )}
                {activeTab === "precautions" && (
                  <div>
                    <p>{product.precautions || "Store in a cool, dry place away from direct sunlight. Not intended for use by persons under 18 years of age or pregnant/lactating women. Consult your physician before using this product if you have any medical conditions."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
