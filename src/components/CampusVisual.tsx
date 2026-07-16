export function CampusVisual() {
  return (
    <figure className="campus-visual">
      <img
        src="/images/jnu-campus.webp"
        alt="Jeju National University campus surrounded by Jeju's green landscape."
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <span>Jeju National University</span>
        <strong>Where hondit's Singapore project began.</strong>
      </figcaption>
      <div className="campus-visual__mark" aria-hidden="true">
        hondit.
      </div>
    </figure>
  );
}
