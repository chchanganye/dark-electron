// electron/config/types.d.ts
import 'ee-core/config';

declare module 'ee-core/config' {
  interface AppConfig {
    serverUrl?: string;
  }
}