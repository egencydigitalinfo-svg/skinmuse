import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ✅ wait until localStorage restored
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin" && user.role !== "superAdmin") {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
