import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setError("");
    setSuccess("");
  }


  // =====================================================
  // REGISTER
  // =====================================================

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");


    // Check required fields
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }


    // Check password confirmation
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }


    // Basic password validation
    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }


    try {

      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        }
      );


      setSuccess(
        "Account created successfully. Redirecting to sign in..."
      );


      // Redirect to login after registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);


    } catch (error) {

      console.error(
        "Registration error:",
        error.response?.data || error.message
      );


      const backendMessage =
        error.response?.data?.message;


      const validationErrors =
        error.response?.data?.errors;


      if (
        Array.isArray(validationErrors) &&
        validationErrors.length > 0
      ) {

        setError(
          validationErrors
            .map(
              (item) =>
                item.msg || item.message
            )
            .join(" ")
        );

      } else {

        setError(
          backendMessage ||
          "Registration failed. Please try again."
        );
      }

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="register-page">


      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="register-left">

        <div className="register-brand">

          <div className="register-logo">
            DC
          </div>

          <h2>
            DairyCare <span>AI</span>
          </h2>

        </div>


        <div className="register-line"></div>


        <h1>
          Intelligent Dairy
          <br />
          Farm Management
        </h1>


        <p className="register-description">
          A secure and intelligent platform for managing
          farms, livestock health, nutrition, and daily
          operations.
        </p>


        <div className="register-features">

          <div className="register-feature">

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


          <div className="register-feature">

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


          <div className="register-feature">

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


        <div className="register-platform">
          DairyCare AI Platform
        </div>

      </div>


      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="register-right">

        <div className="register-card">


          <div className="register-header">

            <h1>
              Create your account
            </h1>

            <p>
              Join DairyCare AI to manage your farm.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="register-alert register-alert-error">

              <div className="alert-icon">
                !
              </div>

              <span>
                {error}
              </span>

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="register-alert register-alert-success">

              <div className="alert-icon">
                ✓
              </div>

              <span>
                {success}
              </span>

            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="register-form"
          >


            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />

            </div>


            {/* EMAIL */}

            <div className="form-group">

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
              />

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              <small className="password-hint">
                Minimum 8 characters with uppercase,
                lowercase, number and special character.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="password-wrapper">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* ROLE */}

            <div className="form-group">

              <label htmlFor="role">
                Account type
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >

                <option value="farmer">
                  Farmer
                </option>

                <option value="veterinarian">
                  Veterinarian
                </option>

              </select>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create account"}

            </button>

          </form>


          {/* LOGIN LINK */}

          <div className="login-link">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>

          </div>


          {/* SECURITY */}

          <div className="register-security">

            <div className="security-icon">
              ✓
            </div>

            <div>

              <strong>
                Secure registration
              </strong>

              <span>
                Your credentials are protected
                using secure authentication.
              </span>

            </div>

          </div>

        </div>


        <div className="register-footer">
          © 2026 DairyCare AI. All rights reserved.
        </div>

      </div>

    </div>

  );
}

export default Register;