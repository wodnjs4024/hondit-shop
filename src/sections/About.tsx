import { BrandLogo } from "../components/BrandLogo";

export function About() {
  return (
    <section className="about section-shell" id="about" aria-labelledby="about-title">
      <div className="section-inner section-inner--narrow">
        <div className="about-note">
          <BrandLogo className="about-note__logo" />
          <p>ABOUT HONDIT</p>
          <h2 id="about-title">
            A small curation
            <span>inspired by Jeju.</span>
          </h2>
          <p className="about-note__body">
            hondit brings together Korean care and scent products chosen for calm, intentional routines.
          </p>
          <p className="about-note__body">
            Created by a Jeju National University GTEP team, hondit connects local Korean products with the warm pace of Singapore living through skin care, scent and quiet everyday objects.
          </p>
          <p className="about-note__closing">
            For your skin.<br />For your space.<br />For a quieter rhythm.
          </p>
        </div>
      </div>
    </section>
  );
}
