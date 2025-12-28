/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CURATE_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
