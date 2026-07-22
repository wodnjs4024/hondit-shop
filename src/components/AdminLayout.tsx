import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "../lib/bulkApi";

const navItems = [
  { to: "/admin", label: "운영 대시보드", end: true },
  { to: "/admin/orders", label: "주문 · 배송 · 취소/환불" },
  { to: "/admin/inquiries", label: "문의 · 답장" },
  { to: "/admin/products", label: "상품 등록 · 수정 · 재고" },
  { to: "/admin/reviews", label: "리뷰 관리" },
  { to: "/admin/settings", label: "결제 설정 · GA4 · 공지" },
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
          <p>결제 완료 주문만 준비와 배송 대상으로 처리하세요. 미결제 시도는 기록 확인용으로만 보관합니다.</p>
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
