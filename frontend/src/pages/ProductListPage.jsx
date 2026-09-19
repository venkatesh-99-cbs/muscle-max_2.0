import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import {
  SearchIcon,
  HeartIcon,
  StarIcon,
  ProteinIcon,
  DumbbellIcon,
  LeafIcon,
  ZapIcon,
} from "../components/common/Icons";

const ALL_CATEGORIES = [
  { label: "All", value: "" },
  { label: "Protein", value: "Protein" },
  { label: "Performance", value: "Performance Supplements" },
  { label: "Health & Nutrition", value: "Health & Nutrition" },
];

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
];

function renderCategoryIcon(catName) {
  if (catName === "Protein") return <ProteinIcon size={38} color="var(--brand-primary)" />;
  if (catName === "Performance Supplements") return <DumbbellIcon size={38} color="var(--brand-primary)" />;
  if (catName === "Health & Nutrition") return <LeafIcon size={38} color="var(--brand-primary)" />;
  return <ZapIcon size={38} color="var(--brand-primary)" />;
}


export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

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
      setLoading(true);
      try {
        const res = await listProducts({});
        const items = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setProducts(items);
      } catch (err) {
        console.error("Failed to load products", err);
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
    showToast(isWishlisted(product.id) ? "Removed from wishlist" : "♥ Added to wishlist!");
  };

  // Filter + search + sort
  let filtered = products;

  if (activeCategory) {
    filtered = filtered.filter((p) => {
      const cat = (p.category?.name || p.category || "").toLowerCase();
      const search = activeCategory.toLowerCase();
      return cat.includes(search) || (p.name || "").toLowerCase().includes(search);
    });
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category?.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }

  if (sort === "price_asc") filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  if (sort === "name_asc") filtered = [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div style={{ minHeight: "80vh", background: "#0b0b0b", padding: "3rem 0" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-label">Catalog</span>
          <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            OUR PRODUCTS
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Quality nutrition for better performance.</p>
        </div>

        {/* Search + Sort Row */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "1.75rem",
          }}
        >
          {/* Search */}
          <div className="search-bar-wrap" style={{ flex: 1, minWidth: "220px" }}>
            <span className="search-bar-icon"><SearchIcon size={16} color="var(--text-muted)" /></span>
            <input
              type="text"
              id="product-search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              padding: "0.72rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`filter-chip${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => {
                if (cat.value === "") searchParams.delete("category");
                else setSearchParams({ category: cat.value });
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Showing <strong style={{ color: "var(--brand-primary)" }}>{filtered.length}</strong> product{filtered.length !== 1 ? "s" : ""}
            {activeCategory ? ` in "${activeCategory}"` : ""}
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="page-loading"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <div style={{ marginBottom: "1rem" }}><SearchIcon size={48} color="#475569" /></div>
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>No products found</h3>
            <p style={{ color: "var(--text-muted)" }}>Try a different search or category filter.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filtered.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {/* Wishlist */}
                <button
                  className={`wishlist-btn${isWishlisted(product.id) ? " active" : ""}`}
                  onClick={(e) => handleWishlist(e, product)}
                  title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon
                    size={17}
                    filled={isWishlisted(product.id)}
                    color={isWishlisted(product.id) ? "#ef4444" : "#94a3b8"}
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
                  style={{ display: product.image ? "none" : "flex" }}
                >
                  {renderCategoryIcon(product.category?.name)}
                </div>

                <div className="product-card-body">
                  <div className="product-card-category">{product.category?.name || "Supplement"}</div>
                  <div className="product-card-name" title={product.name}>{product.name}</div>
                  <div className="product-card-rating" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <StarIcon size={14} color="#ffb800" />
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
    </div>
  );
}
