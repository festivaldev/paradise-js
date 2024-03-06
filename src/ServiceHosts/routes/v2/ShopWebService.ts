import {
  BundleCategoryType, BundleView, BuyItemResult, BuyingDurationType, BuyingLocationType, BuyingRecommendationType, ChannelType, PackType, PaymentProviderType, UberStrikeCurrencyType,
} from '@/Cmune/DataCenter/Common/Entities';
import { UberStrikeItemShopClientView } from '@/UberStrike/Core/Models/Views';
import {
  BooleanProxy,
  BundleViewProxy, EnumProxy, Int32Proxy, ListProxy, StringProxy, UberStrikeItemShopClientViewProxy,
} from '@/UberStrike/Core/Serialization';
import { UberstrikeItemType } from '@/UberStrike/Core/Types';
import {
  CurrencyDeposit, ItemTransaction, MemberWallet, PlayerInventoryItem, PlayerStatistics, PublicProfile, ShopBundle, ShopBundleItem, ShopFunctionalItem, ShopGearItem, ShopItemPrice, ShopQuickItem, ShopWeaponItem,
} from '@/models';
import { ApiVersion, XpPointsUtil } from '@/utils';
import crypto from 'crypto';
import moment from 'moment';
import { Op } from 'sequelize';
import BaseWebService from './BaseWebService';

export default class ShopWebService extends BaseWebService {
  public static get ServiceName(): string { return 'ShopWebService'; }
  public static get ServiceVersion(): string { return ApiVersion.Current; }
  protected static get ServiceInterface(): string { return 'IShopWebServiceContract'; }

  static async BuyBundle(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const bundleId = Int32Proxy.Deserialize(bytes);
      const channel = EnumProxy.Deserialize<ChannelType>(bytes);
      const hashedReceipt = StringProxy.Deserialize(bytes);

      this.debugEndpoint('BuyBundle', authToken, bundleId, channel, hashedReceipt);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('BuyBundle', error);
    }
  }

  static async BuyBundleSteam(bytes: byte[], outputStream: byte[]) {
    try {
      const bundleId = Int32Proxy.Deserialize(bytes);
      const steamId = StringProxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('BuyBundleSteam', bundleId, steamId, authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

          if (publicProfile) {
            const bundle = await ShopBundle.findOne({
              where: { Id: bundleId },
              include: [{
                model: ShopBundleItem,
                as: 'BundleItemViews',
                required: false,
              }],
            });

            if (bundle) {
              const memberWallet = await MemberWallet.findOne({ where: { Cmid: steamMember.Cmid } });

              if (memberWallet) {
                const transactionKey = crypto.randomBytes(32).toString('hex');

                await CurrencyDeposit.create({
                  BundleId: bundle.Id,
                  BundleName: bundle.Name,
                  ChannelId: ChannelType.Steam,
                  Cmid: publicProfile.Cmid,
                  Credits: bundle.Credits,
                  CreditsDepositId: Math.randomInt(),
                  CurrencyLabel: 'USD',
                  DepositDate: new Date(),
                  PaymentProviderId: PaymentProviderType.Cmune,
                  Points: bundle.Points,
                  TransactionKey: transactionKey,
                  UsdAmount: bundle.USDPrice,
                });

                if (bundle.BundleItemViews?.length) {
                  for (const bundleItem of bundle.BundleItemViews) {
                    let expirationDate: Date | null = null;

                    switch (bundleItem.Duration) {
                      case BuyingDurationType.OneDay:
                        expirationDate = moment(new Date()).add(1, 'day').toDate();
                        break;
                      case BuyingDurationType.SevenDays:
                        expirationDate = moment(new Date()).add(7, 'days').toDate();
                        break;
                      case BuyingDurationType.ThirtyDays:
                        expirationDate = moment(new Date()).add(30, 'days').toDate();
                        break;
                      case BuyingDurationType.NinetyDays:
                        expirationDate = moment(new Date()).add(90, 'days').toDate();
                        break;
                      default: break;
                    }

                    await PlayerInventoryItem.create({
                      Cmid: publicProfile.Cmid,
                      ItemId: bundleItem.ItemId,
                      ExpirationDate: expirationDate,
                      AmountRemaining: bundleItem.Amount,
                    });

                    await ItemTransaction.create({
                      WithdrawalId: Math.randomInt(),
                      WithdrawalDate: new Date(),
                      Points: 0,
                      Credits: 0,
                      Cmid: publicProfile.Cmid,
                      IsAdminAction: false,
                      ItemId: bundleItem.ItemId,
                      Duration: bundleItem.Duration,
                    });
                  }
                }

                await memberWallet.update({
                  Credits: memberWallet.Credits! + bundle.Credits!,
                  Points: memberWallet.Points! + bundle.Points!,
                });

                BooleanProxy.Serialize(outputStream, true);
              }
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('BuyBundleSteam', error);
    }
  }

  static async BuyItem(bytes: byte[], outputStream: byte[]) {
    try {
      const itemId = Int32Proxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);
      const currencyType = EnumProxy.Deserialize<UberStrikeCurrencyType>(bytes);
      const durationType = EnumProxy.Deserialize<BuyingDurationType>(bytes);
      const itemType = EnumProxy.Deserialize<UberstrikeItemType>(bytes);
      const marketLocation = EnumProxy.Deserialize<BuyingLocationType>(bytes);
      const recommendationType = EnumProxy.Deserialize<BuyingRecommendationType>(bytes);

      this.debugEndpoint('BuyItem', itemId, authToken, currencyType, durationType, itemType, marketLocation, recommendationType);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (!steamMember) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidMember);
          return;
        }

        const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

        if (!publicProfile) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidMember);
          return;
        }

        const playerStatistics = await PlayerStatistics.findOne({ where: { Cmid: steamMember.Cmid } });
        const memberWallet = await MemberWallet.findOne({ where: { Cmid: publicProfile.Cmid } });

        if (!memberWallet) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidMember);
          return;
        }

        if (await PlayerInventoryItem.findOne({
          where: {
            Cmid: steamMember.Cmid,
            ItemId: itemId,
            ExpirationDate: {
              [Op.or]: [null, {
                [Op.gt]: new Date(),
              }],
            },
          },
        })) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.AlreadyInInventory);
          return;
        }

        let item: any = null;

        switch (itemType) {
          case UberstrikeItemType.Weapon:
            item = await ShopWeaponItem.findOne({
              where: { ID: itemId },
              include: [{
                model: ShopItemPrice,
                as: 'Prices',
                required: false,
              }],
            });
            break;
          case UberstrikeItemType.Gear:
            item = await ShopWeaponItem.findOne({
              where: { ID: itemId },
              include: [{
                model: ShopItemPrice,
                as: 'Prices',
                required: false,
              }],
            });
            break;
          case UberstrikeItemType.QuickUse:
            item = await ShopWeaponItem.findOne({
              where: { ID: itemId },
              include: [{
                model: ShopItemPrice,
                as: 'Prices',
                required: false,
              }],
            });
            break;
          case UberstrikeItemType.Functional:
            item = await ShopWeaponItem.findOne({
              where: { ID: itemId },
              include: [{
                model: ShopItemPrice,
                as: 'Prices',
                required: false,
              }],
            });
            break;
          default: break;
        }

        if (!item) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.ItemNotFound);
          return;
        }

        if (!item.IsForSale) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.IsNotForSale);
          return;
        }

        if (XpPointsUtil.GetLevelForXp(playerStatistics!.Xp) < item.LevelLock) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidLevel);
          return;
        }

        if (currencyType === UberStrikeCurrencyType.Credits) {
          const price = item.Prices.find((_) => _.Currency === UberStrikeCurrencyType.Credits);
          if (!price) {
            Int32Proxy.Serialize(outputStream, BuyItemResult.IsNotForSale);
            return;
          }

          if (memberWallet.Credits! < price.Price) {
            Int32Proxy.Serialize(outputStream, BuyItemResult.NotEnoughCurrency);
            return;
          }

          await memberWallet.update({
            Credits: memberWallet.Credits! - price.Price,
          });

          await ItemTransaction.create({
            Cmid: publicProfile.Cmid,
            Duration: durationType,
            ItemId: itemId,
            Credits: price.Price,
            WithdrawalDate: new Date(),
            WithdrawalId: Math.randomInt(),
          });
        } else if (currencyType === UberStrikeCurrencyType.Points) {
          const price = item.Prices.find((_) => _.Currency === UberStrikeCurrencyType.Points);
          if (!price) {
            Int32Proxy.Serialize(outputStream, BuyItemResult.IsNotForSale);
            return;
          }

          if (memberWallet.Points! < price.Price) {
            Int32Proxy.Serialize(outputStream, BuyItemResult.NotEnoughCurrency);
            return;
          }

          await memberWallet.update({
            Credits: memberWallet.Points! - price.Price,
          });

          await ItemTransaction.create({
            Cmid: publicProfile.Cmid,
            Duration: durationType,
            ItemId: itemId,
            Points: price.Price,
            WithdrawalDate: new Date(),
            WithdrawalId: Math.randomInt(),
          });
        } else {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidData);
          return;
        }

        let expirationDate;

        switch (durationType) {
          case (BuyingDurationType.OneDay):
            expirationDate = moment(new Date()).add(1, 'day').toDate();
            break;
          case (BuyingDurationType.SevenDays):
            expirationDate = moment(new Date()).add(7, 'days').toDate();
            break;
          case (BuyingDurationType.ThirtyDays):
            expirationDate = moment(new Date()).add(30, 'days').toDate();
            break;
          case (BuyingDurationType.NinetyDays):
            expirationDate = moment(new Date()).add(90, 'days').toDate();
            break;
          default: break;
        }

        await PlayerInventoryItem.create({
          Cmid: publicProfile.Cmid,
          ItemId: itemId,
          AmountRemaining: -1,
          ExpirationDate: expirationDate,
        });

        Int32Proxy.Serialize(outputStream, BuyItemResult.OK);
      }
    } catch (error) {
      this.handleEndpointError('BuyItem', error);
    }
  }

  static async BuyPack(bytes: byte[], outputStream: byte[]) {
    try {
      const itemId = Int32Proxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);
      const packType = EnumProxy.Deserialize<PackType>(bytes);
      const currencyType = EnumProxy.Deserialize<UberStrikeCurrencyType>(bytes);
      const itemType = EnumProxy.Deserialize<UberstrikeItemType>(bytes);
      const marketLocation = EnumProxy.Deserialize<BuyingLocationType>(bytes);
      const recommendationType = EnumProxy.Deserialize<BuyingRecommendationType>(bytes);

      this.debugEndpoint('BuyPack', itemId, authToken, packType, currencyType, itemType, marketLocation, recommendationType);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('BuyPack', error);
    }
  }

  static async FinishBuyBundleSteam(bytes: byte[], outputStream: byte[]) {
    try {
      const orderId = StringProxy.Deserialize(bytes);

      this.debugEndpoint('FinishBuyBundleSteam', orderId);

      BooleanProxy.Serialize(outputStream, true);
    } catch (error) {
      this.handleEndpointError('FinishBuyBundleSteam', error);
    }
  }

  static async GetAllLuckyDraws_1(bytes: byte[], outputStream: byte[]) {
    try {
      this.debugEndpoint('GetAllLuckyDraws_1');

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetAllLuckyDraws_1', error);
    }
  }

  static async GetAllLuckyDraws_2(bytes: byte[], outputStream: byte[]) {
    try {
      const bundleCategoryType = EnumProxy.Deserialize<BundleCategoryType>(bytes);

      this.debugEndpoint('GetAllLuckyDraws_2', bundleCategoryType);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetAllLuckyDraws_2', error);
    }
  }

  static async GetAllMysteryBoxs_1(bytes: byte[], outputStream: byte[]) {
    try {
      this.debugEndpoint('GetAllMysteryBoxs_1');

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetAllMysteryBoxs_1', error);
    }
  }

  static async GetAllMysteryBoxs_2(bytes: byte[], outputStream: byte[]) {
    try {
      const bundleCategoryType = EnumProxy.Deserialize<BundleCategoryType>(bytes);

      this.debugEndpoint('GetAllMysteryBoxs_2', bundleCategoryType);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetAllMysteryBoxs_2', error);
    }
  }

  static async GetBundles(bytes: byte[], outputStream: byte[]) {
    try {
      const channelType = EnumProxy.Deserialize<ChannelType>(bytes);

      this.debugEndpoint('GetBundles', channelType);

      const bundles = (await ShopBundle.findAll({
        include: [{
          model: ShopBundleItem,
          as: 'BundleItemViews',
          required: false,
        }],
      })).filter((_) => _.Availability!.includes(channelType));

      ListProxy.Serialize<BundleView>(outputStream, bundles as BundleView[], BundleViewProxy.Serialize);
    } catch (error) {
      this.handleEndpointError('GetBundles', error);
    }
  }

  static async GetLuckyDraw(bytes: byte[], outputStream: byte[]) {
    try {
      const luckyDrawId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetLuckyDraw', luckyDrawId);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetLuckyDraw', error);
    }
  }

  static async GetMysteryBox(bytes: byte[], outputStream: byte[]) {
    try {
      const mysteryBoxId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetMysteryBox', mysteryBoxId);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetMysteryBox', error);
    }
  }

  static async GetShop(bytes: byte[], outputStream: byte[]) {
    try {
      this.debugEndpoint('GetShop');

      UberStrikeItemShopClientViewProxy.Serialize(outputStream, new UberStrikeItemShopClientView({
        FunctionalItems: await ShopFunctionalItem.findAll({ include: [{ model: ShopItemPrice, as: 'Prices', required: false }] }),
        GearItems: await ShopGearItem.findAll({ include: [{ model: ShopItemPrice, as: 'Prices', required: false }] }),
        QuickItems: await ShopQuickItem.findAll({ include: [{ model: ShopItemPrice, as: 'Prices', required: false }] }),
        WeaponItems: await ShopWeaponItem.findAll({ include: [{ model: ShopItemPrice, as: 'Prices', required: false }] }),
      }));
    } catch (error) {
      this.handleEndpointError('GetShop', error);
    }
  }

  static async RollLuckyDraw(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const luckDrawId = Int32Proxy.Deserialize(bytes);
      const channel = EnumProxy.Deserialize<ChannelType>(bytes);

      this.debugEndpoint('RollLuckyDraw', authToken, luckDrawId, channel);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('RollLuckyDraw', error);
    }
  }

  static async RollMysteryBox(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const mysteryBoxId = Int32Proxy.Deserialize(bytes);
      const channel = EnumProxy.Deserialize<ChannelType>(bytes);

      this.debugEndpoint('RollMysteryBox', authToken, mysteryBoxId, channel);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('RollMysteryBox', error);
    }
  }

  static async UseConsumableItem(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const itemId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('UseConsumableItem', authToken, itemId);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('UseConsumableItem', error);
    }
  }

  static async VerifyReceipt(bytes: byte[], outputStream: byte[]) {
    try {
      const hashedReceipt = StringProxy.Deserialize(bytes);

      this.debugEndpoint('VerifyReceipt', hashedReceipt);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('VerifyReceipt', error);
    }
  }
}
