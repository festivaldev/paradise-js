import { DataTypes, Model, type Sequelize } from 'sequelize';

export interface DiscordUserAttributes {
  Cmid?: number;
  DiscordUserId?: string | null;
  Nonce?: string | null;
}

export default class DiscordUser extends Model<DiscordUserAttributes> {
  declare Cmid: number;
  declare DiscordUserId: string | null;
  declare Nonce: string | null;

  public static initialize(sequelize: Sequelize) {
    DiscordUser.init({
      Cmid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      DiscordUserId: DataTypes.STRING,
      Nonce: DataTypes.TEXT,
    }, {
      sequelize,
      timestamps: false,
    });
  }

  public static associate({ PublicProfile }) {
    DiscordUser.belongsTo(PublicProfile, {
      foreignKey: 'Cmid',
      targetKey: 'Cmid',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
}
