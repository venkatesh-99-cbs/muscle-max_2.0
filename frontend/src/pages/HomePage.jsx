import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";

const CATEGORIES = [
  { name: "Proteins", icon: "🥛", desc: "Isolate & Whey for lean muscle synthesis", slug: "protein" },
  { name: "Pre-Workouts", icon: "⚡", desc: "Explosive energy & intense vascular focus", slug: "pre-workout" },
  { name: "Creatine", icon: "💪", desc: "Pure micronized strength & power amplification", slug: "creatine" },
  { name: "Recovery & Aminos", icon: "🌿", desc: "Rapid recovery, BCAAs & daily health", slug: "recovery" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await listProducts({});
        const items = Array.isArray(res.data) ? res.data : res.data.results || [];
        setFeaturedProducts(items.slice(0, 4));
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setAddingId(productId);
      await addItem(productId, 1);
      setToastMessage("Added to cart!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage("Failed to add to cart");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
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

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "5rem 0 4rem",
          background: "radial-gradient(ellipse at 50% 10%, rgba(249,115,22,0.15) 0%, rgba(15,15,16,0.95) 70%)",
          borderBottom: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <span
            className="badge badge-warning"
            style={{ marginBottom: "1.25rem", padding: "0.4rem 1rem", fontSize: "0.8125rem" }}
          >
            🔥 100% Authentic Indian Sports Nutrition
          </span>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
              margin: "0 auto 1.5rem",
              background: "linear-gradient(to bottom, #ffffff, #a1a1aa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            FUEL YOUR BODY. <br />
            <span
              style={{
                background: "var(--gradient-brand)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              UNLEASH MAXIMUM POWER.
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--text-secondary)",
              maxWidth: "640px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Premium batch-tested whey protein, explosive pre-workouts, and essential recovery formulas.
            Grounded in scientific precision.
          </p>

          <div
            className="flex-center"
            style={{ gap: "1rem", flexWrap: "wrap", marginBottom: "3.5rem" }}
          >
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Catalog →
            </Link>
            <button
              onClick={() => {
                const chatBtn = document.getElementById("chat-widget-toggle");
                if (chatBtn) chatBtn.click();
              }}
              className="btn btn-secondary btn-lg"
            >
              💬 Ask AI Nutritionist
            </button>
          </div>

          {/* Value Props Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div className="card-glass" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🛡️</div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                100% Certified Authentic
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Zero counterfeit tolerance
              </p>
            </div>
            <div className="card-glass" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>⚡</div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Fast Pan-India Delivery
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Dispatch in 24–48 hours
              </p>
            </div>
            <div className="card-glass" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>📦</div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Free Shipping &gt; ₹999
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Save more on every order
              </p>
            </div>
            <div className="card-glass" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>🤖</div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Grounded AI Coach
              </h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Answers from verified data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section" style={{ background: "var(--bg-base)" }}>
        <div className="container">
          <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Shop by Category
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Targeted nutrition tailored for your specific fitness goals
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="card"
                style={{
                  padding: "2rem",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                  }}
                >
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {cat.desc}
                </p>
                <span
                  style={{
                    color: "var(--brand-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginTop: "auto",
                    paddingTop: "0.5rem",
                  }}
                >
                  Browse {cat.name} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section" style={{ background: "var(--bg-surface)" }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                Featured Formulations
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
                Top-rated bestsellers trusted by athletes across India
              </p>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              View Full Catalog ({featuredProducts.length > 0 ? "19+" : "All"}) →
            </Link>
          </div>

          {loading ? (
            <div className="page-loading">
              <Spinner size="lg" />
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-card-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="product-card-image-placeholder"
                    style={{ display: product.image ? "none" : "flex" }}
                  >
                    ⚡
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-category">
                      {product.category?.name || "Supplement"}
                    </div>
                    <div className="product-card-name" title={product.name}>
                      {product.name}
                    </div>
                    <div className="product-card-footer" style={{ marginTop: "1rem" }}>
                      <div className="product-card-price">
                        ₹{parseFloat(product.price).toLocaleString("en-IN")}
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={addingId === product.id}
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
