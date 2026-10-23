import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "../lib/bulkApi";

/* Eight areas. Reviews (/admin/reviews) stays reachable by address but is hidden from the menu until reviews are collected again. */
const navItems = [
  { to: "/admin", label: "대시보드", end: true },
  { to: "/admin/orders", label: "주문 · 배송" },
  { to: "/admin/products", label: "상품 관리" },
  { to: "/admin/inquiries", label: "고객 관리" },
  { to: "/admin/campaign-links", label: "마케팅 · 분석" },
  { to: "/admin/journal", label: "콘텐츠 · Journal" },
  { to: "/admin/press", label: "언론 제안" },
  { to: "/admin/settings", label: "운영 설정" },
];

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
        <div className="admin-sidebar__brand">
          <strong>hondit.</strong>
          <span>운영 관리자</span>
        </div>
        <nav aria-label="관리자 메뉴">
          {navItems.map((item) => (
            <NavLink key={item.to} end={item.end} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <a href="/" target="_blank" rel="noreferrer">
            고객 사이트 보기
          </a>
        </nav>
        <div className="admin-sidebar__help">
          <span>운영 기준</span>
          <p>결제 완료 주문만 준비 및 배송 대상으로 처리하세요. 미결제 시도는 기록 확인용으로만 보관됩니다.</p>
        </div>
        <button type="button" onClick={logout}>
          로그아웃
        </button>
      </aside>
      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  );
}
