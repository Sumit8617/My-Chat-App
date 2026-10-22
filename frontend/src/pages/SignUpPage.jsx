import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { MessageSquare, User, Mail, Lock, EyeOff, Eye, Loader2, Sparkles } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, authUser, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();
    if (success) {
      try {
        await signup(formData);
      } catch (error) {
        console.log("Signup error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-base-100 overflow-hidden">
      {/* Ambient decorative blur */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left side: Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md space-y-7">
          
          {/* Header & Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="size-3.5" />
              <span>Get Started in Seconds</span>
            </div>

            <div className="flex flex-col items-center gap-2 group">
              <div className="size-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-content shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="size-7" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">Create Account</h1>
              <p className="text-sm text-base-content/60">
                Join thousands chatting in real-time
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-base-200/50 backdrop-blur-xl p-7 rounded-3xl border border-base-content/10 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Full Name */}
              <div className="form-control space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-semibold text-xs tracking-wide uppercase text-base-content/70">
                    Full Name
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <User className="size-5" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10.5 rounded-xl bg-base-100/80 focus:bg-base-100 border-base-content/15 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="Tony Stark"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-control space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-semibold text-xs tracking-wide uppercase text-base-content/70">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Mail className="size-5" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10.5 rounded-xl bg-base-100/80 focus:bg-base-100 border-base-content/15 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-control space-y-1.5">
                <label className="label py-0">
                  <span className="label-text font-semibold text-xs tracking-wide uppercase text-base-content/70">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                    <Lock className="size-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-10.5 pr-11 rounded-xl bg-base-100/80 focus:bg-base-100 border-base-content/15 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 font-semibold tracking-wide transition-all mt-2"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center mt-6 pt-5 border-t border-base-content/10">
              <p className="text-sm text-base-content/60">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Right side: Visual Showcase */}
      <AuthImagePattern
        title="Join the Community"
        subtitle="Connect with friends, share media securely, and experience modern messaging designed for speed."
      />
    </div>
  );
}

export default SignUpPage;