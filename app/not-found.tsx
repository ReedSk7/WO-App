import Link from "next/link";
import { PrototypeBanner } from "./components/PrototypeBanner";

export default function NotFound() {
  return (
    <main className="state-page">
      <PrototypeBanner />
      <section className="state-card" aria-labelledby="not-found-title">
        <span className="state-icon" aria-hidden="true">
          ?
        </span>
        <p className="eyebrow">Demonstration record not found</p>
        <h1 id="not-found-title">This work order is not in the prototype.</h1>
        <p>
          Try one of the synthetic demonstration records from the search screen.
          No production source system was queried.
        </p>
        <Link className="button button-primary" href="/">
          Return to search
        </Link>
      </section>
    </main>
  );
}
