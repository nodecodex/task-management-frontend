import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "reactstrap";

const LoadingScreen = () => (
  <div className="d-flex justify-content-center align-items-center min-h-screen">
    <Spinner color="primary" className="w-12 h-12" />
  </div>
);

// Protected route — requires authentication
const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth-login" replace />;
};

// Guest route — only for non-logged in users
const GuestGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/app-dashboard" replace /> : <Outlet />;
};

export { AuthGuard, GuestGuard };
