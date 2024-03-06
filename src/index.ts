import ParadiseServiceSettings from '@/ParadiseServiceSettings';
import FileServerHost from '@/ServiceHosts/FileServerHost';
import WebServiceHost from '@/ServiceHosts/WebServiceHost';
import WebSocketHost, { ServerType } from '@/ServiceHosts/WebSocketHost';
import { CommandHandler, Commands, ConsoleHelper } from '@/console';
import models from '@/models';
import { GameSessionManager, Log, XpPointsUtil } from '@/utils';
import readline from 'readline';
import seedrandom from 'seedrandom';
import { Dialect, Sequelize } from 'sequelize';

const r = seedrandom(String(new Date().getTime()));

// eslint-disable-next-line no-extend-native
Array.prototype.WriteTo = function (stream) {
  for (const _ of this) {
    stream.push(_);
  }
};

Math.clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max);
};

Math.randomInt = function (min = 1, max = 2147483647) {
  return Math.floor(r() * (max - min) + min);
};

(async () => {
  ConsoleHelper.PrintConsoleHeader();

  global.ServiceSettings = ParadiseServiceSettings;

  const httpServer = new FileServerHost(+ServiceSettings.FileServerPort!);
  await httpServer.start();

  const webServiceHost = new WebServiceHost(+ServiceSettings.WebServicePort!);
  await webServiceHost.start();

  const socketHost = new WebSocketHost(+ServiceSettings.SocketPort!);
  socketHost.on('ConnectionRejected', (e) => {
    Log.warn(`[Socket] Rejecting ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) from ${e.Socket.RemoteAddress}. Reason: ${e.Reason}`);
  });

  socketHost.on('ClientConnected', (e) => {
    Log.info(`[Socket] ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) connected from ${e.Socket.RemoteAddress}.`);
  });

  socketHost.on('ClientDisconnected', (e) => {
    Log.info(`[Socket] ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) disconnected. Reason: ${e.Reason}`);
  });
  await socketHost.start();

  // #region Database Configuration
  const sequelize = new Sequelize(ServiceSettings.DatabaseName!, ServiceSettings.DatabaseUser!, ServiceSettings.DatabasePassword, {
    host: ServiceSettings.DatabaseServer,
    port: Number(ServiceSettings.DatabasePort),
    dialect: (ServiceSettings.DatabaseType as Dialect),
    logging: false,
  });

  Log.info('Connecting to database...');
  Log.debug(`Type:${ServiceSettings.DatabaseType} Database:${ServiceSettings.DatabaseName} Auth:'${ServiceSettings.DatabaseUser}'@'${ServiceSettings.DatabaseServer}:${ServiceSettings.DatabasePort}' (using password: ${ServiceSettings.DatabasePassword?.length! > 0 ? 'YES' : 'NO'})`);
  for (const [modelName, model] of Object.entries(models)) {
    model.initialize(sequelize);
    model.sync();
  }

  for (const [modelName, model] of Object.entries(models)) {
    model.associate?.(models);
  }
  Log.info('Database opened.');
  // #endregion

  CommandHandler.Commands.push(...Commands);
  global.SessionManager = new GameSessionManager();
  XpPointsUtil._initialize();

  ConsoleHelper.PrintConsoleHeaderSubtitle();

  const stdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  stdin.on('SIGINT', () => {
    stdin.removeAllListeners();
    stdin.close();
    process.stdout.write('\n');
    process.exit(0);
  });

  const prompt = () => {
    stdin.question('> ', async (cmd) => {
      const cmdArgs = cmd.split(' ');

      switch (cmdArgs[0]?.toLocaleLowerCase()) {
        default:
          await CommandHandler.HandleCommand(
            cmdArgs[0],
            cmdArgs.slice(1),
            undefined,
            (output: string, inline: boolean) => {
              if (!inline) {
                console.log(output);
              } else {
                process.stdout.write(output);
              }
            },
            (invoker: any, success: boolean, error?: string | undefined | null) => {
              if (success && !error?.trim().length) {
                // console.log(invoker.Output);
              } else {
                console.error(error);
              }
            },
          );
          break;
      }

      prompt();
    });
  };
  prompt();
})();
