import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listProducts } from "../services/productsApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";

const CATEGORIES = [
  { label: "All Categories", slug: "" },
  { label: "Protein", slug: "protein" },
  { label: "Pre-Workout", slug: "pre-workout" },
  { label: "Creatine", slug: "creatine" },
  { label: "Recovery", slug: "recovery" },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [addingId, setAddingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    const searchParam = searchParams.get("search") || "";
    setSelectedCategory(categoryParam);
    setSearchTerm(searchParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;
        const res = await listProducts(params);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [selectedCategory, searchTerm]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set("category", slug);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set("search", searchTerm.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

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
      setTimeout(() => setToastMessage(""), 2500);
    } catch (err) {
      setToastMessage("Failed to add to cart");
      setTimeout(() => setToastMessage(""), 2500);
    } finally {
      setAddingId(null);
    }
  };

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
        {/* Header Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            Supplements Catalog
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Explore lab-tested proteins, pre-workouts, creatines, and essential recovery blends.
          </p>
        </div>

        {/* Filter Bar: Search + Category Pills */}
        <div
          className="card"
          style={{
            padding: "1.25rem",
            marginBottom: "2.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              placeholder="Search supplements by name (e.g. Whey, Creatine, Pre-Workout)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
            {searchTerm && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("search");
                  setSearchParams(newParams);
                }}
              >
                Clear
              </Button>
            )}
          </form>

          {/* Category Pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`btn btn-sm ${
                  selectedCategory === cat.slug ? "btn-primary" : "btn-secondary"
                }`}
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / Loading / Empty State */}
        {loading ? (
          <div className="page-loading">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>No products found</h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
              We couldn't find any products matching your search criteria. Try removing filters or searching for another keyword.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedCategory("");
                setSearchTerm("");
                setSearchParams({});
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Showing {products.length} product{products.length > 1 ? "s" : ""}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {products.map((product) => (
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
                    <div className="flex-between" style={{ marginBottom: "0.4rem" }}>
                      <span className="product-card-category">
                        {product.category?.name || "Supplement"}
                      </span>
                      {product.in_stock ? (
                        <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>
                          In Stock
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>
                          Sold Out
                        </span>
                      )}
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
                        disabled={!product.in_stock}
                        loading={addingId === product.id}
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        {product.in_stock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
