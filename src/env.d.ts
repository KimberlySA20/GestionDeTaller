/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Configuración de la API
  readonly VITE_API_BASE_URL: string;
  
  // Configuración de Supabase
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  
  // Otras variables de entorno
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
  
  // Agrega aquí otras variables de entorno si es necesario
  [key: `VITE_${string}`]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
