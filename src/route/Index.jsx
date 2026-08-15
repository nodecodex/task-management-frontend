import React, { useEffect } from "react";
import { Routes, Route, useLocation, BrowserRouter, Navigate } from "react-router-dom";

import Kanban from "@/pages/app/kanban/Kanban";
import Dashboard from "@/pages/app/dashboard/Dashboard";

import Error404Classic from "@/pages/error/404-classic";
import Error404Modern from "@/pages/error/404-modern";
import Error504Modern from "@/pages/error/504-modern";
import Error504Classic from "@/pages/error/504-classic";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Success from "@/pages/auth/Success";

import LayoutApp from "@/layout/Index-app";
import LayoutNoSidebar from "@/layout/Index-nosidebar";
import ThemeProvider from "@/layout/provider/Theme";
import { AuthGuard, GuestGuard } from "./AuthGuard";
import { useAuth } from "@/context/AuthContext";

const ScrollToTop = (props) => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return <>{props.children}</>;
};

const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/app-dashboard" replace /> : <Navigate to="/auth-login" replace />;
};

const Pages = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop>
        <Routes>
          <Route element={<ThemeProvider />}>

            {/* Root "/" redirect based on auth */}
            <Route path="/" element={<RootRedirect />} />

            {/* 🔒 Protected — AuthGuard check → LayoutApp → Kanban / Dashboard */}
            <Route element={<AuthGuard />}>
              <Route element={<LayoutApp />}>
                <Route path="app-dashboard" element={<Dashboard />} />
                <Route path="app-kanban" element={<Kanban />} />
              </Route>
            </Route>

            {/* 👤 Guest Only — redirect to dashboard if logged in */}
            <Route element={<GuestGuard />}>
              <Route element={<LayoutNoSidebar />}>
                <Route path="auth-login" element={<Login />} />
                <Route path="auth-register" element={<Register />} />
              </Route>
            </Route>

            {/* Public routes */}
            <Route element={<LayoutNoSidebar />}>
              <Route path="auth-reset" element={<ForgotPassword />} />
              <Route path="auth-success" element={<Success />} />

              <Route path="errors">
                <Route path="404-modern" element={<Error404Modern />} />
                <Route path="404-classic" element={<Error404Classic />} />
                <Route path="504-modern" element={<Error504Modern />} />
                <Route path="504-classic" element={<Error504Classic />} />
              </Route>

              <Route path="*" element={<Error404Modern />} />
            </Route>

          </Route>
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
};
export default Pages;
