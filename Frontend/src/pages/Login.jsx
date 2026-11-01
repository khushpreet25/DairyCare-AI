import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    // Validate email
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      const token = response.data?.token;

      // Make sure token exists
      if (!token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      // Store JWT token
      localStorage.setItem("token", token);

      // Store user information if returned by backend
      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Redirect to dashboard
      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // GO TO REGISTER
  // =========================================================

  function handleRegister() {
    navigate("/register");
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="professional-login">

      {/* =====================================================
          BRAND SECTION
      ===================================================== */}

      <section className="login-brand">

        <div className="brand-inner">

          <div className="brand-mark">
            DC
          </div>

          <div className="brand-name">
            DairyCare <span>AI</span>
          </div>

          <div className="brand-line"></div>

          <h1>
            Intelligent Dairy
            <br />
            Farm Management
          </h1>

          <p className="brand-description">
            A secure and intelligent platform for
            managing farms, livestock health,
            nutrition, and daily operations.
          </p>

          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="brand-features">

            {/* FARM MANAGEMENT */}

            <div className="brand-feature">

              <div className="feature-icon">
                F
              </div>

              <div>
                <strong>
                  Farm Management
                </strong>

                <span>
                  Centralized farm operations
                </span>
              </div>

            </div>

            {/* ANIMAL HEALTH */}

            <div className="brand-feature">

              <div className="feature-icon">
                H
              </div>

              <div>
                <strong>
                  Animal Health
                </strong>

                <span>
                  Complete livestock health records
                </span>
              </div>

            </div>

            {/* INTELLIGENT INSIGHTS */}

            <div className="brand-feature">

              <div className="feature-icon">
                A
              </div>

              <div>
                <strong>
                  Intelligent Insights
                </strong>

                <span>
                  Data-driven farm decisions
                </span>
              </div>

            </div>

          </div>

          <div className="brand-footer">
            DairyCare AI Platform
          </div>

        </div>

      </section>


      {/* =====================================================
          LOGIN SECTION
      ===================================================== */}

      <section className="login-section">

        <div className="login-container">

          {/* =================================================
              MOBILE BRAND
          ================================================= */}

          <div className="mobile-brand">

            <div className="brand-mark">
              DC
            </div>

            <div className="brand-name">
              DairyCare <span>AI</span>
            </div>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="login-card">

            {/* HEADING */}

            <div className="login-heading">

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to access your DairyCare AI
                account.
              </p>

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="login-alert">

                <div className="alert-icon">
                  !
                </div>

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="field">

                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>


              {/* PASSWORD */}

              <div className="field">

                <div className="field-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                </div>

                <div className="password-input">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}

              </button>

            </form>


            {/* =================================================
                REGISTER LINK
            ================================================= */}

            <div className="register-link">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
              >
                Create an account
              </button>

            </div>


            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <div className="security-note">

              <span className="security-icon">
                ✓
              </span>

              <div>

                <strong>
                  Secure access
                </strong>

                <p>
                  Your credentials are protected
                  using secure authentication.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              COPYRIGHT
          ================================================= */}

          <p className="login-copyright">
            © 2026 DairyCare AI. All rights reserved.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Login;