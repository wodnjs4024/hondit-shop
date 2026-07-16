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
        <strong>hondit 관리자</strong>
        <nav>
          <NavLink end to="/admin">대시보드</NavLink>
          <NavLink to="/admin/orders">주문 관리</NavLink>
          <NavLink to="/admin/products">상품/이미지</NavLink>
          <NavLink to="/admin/reviews">리뷰 관리</NavLink>
          <NavLink to="/admin/settings">설정</NavLink>
          <NavLink to="/">사이트 보기</NavLink>
        </nav>
        <button type="button" onClick={logout}>로그아웃</button>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  );
}
