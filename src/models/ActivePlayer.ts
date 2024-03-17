import { DataTypes, Model, type Sequelize } from 'sequelize';

export interface ActivePlayerAttributes {
  Cmid?: number;
  IPAddress?: string;
  CommServerId?: number;
  GameServerId?: number;
  GameRoomId?: number;
}

export default class ActivePlayer extends Model<ActivePlayerAttributes> {
  declare Cmid: number;
  declare IPAddress: string;
  declare CommServerId: number;
  declare GameServerId: number;
  declare GameRoomId: number;

  public static initialize(sequelize: Sequelize) {
    ActivePlayer.init({
      Cmid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      IPAddress: DataTypes.STRING,
      CommServerId: DataTypes.INTEGER,
      GameServerId: DataTypes.INTEGER,
      GameRoomId: DataTypes.INTEGER,
    }, {
      sequelize,
      timestamps: false,
    });
  }

  public static associate({ PublicProfile, PhotonServer, GameRoom }) {
    ActivePlayer.belongsTo(PublicProfile, {
      foreignKey: 'Cmid',
      targetKey: 'Cmid',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
}
