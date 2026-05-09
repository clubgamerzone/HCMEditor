import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, FacebookAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";

const facebookProvider = new FacebookAuthProvider();

const ALLOWED_EMAIL = "josel.demoya@gmail.com";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  function switchMode(m) {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (email.toLowerCase() !== ALLOWED_EMAIL) {
      setError("Access denied. This email is not authorized.");
      return;
    }

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Invalid credentials. Please try again.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      };
      setError(messages[err.code] ?? "Something went wrong. Please try again.");
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

        <div className="mode-tabs">
          <button
            className={mode === "login" ? "mode-tab active" : "mode-tab"}
            onClick={() => switchMode("login")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === "register" ? "mode-tab active" : "mode-tab"}
            onClick={() => switchMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>
          {mode === "register" && (
            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
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
