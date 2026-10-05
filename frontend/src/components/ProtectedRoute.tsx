import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const { utilisateur, loading } = useAuth();

  if (loading) return null;
  if (!utilisateur) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(utilisateur.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
