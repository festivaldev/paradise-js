import ParadiseServiceSettings from '@/ParadiseServiceSettings';
import { ArrayProxy, ByteProxy, EnumProxy, Int32Proxy, StringProxy } from '@/UberStrike/Core/Serialization';
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
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}

class SocketConnectionStatus {
  public Connected: boolean;
  public Rejected: boolean;
  public DisconnectReason: string;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
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

enum PacketType {
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
  // PlayerList,
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
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
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
      case PacketType.ClientInfo:
        StringProxy.Serialize(bytes, JSON.stringify(data));
        break;
      case PacketType.ConnectionStatus:
        StringProxy.Serialize(bytes, JSON.stringify(data));
        break;
      default: return [null, null];
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
      case PacketType.ClientInfo:
        result = JSON.parse(StringProxy.Deserialize(bytes));
        break;
      case PacketType.ConnectionStatus:
        result = JSON.parse(StringProxy.Deserialize(bytes));
        break;

      case PacketType.CommandOutput:
        result = StringProxy.Deserialize(bytes);
        break;
      default: break;
    }

    return [result, payloadObj];
  }
}

const CONNECT_TIMEOUT = 5;
const RECONNECT_INTERVAL = 10;
const MAX_RECONNECT = 10;
const SEND_TIMEOUT = 3;
const RECEIVE_TIMEOUT = 3;

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

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }

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
        const outputBytes = [];

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

              // TODO: Add encryption stuff
              const uuidByteArray = [...Buffer.from(('3f1f73a2-2239-4c81-b4d7-1afb8713a703').replaceAll('-', ''), 'hex')];
              const uuidBytes = Buffer.from(uuidByteArray.slice(0, 4).reverse().concat(uuidByteArray.slice(4, 6).reverse())
                .concat(uuidByteArray.slice(6, 8).reverse())
                .concat(uuidByteArray.slice(8)));
              this.CryptoProviders[socketClient.ConnectionId] = new RijndaelCryptoProvider(Buffer.from(passphrase, 'utf-8'), uuidBytes, uuidBytes);
              socketClient.CryptoProvider = this.CryptoProviders[socketClient.ConnectionId];

              this.emit('ClientConnected', {
                Socket: socketClient,
              });

              await socketClient.Send(PacketType.ConnectionStatus, new SocketConnectionStatus({
                Connected: true,
              }), true, payloadObj.ConversationId);

              break;
            }

            case PacketType.CommandOutput: {
              // const key = crypto.pbkdf2Sync('A0670cy/I52btR5Gs1lFkHuH2ivNaWGGmbaQWbcZ7Gi1ozu8K9lks13awZPBC6zHtX9bR9lOcvNPqTRm2sEoEg==', Buffer.from('3f1f73a2-2239-4c81-b4d7-1afb8713a703', 'utf-8'), 10000, 32, 'sha1');
              // const iv = Buffer.from('3f1f73a2-2239-4c81-b4d7-1afb8713a703', 'utf-8');
              // const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

              // // Decrypt the ciphertext
              // let decrypted = decipher.update(payloadObj.Data, 'base64', 'utf-8');
              // decrypted += decipher.final('utf-8');

              // console.log(decrypted);
              console.log(payload);
              break;
            }
            default: break;
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
