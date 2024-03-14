import ParadiseServiceSettings from '@/ParadiseServiceSettings';
import {
  ArrayProxy, ByteProxy, CommActorInfoProxy, DictionaryProxy, EndOfMatchDataProxy, EnumProxy, GameRoomDataProxy, Int32Proxy, StringProxy,
} from '@festivaldev/uberstrike-js/UberStrike/Core/Serialization';
import { Log } from '@/utils';
import crypto from 'crypto';
import { EventEmitter } from 'stream';
import { v4 as uuid } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';

export enum ServerType {
  None,
  MasterServer,
  Comm,
  Game
}

class SocketInfo {
  public SocketId: string;
  public Type: ServerType;
  public IsClient: boolean;

  constructor(params: any = {}) {
    Object.keys(params).filter((key) => key in this).forEach((key) => { this[key] = params[key]; });
  }
}

class SocketConnectionStatus {
  public Connected: boolean;
  public Rejected: boolean;
  public DisconnectReason: string;

  constructor(params: any = {}) {
    Object.keys(params).filter((key) => key in this).forEach((key) => { this[key] = params[key]; });
  }
}

enum SocketState {
  Disconnected,
  Connecting,
  Connected,
  Sending,
  Receiving,
  Disconnecting
}

export enum PacketType {
  MagicBytes = 1,
  ClientInfo,
  ConnectionStatus,

  Ping,
  Pong,

  Command,
  CommandOutput,
  Monitoring,
  Error,

  ChatMessage = 1 << 10,
  PlayerList,
  PlayerJoined,
  PlayerLeft,
  RoomOpened,
  RoomClosed,
  RoundStarted,
  RoundEnded,

  OpenRoom,
  CloseRoom,
  BanPlayer
}

enum PayloadFlags {
  IsSerialized = 1 << 0,
  IsEncrypted = 1 << 1,
  IsOneWay = 1 << 2
}

const MAGIC_BYTES = [0x50, 0x61, 0x52, 0x61, 0x44, 0x69, 0x53, 0x65];

export class RijndaelCryptoProvider {
  private key: Buffer;
  private iv: Buffer;

  constructor(key: Buffer, salt: Buffer, iv: Buffer) {
    this.key = crypto.pbkdf2Sync(key, salt, 1000, 32, 'sha1');
    this.iv = iv;
  }

  public encrypt(clearText: Buffer) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    return Buffer.concat([cipher.update(clearText), cipher.final()]);
  }

  public decrypt(cipherText: Buffer) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
    return Buffer.concat([decipher.update(cipherText), decipher.final()]);
  }
}

export class WebSocketPayload {
  public Type: PacketType;
  public Data: string;
  public ServerType: ServerType;
  public Flags: PayloadFlags;
  public ConversationId: string;

  public get IsSerialized(): bool {
    return (this.Flags & PayloadFlags.IsSerialized) === PayloadFlags.IsSerialized;
  }
  private set IsSerialized(value: bool) {
    if (value) {
      this.Flags |= PayloadFlags.IsSerialized;
    } else {
      this.Flags &= ~PayloadFlags.IsSerialized;
    }
  }

  public get IsEncrypted(): bool {
    // return false;
    return (this.Flags & PayloadFlags.IsEncrypted) === PayloadFlags.IsEncrypted;
  }
  private set IsEncrypted(value: bool) {
    if (value) {
      this.Flags |= PayloadFlags.IsEncrypted;
    } else {
      this.Flags &= ~PayloadFlags.IsEncrypted;
    }
  }

  public get IsOneWay(): bool {
    return (this.Flags & PayloadFlags.IsOneWay) === PayloadFlags.IsOneWay;
  }
  private set IsOneWay(value: bool) {
    if (value) {
      this.Flags |= PayloadFlags.IsOneWay;
    } else {
      this.Flags &= ~PayloadFlags.IsOneWay;
    }
  }

  constructor(params: any = {}) {
    Object.keys(params).filter((key) => key in this).forEach((key) => { this[key] = params[key]; });
  }

  public static Encode(type: PacketType, data: any, crypto: RijndaelCryptoProvider | null, oneWay: boolean = false, conversationId: string | null = null, serverType: ServerType = ServerType.None): [byte[] | null, WebSocketPayload | null] {
    if (!conversationId) {
      conversationId = uuid();
    }

    const payloadObj = new WebSocketPayload({
      Type: type,
      ServerType: serverType,
      ConversationId: conversationId,
      IsOneWay: oneWay,
    });

    const outputBytes: any[] = [];
    const bytes: any[] = [];

    switch (type) {
      case PacketType.MagicBytes:
      case PacketType.Ping:
      case PacketType.Pong:
        break;
      case PacketType.ClientInfo:
      case PacketType.ConnectionStatus:
        StringProxy.Serialize(bytes, JSON.stringify(data));
        break;
      case PacketType.Command:
      case PacketType.Error:
      case PacketType.ChatMessage:
        payloadObj.IsEncrypted = true;

        StringProxy.Serialize(bytes, JSON.stringify(data));
        break;
      case PacketType.CommandOutput:
        payloadObj.IsEncrypted = true;

        StringProxy.Serialize(bytes, data);
        break;
      case PacketType.Monitoring:
      case PacketType.BanPlayer:
        payloadObj.IsEncrypted = true;

        DictionaryProxy.Serialize<string, object>(bytes, data, StringProxy.Serialize, (stream, instance) => {
          StringProxy.Serialize(stream, JSON.stringify(instance));
        });
        break;
      case PacketType.PlayerList:
        /// TODO
        break;
      case PacketType.PlayerJoined:
      case PacketType.PlayerLeft:
        payloadObj.IsEncrypted = true;

        CommActorInfoProxy.Serialize(bytes, data);
        break;
      case PacketType.RoomOpened:
      case PacketType.RoomClosed:
        payloadObj.IsEncrypted = true;

        GameRoomDataProxy.Serialize(bytes, data);
        break;
      case PacketType.RoundStarted: {
        payloadObj.IsEncrypted = true;

        const list = data as any[];
        GameRoomDataProxy.Serialize(bytes, list[0]);
        break;
      }
      case PacketType.RoundEnded: {
        payloadObj.IsEncrypted = true;

        const list = data as any[];
        GameRoomDataProxy.Serialize(bytes, list[0]);
        EndOfMatchDataProxy.Serialize(bytes, list[1]);
        break;
      }
      case PacketType.OpenRoom:
        /// TODO
        break;
      case PacketType.CloseRoom:
        payloadObj.IsEncrypted = true;

        Int32Proxy.Serialize(bytes, data);
        break;
      default:
        Log.warn(`Rejecting to encode payload of type ${PacketType[type]}: Unknown type.`);
        return [null, null];
    }

    if (crypto != null && payloadObj.IsEncrypted) {
      payloadObj.Data = crypto.encrypt(Buffer.from(bytes)).toString('base64');
    } else {
      payloadObj.Data = Buffer.from(bytes).toString('base64');
    }

    ArrayProxy.Serialize<byte>(outputBytes, [...Buffer.from(JSON.stringify(payloadObj))], ByteProxy.Serialize);

    return [[...Buffer.from(JSON.stringify(payloadObj))], payloadObj];
  }

  public static Decode<T>(json: string, crypto: RijndaelCryptoProvider | null): [T | null, WebSocketPayload | null] {
    if (!json.trim().length) return [null, null];

    let payloadObj;
    try {
      payloadObj = new WebSocketPayload(JSON.parse(json));
    } catch (e: any) {
      Log.info(json);
      Log.error(e);

      return [null, null];
    }

    if (!payloadObj) return [null, null];

    let data = Buffer.from(payloadObj.Data, 'base64');
    if (crypto != null && payloadObj.IsEncrypted) {
      data = crypto.decrypt(data);
    }

    const bytes = [...data];
    let result: any;
    switch (payloadObj.Type) {
      case PacketType.MagicBytes:
      case PacketType.Ping:
      case PacketType.Pong:
        break;
      case PacketType.ClientInfo:
      case PacketType.ConnectionStatus:
      case PacketType.Command:
      case PacketType.Error:
      case PacketType.CommandOutput:
      case PacketType.ChatMessage:
        result = JSON.parse(StringProxy.Deserialize(bytes));
        break;
      case PacketType.Monitoring:
      case PacketType.BanPlayer:
        result = DictionaryProxy.Deserialize<string, object>(bytes, StringProxy.Deserialize, (stream) => JSON.parse(StringProxy.Deserialize(stream)));
        break;
      case PacketType.PlayerList:
        /// TODO;
        break;
      case PacketType.PlayerJoined:
      case PacketType.PlayerLeft:
        result = CommActorInfoProxy.Deserialize(bytes);
        break;
      case PacketType.RoomOpened:
      case PacketType.RoomClosed:
        result = GameRoomDataProxy.Deserialize(bytes);
        break;
      case PacketType.RoundStarted:
        result = [
          GameRoomDataProxy.Deserialize(bytes),
        ];
        break;
      case PacketType.RoundEnded:
        result = [
          GameRoomDataProxy.Deserialize(bytes),
          EndOfMatchDataProxy.Deserialize(bytes),
        ];
        break;
      case PacketType.OpenRoom:
        /// TODO
        break;
      case PacketType.CloseRoom:
        result = Int32Proxy.Deserialize(bytes);
        break;
      default:
        Log.warn(`Rejecting to decode payload of type ${PacketType[payloadObj.Type]}: Unknown type.`);
        break;
    }

    return [result as T, payloadObj];
  }
}

const CONNECT_TIMEOUT = 5;
const RECONNECT_INTERVAL = 10;
const MAX_RECONNECT = 10;
const SEND_TIMEOUT = 3;
const RECEIVE_TIMEOUT = 3;
const PING_INTERVAL = 10;

export class WebSocketConnection {
  public ConnectionId: string;
  public Socket: WebSocket;
  public Info: SocketInfo;
  public CryptoProvider: RijndaelCryptoProvider;
  // public byte[] MessageBuffer;
  public DisconnectReason: string;
  public LastResponseTime: Date;

  private sendTask?: Promise<void>;
  private receiveTask?: Promise<void>;

  private pingTask?: ReturnType<typeof setInterval>;
  private pingDisconnect?: ReturnType<typeof setTimeout>;

  constructor(params: any = {}) {
    Object.keys(params).filter((key) => key in this).forEach((key) => { this[key] = params[key]; });

    // if (this.Socket) {
    //   this.Socket.on('message', (data) => {
    //     Log.debug("GOT TEST DATA");
    //     Log.debug([...data as Buffer].toString());
    //     Log.debug("DONE WITH TEST DATA");
    //   });
    // }
  }

  private connectionState: SocketState = SocketState.Disconnected;
  public get ConnectionState(): SocketState {
    return this.connectionState;
  }

  private set ConnectionState(value: SocketState) {
    this.connectionState = value;

    // StateChanged?.Invoke(this, new SocketStateChangedEventArgs {
    //   Socket = this,
    //   State = value
    // });
  }

  public get RemoteAddress(): string | undefined {
    return this.Socket._socket.remoteAddress;
  }

  public get Identifier(): string {
    return this.Info.SocketId;
  }

  public get Type(): ServerType {
    return this.Info.Type;
  }

  public get IsConnected(): boolean {
    return this.Socket.readyState === WebSocket.OPEN;
  }

  public async SendBytes(bytes: Buffer | byte[] | Uint8Array) {
    if (!this.IsConnected) throw new Error('SocketException');

    if (this.sendTask) await this.sendTask;
    if (this.receiveTask) await this.receiveTask;

    try {
      this.ConnectionState = SocketState.Sending;

      this.sendTask = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.sendTask = undefined;
          reject(new Error(`Failed to send data within ${SEND_TIMEOUT} second(s).`));
        }, SEND_TIMEOUT * 1000);

        this.Socket.send(bytes, (error) => {
          clearTimeout(timer);
          if (error) return reject(error);
          return resolve();
        });
      });

      await this.sendTask;
      this.sendTask = undefined;
      this.ConnectionState = SocketState.Connected;
    } catch {

    }
  }

  public async SendPacket(type: PacketType) {
    const bytes = [];

    Int32Proxy.Serialize(bytes, 0x42);
    EnumProxy.Serialize<PacketType>(bytes, type);

    await this.SendBytes(bytes);
  }

  public async Send(type: PacketType, payload: any, oneWay: boolean = true, conversationId: string | null = null, serverType: ServerType = ServerType.None) {
    const [bytes, payloadObj] = WebSocketPayload.Encode(type, payload, null, oneWay, conversationId, serverType);
    await this.SendBytes(bytes!);

    if (oneWay) return null;
  }

  public OnOpen(): void {
    this.pingTask = setInterval(() => {
      this.SendPacket(PacketType.Ping);

      this.pingDisconnect = setTimeout(() => {
        this.Socket.close();
      }, RECEIVE_TIMEOUT * 1000);
    }, PING_INTERVAL * 1000);
  }

  public OnClose(): void {
    clearInterval(this.pingTask);
  }

  public ResetPingTimeout(): void {
    this.LastResponseTime = new Date();
    clearTimeout(this.pingDisconnect);
  }
}

export default class WebSocketHost extends EventEmitter {
  public readonly port: number;

  public readonly socket: WebSocketServer;

  private CommServer?: WebSocketConnection;
  private GameServers: WebSocketConnection[] = [];

  private ConnectedSockets: { [key: string]: WebSocketConnection } = {};
  private CryptoProviders: { [key: string]: RijndaelCryptoProvider } = {};

  constructor(port: number = 8080) {
    super();

    this.port = port;
    this.socket = new WebSocketServer({ port: this.port });

    this.socket.on('connection', (client, req) => {
      const socketClient = new WebSocketConnection({
        ConnectionId: uuid(),
        Socket: client,
        MessageBuffer: [],
        Info: new SocketInfo({
          IsClient: true,
        }),
      });

      // this.sendToClient(client, PacketType.MagicBytes);
      socketClient.SendPacket(PacketType.MagicBytes);

      client.on('close', () => {
        try {
          if (Object.keys(this.ConnectedSockets).includes(socketClient.ConnectionId)) {
            socketClient.OnClose();

            delete this.ConnectedSockets[socketClient.ConnectionId];

            switch (socketClient.Type) {
              case ServerType.Comm:
                if (this.CommServer && this.CommServer.ConnectionId === socketClient.ConnectionId) {
                  this.CommServer = undefined;
                }
                break;

              case ServerType.Game:
                if (this.GameServers.includes(socketClient)) {
                  this.GameServers = this.GameServers.filter((_) => _ !== socketClient);
                }
                break;

              default:
                break;
            }

            if (Object.keys(this.CryptoProviders).includes(socketClient.ConnectionId)) {
              delete this.CryptoProviders[socketClient.ConnectionId];
            }
          }

          this.emit('ClientDisconnected', {
            Info: socketClient.Info,
            Socket: socketClient,
            Reason: socketClient.DisconnectReason,
          });

          client.close();
        } catch (e: any) {
          Log.error(e);
        }
      });

      client.on('message', async (data) => {
        const inputBytes = [...data as Buffer];

        const payloadType = Int32Proxy.Deserialize(inputBytes);
        if (payloadType === 0x42) { // Packet / Raw Data
          const packetType = EnumProxy.Deserialize<PacketType>(inputBytes);
          switch (packetType) {
            case PacketType.MagicBytes: {
              const magicBytes = ArrayProxy.Deserialize<number>(inputBytes, ByteProxy.Deserialize);

              if (!magicBytes.length || ![...magicBytes].reverse().every((val, index) => val === MAGIC_BYTES[index])) {
                client.close();
              }

              socketClient.SendPacket(PacketType.ClientInfo);
              break;
            }
            case PacketType.Pong:
              socketClient.ResetPingTimeout();
              break;
            default: break;
          }
        } else { // JSON Object
          const [payload, payloadObj] = WebSocketPayload.Decode<any>(data.toString('utf-8'), socketClient.CryptoProvider);

          if (!payloadObj) return;

          switch (payloadObj.Type) {
            case PacketType.ClientInfo: {
              const clientInfo = payload! as SocketInfo;

              socketClient.Info.SocketId = clientInfo.SocketId;
              socketClient.Info.Type = clientInfo.Type;

              const passphrase = ParadiseServiceSettings.ServerPassPhrases.find((_) => _.Id.toLowerCase() === socketClient.Identifier.toLowerCase())?.PassPhrase.trim();

              if (!passphrase || !passphrase.length) {
                socketClient.DisconnectReason = 'Unknown server';

                this.emit('ConnectionRejected', {
                  Info: clientInfo,
                  Socket: socketClient,
                  Reason: socketClient.DisconnectReason,
                });

                await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                  Connected: false,
                  Rejected: true,
                  DisconnectReason: socketClient.DisconnectReason,
                }), true, payloadObj.ConversationId);

                client.close();

                return;
              }

              switch (clientInfo.Type) {
                case ServerType.Comm:
                  if (this.CommServer) {
                    socketClient.DisconnectReason = 'Cannot register more than one Comm Server';

                    this.emit('ConnectionRejected', {
                      Info: clientInfo,
                      Socket: socketClient,
                      Reason: socketClient.DisconnectReason,
                    });

                    await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                      Connected: false,
                      Rejected: true,
                      DisconnectReason: socketClient.DisconnectReason,
                    }), true, payloadObj.ConversationId);

                    client.close();

                    return;
                  }

                  this.CommServer = socketClient;

                  break;
                case ServerType.Game:
                  if (this.GameServers.find((_) => _.Identifier === socketClient.Identifier)) {
                    socketClient.DisconnectReason = 'Duplicate server identifier';

                    this.emit('ConnectionRejected', {
                      Info: clientInfo,
                      Socket: socketClient,
                      Reason: socketClient.DisconnectReason,
                    });

                    await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                      Connected: false,
                      Rejected: true,
                      DisconnectReason: socketClient.DisconnectReason,
                    }), true, payloadObj.ConversationId);

                    client.close();

                    return;
                  }

                  this.GameServers.push(socketClient);

                  break;
                default:
                  socketClient.DisconnectReason = 'Invalid server type';

                  this.emit('ConnectionRejected', {
                    Info: clientInfo,
                    Socket: socketClient,
                    Reason: socketClient.DisconnectReason,
                  });

                  await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                    Connected: false,
                    Rejected: true,
                    DisconnectReason: socketClient.DisconnectReason,
                  }), true, payloadObj.ConversationId);

                  client.close();

                  return;
              }

              this.ConnectedSockets[socketClient.ConnectionId] = socketClient;

              const uuidByteArray = [...Buffer.from(socketClient.Info.SocketId.replaceAll('-', ''), 'hex')];
              const uuidBytes = Buffer.from(uuidByteArray.slice(0, 4).reverse().concat(uuidByteArray.slice(4, 6).reverse())
                .concat(uuidByteArray.slice(6, 8).reverse())
                .concat(uuidByteArray.slice(8)));
              this.CryptoProviders[socketClient.ConnectionId] = new RijndaelCryptoProvider(Buffer.from(passphrase, 'utf-8'), uuidBytes, uuidBytes);
              socketClient.CryptoProvider = this.CryptoProviders[socketClient.ConnectionId];

              this.emit('ClientConnected', {
                Socket: socketClient,
              });

              socketClient.OnOpen();

              await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                Connected: true,
              }), true, payloadObj.ConversationId);

              break;
            }
            default:
              Log.debug(PacketType[payloadObj.Type]);
              this.emit('DataReceived', {
                Socket: socketClient,
                Payload: payloadObj,
              });
              break;
          }
        }
      });
    });

    this.socket.on('close', (client) => {
      console.log('close');
    });
  }

  private sendToClient(client: WebSocket, type: PacketType, payload?: any, isOneWay: boolean = false) {
    if (client.readyState !== WebSocket.OPEN) {
      Log.error(`Failed to send payload to WebSocket client: readyState is ${client.readyState}`);
      return;
    }

    client.send(WebSocketPayload.Encode(type, payload, null, null, isOneWay));
  }

  public async start(): Promise<void> { }
}
