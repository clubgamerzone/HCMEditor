import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";

const facebookProvider = new FacebookAuthProvider();

const ALLOWED_EMAIL = "josel.demoya@gmail.com";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (email.toLowerCase() !== ALLOWED_EMAIL) {
      setError("Access denied. You are not authorized to use this tool.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookLogin() {
    setError("");
    setFbLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const userEmail = result.user.email?.toLowerCase();
      if (userEmail !== ALLOWED_EMAIL) {
        await signOut(auth);
        setError("Access denied. This Facebook account is not authorized.");
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Facebook sign-in failed. Please try again.");
      }
    } finally {
      setFbLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Hell Cemetery</h1>
        <h2>Enemy Settings Editor</h2>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="divider"><span>or</span></div>
        <button
          className="facebook-btn"
          onClick={handleFacebookLogin}
          disabled={fbLoading}
        >
          {fbLoading ? "Connecting..." : "Continue with Facebook"}
        </button>
      </div>
    </div>
  );
}
