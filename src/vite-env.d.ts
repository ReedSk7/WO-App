/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOY_TARGET?: 'netlify' | 'vercel' | 'github-pages';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
