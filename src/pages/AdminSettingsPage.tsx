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

  const update = (key: keyof Settings, value: string | boolean) => setSettings((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await adminFetch("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ settings }),
    });
    setSaved("Settings saved.");
  };

  if (error) return <AdminNotice message={error} />;

  return (
    <>
      <div className="admin-heading">
        <p className="eyebrow">SETTINGS</p>
        <h1>Business and sales settings</h1>
      </div>
      <form className="admin-panel admin-form" onSubmit={submit}>
        <label>Legal business name<input value={settings.legal_business_name} onChange={(event) => update("legal_business_name", event.target.value)} /></label>
        <label>Business registration number<input value={settings.business_registration_number} onChange={(event) => update("business_registration_number", event.target.value)} /></label>
        <label>Business address<textarea value={settings.business_address} onChange={(event) => update("business_address", event.target.value)} /></label>
        <label>Customer service email<input type="email" value={settings.customer_service_email} onChange={(event) => update("customer_service_email", event.target.value)} /></label>
        <label>PayPal mode<input value={settings.paypal_mode} readOnly /></label>
        <label><input type="checkbox" checked={settings.checkout_enabled} onChange={(event) => update("checkout_enabled", event.target.checked)} /> Checkout enabled</label>
        {saved && <p>{saved}</p>}
        <button className="button button--primary" type="submit">Save settings</button>
      </form>
    </>
  );
}
