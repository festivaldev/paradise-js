import { DataTypes, Model, type Sequelize } from 'sequelize';
import { GameModeType } from 'uberstrike-js/dist/UberStrike/Core/Types';

export interface GameRoomAttributes {
  Number?: number;
  Server?: string;
  Name?: string;
  // Guid?: string;
  IsPasswordProtected?: boolean;
  GameMode?: GameModeType;
  PlayerLimit?: number;
  ConnectedPlayers?: number;
  TimeLimit?: number;
  KillLimit?: number;
  GameFlags?: number;
  MapID?: number;
  LevelMin?: number;
  LevelMax?: number;
  IsPermanentGame?: boolean;
}

export default class GameRoom extends Model<GameRoomAttributes> {
  declare Number: number;
  declare Server: string;
  declare Name: string;
  // declare Guid: string;
  declare IsPasswordProtected: boolean;
  declare GameMode: GameModeType;
  declare PlayerLimit: number;
  declare ConnectedPlayers: number;
  declare TimeLimit: number;
  declare KillLimit: number;
  declare GameFlags: number;
  declare MapID: number;
  declare LevelMin: number;
  declare LevelMax: number;
  declare IsPermanentGame: boolean;

  public static initialize(sequelize: Sequelize) {
    GameRoom.init({
      Number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      Server: DataTypes.STRING,
      Name: DataTypes.STRING(16),
      IsPasswordProtected: DataTypes.BOOLEAN,
      GameMode: DataTypes.INTEGER,
      PlayerLimit: DataTypes.INTEGER,
      ConnectedPlayers: DataTypes.INTEGER,
      TimeLimit: DataTypes.INTEGER,
      KillLimit: DataTypes.INTEGER,
      GameFlags: DataTypes.INTEGER,
      MapID: DataTypes.INTEGER,
      LevelMin: DataTypes.INTEGER,
      LevelMax: DataTypes.INTEGER,
      IsPermanentGame: DataTypes.BOOLEAN,
    }, {
      sequelize,
      timestamps: false,
    });
  }

  public static associate(_) { }
}
