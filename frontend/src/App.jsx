import React, { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // 🔥 Fire ping WITHOUT await — don't block checkAuth
    const API = import.meta.env.VITE_BASE_URL;
    fetch(`${API}/ping`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }).catch(() => {});

    // ✅ Always runs on every refresh — no window.__appInitialized blocking it
    checkAuth();
  }, []);

  if (isCheckingAuth)
    return (
      <div className="flex items-center justify-center h-screen" data-theme={theme}>
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden" data-theme={theme}>
      <Navbar />

      <div className="flex-1 min-h-0 h-full">
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;