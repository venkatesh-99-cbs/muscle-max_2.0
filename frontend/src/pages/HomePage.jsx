import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";

const CATEGORIES = [
  {
    name: "PROTEIN",
    slug: "protein",
    img: "/images/protein.png",
    desc: "Whey Protein, Casein Protein, Plant Protein, Mass Gainer and Protein Bars.",
  },
  {
    name: "CREATINE",
    slug: "creatine",
    img: "/images/creatine.png",
    desc: "Creatine Monohydrate for workout performance and training support.",
  },
  {
    name: "PRE-WORKOUT",
    slug: "pre-workout",
    img: "/images/pre-workout.png",
    desc: "Pre-Workout, BCAA, EAA, Glutamine, Citrulline Malate, Beta-Alanine and Electrolytes.",
  },
  {
    name: "PROTEIN BARS",
    slug: "protein-bars",
    img: "/images/proteinbars.png",
    desc: "Convenient protein-rich snacks for between meals or workouts.",
  },
  {
    name: "VITAMINS",
    slug: "vitamins",
    img: "/images/vitamins.png",
    desc: "Multivitamins, Omega-3, Vitamin D3, Magnesium, Zinc and Calcium.",
  },
  {
    name: "HEALTHY SNACKS",
    slug: "healthy-snacks",
    img: "/images/proteinbars.png",
    desc: "Nutritious snack options to complement your fitness lifestyle.",
  },
];

const TRUST_ITEMS = [
  { icon: "✓", title: "Quality", desc: "Premium batch-tested nutrition products from verified manufacturers." },
  { icon: "🛡️", title: "Genuine", desc: "100% authentic brands. Zero counterfeit tolerance, guaranteed." },
  { icon: "🚚", title: "Fast Delivery", desc: "Dispatch in 24–48 hrs. Ships Pan-India via Blue Dart & DTDC." },
  { icon: "🔒", title: "Secure", desc: "Safe checkout with UPI, card and COD payment options." },
];

const STATS = [
  { number: "50K+", label: "Happy Customers" },
  { number: "200+", label: "Premium Products" },
  { number: "4.8★", label: "Average Rating" },
  { number: "24h", label: "Dispatch Time" },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await listProducts({});
        const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setFeaturedProducts(items.slice(0, 6));
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    try {
      setAddingId(product.id);
      await addItem(product.id, 1);
      showToast("✓ Added to cart!");
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    showToast(isWishlisted(product.id) ? "Removed from wishlist" : "♥ Added to wishlist!");
  };

  const PRODUCT_ICONS = { Protein: "🥛", "Performance Supplements": "⚡", "Health & Nutrition": "🌿" };

  return (
    <div>
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "5rem 1.5rem 4rem",
          background: "linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), #0f0f0a",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div
          className="hero-orb"
          style={{ width: "500px", height: "500px", background: "rgba(183,255,0,0.07)", top: "-100px", left: "50%", transform: "translateX(-50%)" }}
        />
        <div
          className="hero-orb"
          style={{ width: "300px", height: "300px", background: "rgba(183,255,0,0.04)", bottom: "-80px", right: "10%" }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "860px" }}>
          <span
            className="badge badge-brand fade-in"
            style={{ marginBottom: "1.5rem", fontSize: "0.75rem" }}
          >
            🔥 100% Authentic Indian Sports Nutrition
          </span>

          <h1
            className="fade-in"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: "0",
              animationDelay: "0.05s",
            }}
          >
            FUEL YOUR{" "}
            <span style={{ color: "var(--brand-primary)", display: "inline-block" }}>
              PERFORMANCE
            </span>
          </h1>

          <p
            className="fade-in"
            style={{
              fontSize: "1.1rem",
              color: "#ccc",
              maxWidth: "580px",
              margin: "1.5rem auto 2.5rem",
              lineHeight: 1.65,
              animationDelay: "0.12s",
            }}
          >
            Premium nutrition products for your fitness journey. Trusted by 50,000+ athletes across India.
          </p>

          <div className="flex-center fade-in" style={{ gap: "1rem", flexWrap: "wrap", animationDelay: "0.2s" }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              SHOP NOW →
            </Link>
            <button
              onClick={() => {
                const btn = document.getElementById("chat-widget-toggle");
                if (btn) btn.click();
              }}
              className="btn btn-secondary btn-lg"
            >
              💬 Ask AI Nutritionist
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════ */}
      <section style={{ background: "#111", borderBottom: "1px solid #1a1a1a", padding: "2rem 0" }}>
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--brand-primary)", lineHeight: 1 }}>
                {s.number}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SHOP BY CATEGORY
          ═══════════════════════════════════════ */}
      <section className="section" id="categories" style={{ background: "#101010" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-label">Browse</span>
            <h2 style={{ color: "#fff", marginBottom: "0.5rem" }}>SHOP BY CATEGORY</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Explore nutrition products designed for your fitness goals.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="category-product-card"
                onClick={() => navigate(`/products?category=${cat.slug}`)}
              >
                <img src={cat.img} alt={cat.name} />
                <div className="category-product-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <span className="category-view">VIEW PRODUCTS →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS (OUR PRODUCTS)
          ═══════════════════════════════════════ */}
      <section className="section" id="shop" style={{ background: "#0b0b0b" }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="section-label">Bestsellers</span>
              <h2 style={{ color: "#fff", marginBottom: "0.25rem" }}>OUR PRODUCTS</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
                Quality nutrition for better performance.
              </p>
            </div>
            <Link to="/products" className="btn btn-outline-brand btn-sm">
              View All ({featuredProducts.length > 0 ? "19+" : "All"}) →
            </Link>
          </div>

          {loading ? (
            <div className="page-loading"><Spinner size="lg" /></div>
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
                  {/* Wishlist heart */}
                  <button
                    className={`wishlist-btn${isWishlisted(product.id) ? " active" : ""}`}
                    onClick={(e) => handleWishlist(e, product)}
                    title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isWishlisted(product.id) ? "♥" : "♡"}
                  </button>

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
                    {PRODUCT_ICONS[product.category?.name] || "⚡"}
                  </div>

                  <div className="product-card-body">
                    <div className="product-card-category">{product.category?.name || "Supplement"}</div>
                    <div className="product-card-name" title={product.name}>{product.name}</div>
                    <div className="product-card-rating">⭐ 4.8 · 120+ Reviews</div>
                    <div className="product-card-footer">
                      <div className="product-card-price">₹{parseFloat(product.price).toLocaleString("en-IN")}</div>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={addingId === product.id}
                        onClick={(e) => handleAddToCart(e, product)}
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

      {/* ═══════════════════════════════════════
          WHY MUSCLEMAX (TRUST)
          ═══════════════════════════════════════ */}
      <section className="section" style={{ background: "#151515" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="section-label">Why Us</span>
            <h2 style={{ color: "#fff" }}>WHY MUSCLEMAX?</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="trust-card">
                <span className="trust-card-icon" style={{ fontSize: "2rem" }}>{item.icon}</span>
                <h3>✓ {item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT SECTION
          ═══════════════════════════════════════ */}
      <section className="section" id="about" style={{ background: "#0b0b0b" }}>
        <div className="container" style={{ maxWidth: "780px", textAlign: "center" }}>
          <span className="section-label">Our Story</span>
          <h2 style={{ color: "#fff", marginBottom: "1.25rem" }}>ABOUT MUSCLEMAX</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.8 }}>
            MuscleMax is an online nutrition platform designed to make fitness nutrition simple, accessible, and
            convenient. We partner only with verified manufacturers and trusted brands to ensure every product
            you receive is 100% authentic, batch-tested, and safe. Our AI-powered assistant is here to guide you
            to the right supplement for your unique fitness goals.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link to="/products" className="btn btn-primary">
              Explore Our Range →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CONTACT SECTION
          ═══════════════════════════════════════ */}
      <section className="section" id="contact" style={{ background: "#111" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span className="section-label">Reach Out</span>
            <h2 style={{ color: "#fff" }}>CONTACT US</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {[
              { icon: "✉️", label: "Email", value: "support@musclemax.in" },
              { icon: "📞", label: "Phone", value: "+91-98765-43210" },
              { icon: "🕐", label: "Hours", value: "Mon–Sat, 10 AM – 7 PM IST" },
              { icon: "📸", label: "Instagram", value: "@musclemax.in" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #292929",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  textAlign: "center",
                  transition: "border-color var(--transition-fast)",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--brand-primary)")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "#292929")}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                <div style={{ color: "var(--brand-primary)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>
                  {item.label}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEWSLETTER STRIP
          ═══════════════════════════════════════ */}
      <section style={{ background: "#0b0b0b", padding: "4rem 1.5rem" }}>
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="newsletter-strip">
            <span className="section-label">Stay Updated</span>
            <h2 style={{ color: "#fff", marginBottom: "0.5rem" }}>GET EXCLUSIVE DEALS</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Subscribe to our newsletter and be the first to know about new products, offers, and fitness tips.
            </p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                showToast("🎉 Subscribed successfully!");
                e.target.reset();
              }}
            >
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email address..."
                required
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
