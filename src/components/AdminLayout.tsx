import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "../lib/bulkApi";

export function AdminLayout() {
  const navigate = useNavigate();
  const token = getAdminToken();

  if (!token) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <strong>hondit admin</strong>
        <nav>
          <NavLink end to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <button type="button" onClick={logout}>Sign out</button>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  );
}
