import { Link } from "react-router-dom";
import { thaiDiffuserActions } from "../../shared/diffuser-guide.js";

export function ThaiDiffuserActions({ slug }: { slug?: string }) {
  const actions = thaiDiffuserActions(slug);
  return (
    <div className="thai-diffuser-actions">
      <a className="button button--primary" href={actions.deliveryPath}>{actions.deliveryLabel}</a>
      <Link className="button button--outline-dark" to={actions.pickupPath}>{actions.pickupLabel}</Link>
    </div>
  );
}
