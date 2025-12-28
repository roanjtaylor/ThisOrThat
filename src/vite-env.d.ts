/// <reference types="vite/client" />

declare module '*.m4a' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_CURATE_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
