/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_KAKAO_APP_KEY: string
  readonly VITE_NAVER_CLIENT_ID: string
  readonly VITE_PINATA_API_KEY: string
  readonly VITE_PORTONE_STORE_ID: string
  readonly VITE_PORTONE_API_SECRET: string
  readonly GEMINI_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}