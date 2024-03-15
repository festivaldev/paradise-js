// eslint-disable-next-line import/no-named-default
import { default as DefaultSettings, type ParadiseServiceSettings } from '@/ParadiseServiceSettings';
import FileServerHost from '@/ServiceHosts/FileServerHost';
import WebServiceHost from '@/ServiceHosts/WebServiceHost';
import { ServerType, WebSocketHost, WebSocketPacketType } from '@/ServiceHosts/WebSocket';
import PacketType from '@/ServiceHosts/WebSocket/PacketType';
import { CommandHandler, Commands, ConsoleHelper } from '@/console';
import DiscordClient from '@/discord/DiscordClient';
import models from '@/models';
import { GameSessionManager, Log, XpPointsUtil } from '@/utils';
import readline, { Interface } from 'readline';
import { Dialect, Sequelize } from 'sequelize';

export default class ParadiseService {
  // eslint-disable-next-line no-use-before-define
  private static _instance: ParadiseService;

  public static get Instance(): ParadiseService {
    // eslint-disable-next-line no-return-assign
    return this._instance || (this._instance = new this());
  }

  private runApp: boolean = true;

  public ServiceSettings: ParadiseServiceSettings = DefaultSettings;

  private fileServer: FileServerHost;
  private webServiceHost: WebServiceHost;
  private discordClient: DiscordClient;
  private socketHost: WebSocketHost;

  private stdin: Interface;

  public async Run() {
    ConsoleHelper.PrintConsoleHeader();

    this.fileServer = new FileServerHost(+this.ServiceSettings.FileServerPort!);
    await this.fileServer.start();

    this.webServiceHost = new WebServiceHost(+this.ServiceSettings.WebServicePort!);
    await this.webServiceHost.start();

    this.discordClient = new DiscordClient();
    await this.discordClient.Connect();

    this.socketHost = new WebSocketHost(+this.ServiceSettings.SocketPort!);
    this.socketHost.on('ConnectionRejected', (e) => {
      Log.warn(`[Socket] Rejecting ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) from ${e.Socket.RemoteAddress}. Reason: ${e.Reason}`);
    });

    this.socketHost.on('ClientConnected', (e) => {
      Log.info(`[Socket] ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) connected from ${e.Socket.RemoteAddress}.`);
    });

    this.socketHost.on('ClientDisconnected', (e) => {
      Log.info(`[Socket] ${ServerType[e.Socket.Type]}Server(${e.Socket.Identifier}) disconnected. Reason: ${e.Reason ?? 'Connection closed'}`);
    });

    this.socketHost.on('DataReceived', async (e) => {
      switch (e.Type) {
        case WebSocketPacketType.Monitoring:
          console.log(e.Data);
          break;
        case WebSocketPacketType.Error:
          await this.discordClient.LogError(e.Data);
          break;
        case WebSocketPacketType.ChatMessage:
          await this.discordClient.SendLobbyChatMessage(e.Data);
          break;
        case WebSocketPacketType.Command:
          break;
        case WebSocketPacketType.PlayerJoined:
          await this.discordClient.SendPlayerJoinMessage(e.Data);
          break;
        case WebSocketPacketType.PlayerLeft:
          await this.discordClient.SendPlayerLeftMessage(e.Data);
          break;
        case WebSocketPacketType.RoomOpened:
          await this.discordClient.SendGameRoomCreatedMessage(e.Data);
          break;
        case WebSocketPacketType.RoomClosed:
          await this.discordClient.SendGameRoomDestroyedMessage(e.Data);
          break;
        case WebSocketPacketType.RoundStarted:
          await this.discordClient.SendRoundStartedMessage(e.Data);
          break;
        case WebSocketPacketType.RoundEnded:
          await this.discordClient.SendRoundEndedMessage(e.Data[0], e.Data[1]);
          break;
        default:
          Log.debug(PacketType[e.Type]);
          break;
      }
    });

    // #region Database Configuration
    const sequelize = new Sequelize(this.ServiceSettings.DatabaseSettings.DatabaseName!, this.ServiceSettings.DatabaseSettings.Username!, this.ServiceSettings.DatabaseSettings.Password, {
      host: this.ServiceSettings.DatabaseSettings.Server,
      port: Number(this.ServiceSettings.DatabaseSettings.Port),
      dialect: (this.ServiceSettings.DatabaseSettings.Type as Dialect),
      logging: false,
    });

    Log.info('Connecting to database...');
    Log.debug(`Type:${this.ServiceSettings.DatabaseSettings.Type} Database:${this.ServiceSettings.DatabaseSettings.DatabaseName} Auth:'${this.ServiceSettings.DatabaseSettings.Username}'@'${this.ServiceSettings.DatabaseSettings.Server}:${this.ServiceSettings.DatabaseSettings.Port}' (using password: ${this.ServiceSettings.DatabaseSettings.Password?.length! > 0 ? 'YES' : 'NO'})`);
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

    this.stdin = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.stdin.on('SIGINT', () => {
      this.stdin.removeAllListeners();
      this.stdin.close();
      process.stdout.write('\n');
      this.Teardown();
    });

    this.Prompt();
  }

  public async Teardown(): Promise<void> {
    this.runApp = false;

    await this.fileServer.stop();
    await this.webServiceHost.stop();
    await this.discordClient.Disconnect();

    console.log('Bye.');
    setTimeout(() => {
      process.exit(0);
    }, 500);
  }

  private Prompt(): void {
    this.stdin.question('> ', async (cmd) => {
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

      if (this.runApp) this.Prompt();
    });
  }
}
