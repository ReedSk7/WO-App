import type { Metadata } from "next";
import Link from "next/link";
import { PrototypeBanner } from "../components/PrototypeBanner";

export const metadata: Metadata = {
  title: "Demonstration Source Record",
  description: "Placeholder source-record page for the readiness prototype.",
};

export default async function SourcePlaceholderPage({
  searchParams,
}: {
  searchParams: Promise<{ record?: string; system?: string }>;
}) {
  const { record, system } = await searchParams;

  return (
    <main className="state-page">
      <PrototypeBanner />
      <section className="state-card" aria-labelledby="source-title">
        <span className="state-icon state-icon-info" aria-hidden="true">
          i
        </span>
        <p className="eyebrow">Demonstration link</p>
        <h1 id="source-title">No production source record is connected.</h1>
        <p>
          This page demonstrates where an approved source-system record could be
          opened after a future authorized integration. It does not confirm a
          real record or status.
        </p>
        <dl className="definition-grid definition-grid-compact">
          <div>
            <dt>Source label</dt>
            <dd>{system || "Demonstration source"}</dd>
          </div>
          <div>
            <dt>Record label</dt>
            <dd className="mono">{record || "Not supplied"}</dd>
          </div>
        </dl>
        <Link className="button button-primary" href="/">
          Return to work-order search
        </Link>
      </section>
    </main>
  );
}
