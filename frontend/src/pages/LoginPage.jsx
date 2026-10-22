import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      return toast.error("All fields are required");
    }
    login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-base-100 overflow-hidden">
      {/* Ambient decorative blur for left side */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left side: Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md space-y-7">
          
          {/* Header & Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="size-3.5" />
              <span>Realtime Chat Application</span>
            </div>

            <div className="flex flex-col items-center gap-2 group">
              <div className="size-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-content shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="size-7" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">Welcome Back</h1>
              <p className="text-sm text-base-content/60">
                Sign in to continue your conversations
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-base-200/50 backdrop-blur-xl p-7 rounded-3xl border border-base-content/10 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="current-password"
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
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Switch to Signup */}
            <div className="text-center mt-6 pt-5 border-t border-base-content/10">
              <p className="text-sm text-base-content/60">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Right side: Visual Showcase */}
      <AuthImagePattern
        title="Connect Seamlessly"
        subtitle="Experience instant messaging with real-time indicators, media sharing, and custom aesthetics."
      />
    </div>
  );
}

export default LoginPage;