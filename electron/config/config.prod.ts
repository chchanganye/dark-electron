import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: false,
    serverUrl: 'http://127.0.0.1:8080',
  };
};

export default config;