import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "../lib/bulkApi";
import { AdminNotice } from "./AdminDashboardPage";

type Settings = {
  legal_business_name: string;
  business_registration_number: string;
  business_address: string;
  customer_service_email: string;
  paypal_mode: string;
  checkout_enabled: boolean;
};

const emptySettings: Settings = {
  legal_business_name: "",
  business_registration_number: "",
  business_address: "",
  customer_service_email: "",
  paypal_mode: "sandbox",
  checkout_enabled: true,
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    adminFetch<{ settings: Settings }>("/api/admin/settings")
      .then((data) => setSettings(data.settings || emptySettings))
      .catch((err) => setError(err.message));
  }, []);

  const update = (key: keyof Settings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await adminFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ settings }),
    });
    setSaved("운영 설정이 저장되었습니다.");
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">운영 설정</p>
        <h1>판매 기본 정보</h1>
        <p>
          고객에게 표시되는 사업자 정보와 결제 가능 상태를 관리합니다. PayPal 키와 Supabase 키 같은 비밀값은 이 화면이 아니라
          Vercel 환경 변수에서만 관리하세요.
        </p>
      </div>

      <section className="admin-panel setup-warning">
        <h2>중요 운영 기준</h2>
        <ul className="admin-warning-list">
          <li>PayPal 모드는 서버 환경 변수 기준으로 동작합니다. 이 화면에서 임의로 live/sandbox를 바꾸지 않습니다.</li>
          <li>결제 비활성화 시 고객은 checkout에 들어가도 결제를 진행할 수 없습니다.</li>
          <li>사업자 등록번호나 세금 관련 문구는 실제 운영 국가 기준으로 확인 후 입력해야 합니다.</li>
        </ul>
      </section>

      <form className="admin-panel admin-form" onSubmit={submit}>
        <label>
          법적 사업자명
          <input
            value={settings.legal_business_name}
            onChange={(event) => update("legal_business_name", event.target.value)}
            placeholder="예: hondit"
          />
        </label>
        <label>
          사업자/등록 번호
          <input
            value={settings.business_registration_number}
            onChange={(event) => update("business_registration_number", event.target.value)}
            placeholder="운영자 확정 후 입력"
          />
        </label>
        <label>
          고객 응대 이메일
          <input
            type="email"
            value={settings.customer_service_email}
            onChange={(event) => update("customer_service_email", event.target.value)}
            placeholder="hello@hondit.com"
          />
        </label>
        <label>
          PayPal 현재 모드
          <input value={settings.paypal_mode || "환경 변수 기준"} readOnly />
        </label>
        <label>
          사업장 주소
          <textarea
            value={settings.business_address}
            onChange={(event) => update("business_address", event.target.value)}
            placeholder="고객 고지용 주소를 입력하세요."
          />
        </label>
        <label className="admin-checkline">
          <input
            type="checkbox"
            checked={settings.checkout_enabled}
            onChange={(event) => update("checkout_enabled", event.target.checked)}
          />
          Bulk PayPal 결제 활성화
        </label>
        {saved && <p className="form-success">{saved}</p>}
        <button className="button button--primary" type="submit">
          운영 설정 저장
        </button>
      </form>
    </>
  );
}
