import path from 'path';
import { getBaseDir } from 'ee-core/ps';
import { type AppConfig } from 'ee-core/config';

const config: () => AppConfig = () => {
  return {
    openDevTools: false,
    singleLock: true,
    windowsOption: {
      title: '抖音全能工具箱-商业版',
      width: 320,
      height: 400,
      minWidth: 320,
      minHeight: 400,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
      frame: false,
      show: false,
      icon: path.join(getBaseDir(), 'public', 'images', 'logo-32.png'),
    },
    logger: {
      level: 'INFO',
      outputJSON: false,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log',
    },
    remote: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/',
    },
    socketServer: {
      enable: true,
      port: 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
      },
      channel: 'socket-channel',
    },
    httpServer: {
      enable: true,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      host: '127.0.0.1',
      port: 7071,
    },
    mainServer: {
      indexPath: '/public/dist/index.html',
    }
  };
};

export default config;