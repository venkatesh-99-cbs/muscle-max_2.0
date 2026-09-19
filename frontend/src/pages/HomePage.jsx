import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  ZapIcon,
  ShieldCheckIcon,
  TruckIcon,
  LockIcon,
  CheckIcon,
  StarIcon,
  HeartIcon,
  ChatIcon,
  ProteinIcon,
  DumbbellIcon,
  LeafIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  InstagramIcon,
} from "../components/common/Icons";

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
  { icon: <CheckIcon size={26} color="var(--brand-primary)" />, title: "Quality Tested", desc: "Premium batch-tested nutrition products from verified manufacturers." },
  { icon: <ShieldCheckIcon size={26} color="var(--brand-primary)" />, title: "100% Genuine", desc: "Direct brand sourcing with zero counterfeit tolerance, guaranteed." },
  { icon: <TruckIcon size={26} color="var(--brand-primary)" />, title: "Fast Dispatch", desc: "Ships within 24–48 hrs Pan-India via Blue Dart & DTDC express." },
  { icon: <LockIcon size={26} color="var(--brand-primary)" />, title: "Secure Checkout", desc: "Safe encrypted checkout with UPI, card, and cash on delivery." },
];

const STATS = [
  { number: "50K+", label: "Happy Customers" },
  { number: "200+", label: "Premium Products" },
  { number: "4.8", label: "Average Rating", hasStar: true },
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
    try {
      setAddingId(product.id);
      await addItem(product.id, 1, product);
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
    showToast(isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist!");
  };

  const PRODUCT_ICONS = {
    Protein: <ProteinIcon size={34} color="var(--brand-primary)" />,
    "Performance Supplements": <DumbbellIcon size={34} color="var(--brand-primary)" />,
    "Health & Nutrition": <LeafIcon size={34} color="var(--brand-primary)" />,
  };

  return (
    <div>
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* ═══════════════════════════════════════
          HERO SECTION (Cinematic Background Image)
          ═══════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "620px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "6.5rem 1.5rem 5.5rem",
          backgroundImage: "linear-gradient(180deg, rgba(8,8,8,0.22) 0%, rgba(8,8,8,0.42) 55%, #0a0a0a 100%), url('/images/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          backgroundRepeat: "no-repeat",
          overflow: "hidden",
        }}
      >
        {/* Subtle Lime Ambient Glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(158,230,0,0.09) 0%, rgba(10,10,10,0) 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "880px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(18,18,18,0.8)",
              border: "1px solid rgba(158,230,0,0.3)",
              backdropFilter: "blur(10px)",
              padding: "0.45rem 1.1rem",
              borderRadius: "99px",
              marginBottom: "1.75rem",
              boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            }}
          >
            <ZapIcon size={14} color="var(--brand-primary)" />
            <span
              style={{
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              100% Authentic Indian Sports Nutrition
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 4.8rem)",
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "1rem",
              textTransform: "uppercase",
              textShadow: "0 4px 24px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9)",
            }}
          >
            FUEL YOUR{" "}
            <span
              style={{
                color: "var(--brand-primary)",
                display: "inline-block",
                textShadow: "0 0 35px rgba(158,230,0,0.4), 0 3px 12px rgba(0,0,0,0.9)",
              }}
            >
              PEAK PERFORMANCE
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "#ffffff",
              maxWidth: "640px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.65,
              fontWeight: 500,
              textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,1)",
            }}
          >
            Engineered for bodybuilders, athletes, and fitness enthusiasts across India.
            Pure lab-tested proteins, high-octane pre-workouts, and premium recovery formulas.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/products"
              className="btn btn-primary"
              style={{
                padding: "0.95rem 2.2rem",
                fontSize: "1rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              SHOP CATALOG →
            </Link>

            <button
              onClick={() => {
                const btn = document.getElementById("chat-widget-toggle");
                if (btn) btn.click();
              }}
              className="btn btn-secondary"
              style={{
                padding: "0.95rem 1.8rem",
                fontSize: "1rem",
                fontWeight: 700,
                background: "rgba(20,20,20,0.85)",
                border: "1px solid #333",
                backdropFilter: "blur(8px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ChatIcon size={18} color="var(--brand-primary)" />
              <span>Ask AI Supplement Advisor</span>
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
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "var(--brand-primary)",
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.25rem",
                }}
              >
                <span>{s.number}</span>
                {s.hasStar && <StarIcon size={18} color="var(--brand-primary)" filled={true} />}
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
          OUR TOP PRODUCTS
          ═══════════════════════════════════════ */}
      <section className="section" id="shop" style={{ background: "#0b0b0b" }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="section-label">Bestsellers</span>
              <h2 style={{ color: "#fff", marginBottom: "0.25rem" }}>OUR TOP PRODUCTS</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
                Quality nutrition for elite performance and maximum gains.
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
                  {/* Wishlist button */}
                  <button
                    className={`wishlist-btn${isWishlisted(product.id) ? " active" : ""}`}
                    onClick={(e) => handleWishlist(e, product)}
                    title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <HeartIcon
                      size={18}
                      filled={isWishlisted(product.id)}
                      color={isWishlisted(product.id) ? "#ef4444" : "#ffffff"}
                    />
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
                    style={{ display: product.image ? "none" : "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {PRODUCT_ICONS[product.category?.name] || <ZapIcon size={32} color="var(--brand-primary)" />}
                  </div>

                  <div className="product-card-body">
                    <div className="product-card-category">{product.category?.name || "Supplement"}</div>
                    <div className="product-card-name" title={product.name}>{product.name}</div>
                    <div className="product-card-rating" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <StarIcon size={14} color="#f59e0b" filled={true} />
                      <span>4.8 · 120+ Reviews</span>
                    </div>
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
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(158,230,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
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
              { icon: <MailIcon size={26} color="var(--brand-primary)" />, label: "Email", value: "support@musclemax.in" },
              { icon: <PhoneIcon size={26} color="var(--brand-primary)" />, label: "Phone", value: "+91-98765-43210" },
              { icon: <ClockIcon size={26} color="var(--brand-primary)" />, label: "Hours", value: "Mon–Sat, 10 AM – 7 PM IST" },
              { icon: <InstagramIcon size={26} color="var(--brand-primary)" />, label: "Instagram", value: "@musclemax.in" },
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
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>{item.icon}</div>
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
                showToast("Subscribed successfully!");
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
