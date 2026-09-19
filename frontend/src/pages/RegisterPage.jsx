import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate(redirectUrl);
    } catch (err) {
      console.error("Registration failed", err);
      let errorMsg = "Registration failed. Please check the information provided.";
      if (err.response?.data?.email) {
        errorMsg = err.response.data.email[0];
      } else if (err.response?.data?.password) {
        errorMsg = err.response.data.password[0];
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
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
        padding: "2.5rem 1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#151515",
          border: "1px solid #292929",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header Logo */}
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
          <h1 style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.3rem" }}>
            Join MuscleMax
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Create an account for personalized nutrition & fast checkout
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Singh"
              className="form-input"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: "0.5rem", padding: "0.9rem", fontSize: "1rem" }}
          >
            {loading ? "Creating Account…" : "CREATE ACCOUNT"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            style={{ color: "var(--brand-primary)", fontWeight: 700 }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
