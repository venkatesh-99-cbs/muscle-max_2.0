import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectUrl);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#151515",
          border: "1px solid #292929",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "3.5rem",
              height: "3.5rem",
              background: "var(--brand-primary)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#000",
              margin: "0 auto 1rem",
              boxShadow: "var(--shadow-glow-sm)",
            }}
          >
            M
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.3rem" }}>
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Log in to your MuscleMax account</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: "0.5rem", padding: "0.9rem", fontSize: "1rem" }}
          >
            {loading ? "Logging in…" : "LOG IN"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--brand-primary)", fontWeight: 700 }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
