import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct, listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  ShieldCheckIcon,
  TruckIcon,
  RotateCcwIcon,
  StarIcon,
  HeartIcon,
  BotIcon,
  FileTextIcon,
  UserIcon,
  AlertCircleIcon,
  ProteinIcon,
  DumbbellIcon,
  LeafIcon,
  ZapIcon,
} from "../components/common/Icons";

function renderCategoryIcon(catName) {
  if (catName === "Protein") return <ProteinIcon size={44} color="var(--brand-primary)" />;
  if (catName === "Performance Supplements") return <DumbbellIcon size={44} color="var(--brand-primary)" />;
  if (catName === "Health & Nutrition") return <LeafIcon size={44} color="var(--brand-primary)" />;
  return <ZapIcon size={44} color="var(--brand-primary)" />;
}


function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button className={`accordion-header${open ? " open" : ""}`} onClick={() => setOpen((v) => !v)}>
        {title}
        <span style={{ fontSize: "1.1rem", transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    (async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data);
        // load related
        const allRes = await listProducts({});
        const all = Array.isArray(allRes.data) ? allRes.data : allRes.data?.results || [];
        const related = all
          .filter((p) => p.id !== id && p.category?.name === res.data?.category?.name)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Could not load product details. It may not exist.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addItem(product.id, quantity, product);
      showToast(`✓ Added ${quantity} item${quantity > 1 ? "s" : ""} to your cart!`);
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleAskAI = () => {
    const btn = document.getElementById("chat-widget-toggle");
    if (btn) {
      btn.click();
      window.dispatchEvent(
        new CustomEvent("musclemax:chat-context", {
          detail: {
            prompt: `Tell me about ${product?.name} — ingredients, dosage and who should use it.`,
            label: `Ask about ${product?.name}`,
          },
        })
      );
    }
  };

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>;

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}><AlertCircleIcon size={48} color="#94a3b8" /></div>
        <h2 style={{ color: "#fff", marginBottom: "0.75rem" }}>{error || "Product not found"}</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          ← Back to Products
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div style={{ minHeight: "80vh", background: "#0b0b0b", padding: "3rem 0 5rem" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          <Link to="/" style={{ color: "var(--text-muted)" }} onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")} onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: "var(--text-muted)" }} onMouseOver={(e) => (e.currentTarget.style.color = "var(--brand-primary)")} onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>Products</Link>
          <span>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 420px) 1fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* Image */}
          <div>
            <div
              style={{
                background: "#111",
                border: "1px solid #292929",
                borderRadius: "var(--radius-xl)",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: "1rem",
              }}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2rem" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentNode.querySelector(".img-fallback").style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="img-fallback"
                style={{
                  width: "100%",
                  height: "100%",
                  display: product.image ? "none" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {renderCategoryIcon(product.category?.name)}
              </div>
            </div>
            {/* Ask AI button */}
            <button
              onClick={handleAskAI}
              style={{
                width: "100%",
                padding: "0.85rem",
                background: "#14171d",
                border: "1px solid rgba(158,230,0,0.35)",
                borderRadius: "var(--radius-md)",
                color: "var(--brand-primary)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all var(--transition-fast)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#1b2129")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#14171d")}
            >
              <BotIcon size={18} color="var(--brand-primary)" />
              <span>Ask AI About This Product</span>
            </button>
          </div>

          {/* Info */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <span className="badge badge-brand" style={{ fontSize: "0.7rem" }}>
                {product.category?.name || "Supplement"}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
              {product.name}
            </h1>
            <div style={{ color: "#ffd700", fontSize: "0.9rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <StarIcon size={15} color="#ffb800" />
              <span>4.8 &nbsp;·&nbsp;</span>
              <span style={{ color: "var(--text-muted)" }}>120+ reviews</span>
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--brand-primary)", marginBottom: "1.5rem" }}>
              ₹{parseFloat(product.price).toLocaleString("en-IN")}
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "2rem", fontSize: "0.9375rem" }}>
              {product.description}
            </p>

            {/* Quantity + Add to Cart */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <div className="qty-stepper">
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(20, q + 1))}>+</button>
              </div>
              <Button
                variant="primary"
                loading={adding}
                onClick={handleAddToCart}
                style={{ flex: 1, minWidth: "180px" }}
              >
                {adding ? "Adding…" : "Add to Cart"}
              </Button>
              <button
                onClick={() => {
                  toggleItem(product);
                  showToast(wishlisted ? "Removed from wishlist" : "Added to wishlist!");
                }}
                style={{
                  width: "3rem",
                  height: "3rem",
                  border: wishlisted ? "1px solid rgba(239,68,68,.5)" : "1px solid #333",
                  borderRadius: "var(--radius-md)",
                  background: wishlisted ? "rgba(239,68,68,.1)" : "#1a1a1a",
                  color: wishlisted ? "var(--danger)" : "var(--text-muted)",
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <HeartIcon
                  size={19}
                  filled={wishlisted}
                  color={wishlisted ? "#ef4444" : "#94a3b8"}
                />
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {[
                { icon: <ShieldCheckIcon size={15} color="var(--brand-primary)" />, label: "100% Authentic" },
                { icon: <TruckIcon size={15} color="var(--brand-primary)" />, label: "Free Shipping >₹999" },
                { icon: <RotateCcwIcon size={15} color="var(--brand-primary)" />, label: "7-Day Returns" },
              ].map((b) => (
                <span
                  key={b.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    background: "#1a1a1a",
                    border: "1px solid #292929",
                    borderRadius: "var(--radius-full)",
                    padding: "0.35rem 0.85rem",
                  }}
                >
                  {b.icon} {b.label}
                </span>
              ))}
            </div>

            {/* Accordion Info */}
            <div>
              {product.how_to_use && (
                <AccordionItem
                  title={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                      <FileTextIcon size={15} color="var(--brand-primary)" />
                      <span>How to Use</span>
                    </span>
                  }
                >
                  <p>{product.how_to_use}</p>
                </AccordionItem>
              )}
              {product.who_should_use && (
                <AccordionItem
                  title={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                      <UserIcon size={15} color="var(--brand-primary)" />
                      <span>Who Should Use</span>
                    </span>
                  }
                >
                  <p>{product.who_should_use}</p>
                </AccordionItem>
              )}
              {product.age_recommendation && (
                <AccordionItem
                  title={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                      <ShieldCheckIcon size={15} color="var(--brand-primary)" />
                      <span>Age Recommendation</span>
                    </span>
                  }
                >
                  <p>{product.age_recommendation}</p>
                </AccordionItem>
              )}
              {product.precautions && (
                <AccordionItem
                  title={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                      <AlertCircleIcon size={15} color="var(--brand-primary)" />
                      <span>Precautions & Safety</span>
                    </span>
                  }
                >
                  <p>{product.precautions}</p>
                </AccordionItem>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "5rem" }}>
            <div style={{ marginBottom: "2rem" }}>
              <span className="section-label">You May Also Like</span>
              <h2 style={{ color: "#fff" }}>Related Products</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  className="product-card"
                  onClick={() => navigate(`/products/${rp.id}`)}
                >
                  <div className="product-card-image-placeholder">
                    {renderCategoryIcon(rp.category?.name)}
                  </div>
                  <div className="product-card-body">
                    <div className="product-card-category">{rp.category?.name}</div>
                    <div className="product-card-name">{rp.name}</div>
                    <div className="product-card-footer" style={{ marginTop: "0.75rem" }}>
                      <div className="product-card-price">₹{parseFloat(rp.price).toLocaleString("en-IN")}</div>
                      <span
                        style={{ fontSize: "0.8rem", color: "var(--brand-primary)", fontWeight: 700, cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/products/${rp.id}`); }}
                      >
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Responsive grid breakpoint */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
