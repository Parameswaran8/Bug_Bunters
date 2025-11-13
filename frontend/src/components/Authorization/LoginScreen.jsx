"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function LoginScreen() {
  const navigate = useNavigate()
  const [loginMode, setLoginMode] = useState("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      console.log("Login with email:", email)
      setIsLoading(false)
      setEmail("")
      setPassword("")
      setErrors({})
    }, 1500)
  }

  const handleOtpLogin = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!otp || otp.length < 4) {
      newErrors.otp = "Please enter a valid OTP"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      console.log("Login with OTP:", email, otp)
      setIsLoading(false)
      setEmail("")
      setOtp("")
      setErrors({})
    }, 1500)
  }

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="auth-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <div className="toggle-group">
          <button
            className={`toggle-btn ${loginMode === "email" ? "active" : ""}`}
            onClick={() => {
              setLoginMode("email")
              setErrors({})
            }}
          >
            Password
          </button>
          <button
            className={`toggle-btn ${loginMode === "otp" ? "active" : ""}`}
            onClick={() => {
              setLoginMode("otp")
              setErrors({})
            }}
          >
            OTP
          </button>
        </div>

        {loginMode === "email" && (
          <form className="auth-form" onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: "" })
                }}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {loginMode === "otp" && (
          <form className="auth-form" onSubmit={handleOtpLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""))
                  if (errors.otp) setErrors({ ...errors, otp: "" })
                }}
              />
              {errors.otp && <span className="form-error">{errors.otp}</span>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login with OTP"}
            </button>
          </form>
        )}

        <div className="auth-link">
          <button className="btn-text" onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </button>
        </div>

        <div className="auth-link">
          Don't have an account? <a onClick={() => navigate("/register")}>Register</a>
        </div>
      </motion.div>
    </motion.div>
  )
}
