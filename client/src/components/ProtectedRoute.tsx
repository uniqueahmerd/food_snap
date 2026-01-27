import React, { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth status is being checked
  // This includes both the initial auth check AND any refresh calls
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  if (requiredRole) {
    const hasPermission =
      (requiredRole === "admin" && user.role === "admin") ||
      (requiredRole === "user" &&
        (user.role === "user" || user.role === "admin"));

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">🚫</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Insufficient Permissions
            </h2>
            <p className="text-gray-600 mb-6">
              You need {requiredRole} access to view this page. Current role:{" "}
              <span className="font-medium capitalize">{user.role}</span>
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Demo Accounts:</strong>
                <br />
                • Admin: admin@snapfood.com
                <br />
                (Password: password)
                <br />
                • Individual: user@snapfood.com
                <br />
                (Password: password)
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
