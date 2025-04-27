"use client"

import { useState } from "react"
import Link from "next/link"
import "../styles.css"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [signupData, setSignupData] = useState({
    email: "",
    fname: "",
    lname: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await fetch("https://swiftthrift-457008.as.r.appspot.com/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess("Login successful!")
        console.log("User:", data.user)
        console.log("Token:", data.token)
        // Store the token and user data in localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
      } else {
        const errorMessage = await response.text()
        setError(errorMessage)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      const response = await fetch("https://swiftthrift-457008.as.r.appspot.com/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess("Signup successful! You can now log in.")
        console.log("New User:", data)
        setSignupData({
          email: "",
          fname: "",
          lname: "",
          username: "",
          password: "",
          confirmPassword: "",
          phone: "",
          role: "",
        })
      } else {
        const errorMessage = await response.text()
        setError(errorMessage)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li>
            <Link href="/">Home</Link>
          </li>
        </ul>
      </nav>

      <div className="auth-container">
        <div className="auth-tabs">
          <button className={`auth-tab ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-forms">
          {/* Login Form */}
          <form className={`login-form ${activeTab !== "login" ? "hidden" : ""}`} onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                type="email"
                id="login-email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Login
            </button>
            <p className="form-footer">
              Don't have an account?{" "}
              <span className="toggle-form" onClick={() => setActiveTab("signup")}>
                Sign Up
              </span>
            </p>
          </form>

          {/* Sign Up Form */}
          <form className={`signup-form ${activeTab !== "signup" ? "hidden" : ""}`} onSubmit={handleSignup}>
            <h2>Create an Account</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                type="email"
                id="signup-email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="signup-fname">First Name</label>
                <input
                  type="text"
                  id="signup-fname"
                  placeholder="First name"
                  value={signupData.fname}
                  onChange={(e) => setSignupData({ ...signupData, fname: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-lname">Last Name</label>
                <input
                  type="text"
                  id="signup-lname"
                  placeholder="Last name"
                  value={signupData.lname}
                  onChange={(e) => setSignupData({ ...signupData, lname: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                type="text"
                id="signup-username"
                placeholder="Choose a username"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="signup-confirm-password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Phone Number</label>
              <input
                type="tel"
                id="signup-phone"
                placeholder="Enter your phone number"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-role">Role</label>
              <select
                id="signup-role"
                value={signupData.role}
                onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                required
              >
                <option value="">Select a role</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign Up
            </button>
            <p className="form-footer">
              Already have an account?{" "}
              <span className="toggle-form" onClick={() => setActiveTab("login")}>
                Login
              </span>
            </p>
          </form>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  )
}
