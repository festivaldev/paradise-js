import { ItemShopHighlightType, UberstrikeItemClass } from '@festivaldev/uberstrike-js/UberStrike/Core/Types';
import { DataTypes, Model, type Sequelize } from 'sequelize';
import { ShopItemAttributes } from './ShopItemAttributes';
import ShopItemPrice from './ShopItemPrice';

export interface ShopGearItemAttributes extends ShopItemAttributes {
  ArmorPoints?: number;
  ArmorWeight?: number;
  ArmorAbsorptionPercent?: number;
}

export default class ShopGearItem extends Model<ShopGearItemAttributes> {
  declare ID: number;
  declare Name: string;
  declare PrefabName: string;
  declare Description: string;
  declare ItemClass: UberstrikeItemClass;
  declare LevelLock: number;
  declare MaxDurationDays: number;
  declare IsConsumable: boolean;
  declare ShopHighlightType: ItemShopHighlightType;
  declare CustomProperties: { [key: string]: string };
  declare ItemProperties: { [key: string]: string };

  // Gear specific
  declare ArmorPoints: number;
  declare ArmorWeight: number;
  declare ArmorAbsorptionPercent: number;

  declare Prices: ShopItemPrice[];

  public static initialize(sequelize: Sequelize) {
    ShopGearItem.init({
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      Name: DataTypes.STRING,
      PrefabName: DataTypes.STRING,
      Description: DataTypes.STRING,
      ItemClass: DataTypes.INTEGER,
      LevelLock: DataTypes.INTEGER,
      MaxDurationDays: DataTypes.INTEGER,
      IsConsumable: DataTypes.BOOLEAN,
      ShopHighlightType: DataTypes.INTEGER,
      CustomProperties: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      ItemProperties: {
        type: DataTypes.JSON,
        defaultValue: {},
      },

      // Gear specific
      ArmorPoints: DataTypes.INTEGER,
      ArmorWeight: DataTypes.INTEGER,
      ArmorAbsorptionPercent: DataTypes.INTEGER,
    }, {
      sequelize,
      timestamps: false,
    });
  }

  public static associate({ ShopItemPrice }) {
    ShopGearItem.hasMany(ShopItemPrice, {
      as: 'Prices',
      constraints: false,
      foreignKey: 'ID',
      sourceKey: 'ID',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }

  public get IsForSale(): bool {
    return this.Prices?.length > 0;
  }
}
