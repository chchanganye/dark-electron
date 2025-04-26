import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: {
      mode: 'bottom'
    },
    jobs: {
      messageLog: false
    },
    serverUrl: 'http://127.0.0.1:8888',
  };
};

export default config;