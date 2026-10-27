import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../services/authStore";

const AdminCheck = ({ children }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const adminStatusLoaded = useAuthStore((state) => state.adminStatusLoaded);
  const setAdminStatus = useAuthStore((state) => state.setAdminStatus);
  const location = useLocation();

  useEffect(() => {
    if (!accessToken || adminStatusLoaded) return undefined;
    let active = true;

    api.get("users/me/")
      .then((response) => {
        if (active) setAdminStatus(Boolean(response.data.is_admin));
      })
      .catch((error) => {
        console.error("Unable to verify admin access:", error);
        if (active) setAdminStatus(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken, adminStatusLoaded, setAdminStatus]);

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!adminStatusLoaded) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500" role="status">Checking admin access…</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminCheck;
