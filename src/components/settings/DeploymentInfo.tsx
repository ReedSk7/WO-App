type DeploymentEnvironment = 'Local' | 'Netlify' | 'Vercel' | 'GitHub Pages' | 'Unknown';

function getDeploymentEnvironment(): DeploymentEnvironment {
  if (import.meta.env.DEV) return 'Local';

  switch (import.meta.env.VITE_DEPLOY_TARGET) {
    case 'netlify':
      return 'Netlify';
    case 'vercel':
      return 'Vercel';
    case 'github-pages':
      return 'GitHub Pages';
    default:
      return import.meta.env.BASE_URL === '/WO-App/' ? 'GitHub Pages' : 'Unknown';
  }
}

export function DeploymentInfo() {
  const environment = getDeploymentEnvironment();

  return (
    <section className="rounded-panel border border-border-subtle bg-surface-light p-6 shadow-panel dark:bg-surface-dark">
      <h2 className="text-xl font-semibold leading-7">Deployment</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="label">Environment</dt>
          <dd className="mt-1 font-semibold">{environment}</dd>
        </div>
        <div>
          <dt className="label">Build mode</dt>
          <dd className="mt-1 font-mono text-sm font-semibold">{import.meta.env.MODE}</dd>
        </div>
        <div>
          <dt className="label">Base path</dt>
          <dd className="mt-1 font-mono text-sm font-semibold">{import.meta.env.BASE_URL}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-texttone-secondaryLight dark:text-texttone-secondaryDark">
        Demo data only. Do not enter proprietary, confidential, plant-sensitive, or real equipment data.
      </p>
    </section>
  );
}
