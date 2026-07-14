"use client";

import Link from "next/link";
import { PrototypeBanner } from "./components/PrototypeBanner";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="state-page">
      <PrototypeBanner />
      <section className="state-card" role="alert" aria-labelledby="error-title">
        <span className="state-icon state-icon-error" aria-hidden="true">
          !
        </span>
        <p className="eyebrow">Unexpected prototype error</p>
        <h1 id="error-title">The readiness view could not be displayed.</h1>
        <p>
          No readiness decision should be made from this screen. Retry the local
          demonstration or return to search.
        </p>
        <div className="button-row">
          <button className="button button-primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="button button-secondary" href="/">
            Return to search
          </Link>
        </div>
      </section>
    </main>
  );
}
