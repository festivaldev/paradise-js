import {
  BuyItemResult, ItemInventoryView, MemberAccessLevel, MemberOperationResult, MemberView, MemberWalletView,
} from '@/Cmune/DataCenter/Common/Entities';
import {
  BooleanProxy, CurrencyDepositViewProxy, CurrencyDepositsViewModelProxy, EnumProxy, Int32Proxy, ItemInventoryViewProxy,
  ItemTransactionsViewModelProxy,
  ListProxy, LoadoutViewProxy, MemberWalletViewProxy, PlayerStatisticsViewProxy, PointDepositViewProxy, PointDepositsViewModelProxy, StringProxy, UberstrikeUserViewModelProxy,
} from '@/UberStrike/Core/Serialization';
import {
  CurrencyDepositsViewModel, ItemTransactionsViewModel, PointDepositsViewModel, UberstrikeUserViewModel,
} from '@/UberStrike/Core/ViewModel';
import { LoadoutView, UberstrikeMemberView } from '@/UberStrike/DataCenter/Common/Entities';
import {
  CurrencyDeposit, ItemTransaction, MemberWallet, PlayerInventoryItem, PlayerLoadout, PlayerStatistics, PointDeposit, PublicProfile,
} from '@/models';
import { ApiVersion, UberstrikeInventoryItem } from '@/utils';
import { Op } from 'sequelize';
import BaseWebService from './BaseWebService';

export default class UserWebService extends BaseWebService {
  public static get ServiceName(): string { return 'UserWebService'; }
  public static get ServiceVersion(): string { return ApiVersion.Current; }
  protected static get ServiceInterface(): string { return 'IUserWebServiceContract'; }

  static async ChangeMemberName(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const name = StringProxy.Deserialize(bytes);
      const locale = StringProxy.Deserialize(bytes);
      const machineId = StringProxy.Deserialize(bytes);

      this.debugEndpoint('ChangeMemberName', authToken, name, locale, machineId);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });
          const existingName = await PublicProfile.findOne({ where: { Name: name } });
          const nameChangeItem = await PlayerInventoryItem.findOne({ where: { Cmid: steamMember.Cmid, ItemId: UberstrikeInventoryItem.NameChange } });

          if (!nameChangeItem && publicProfile!.AccessLevel !== MemberAccessLevel.Admin) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.NameChangeNotInInventory);
          } else if (existingName != null && existingName.Cmid !== publicProfile!.Cmid) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.DuplicateName);
          } else if (name.length < 3 || !name.match(/^[a-zA-Z0-9_]+$/)) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidName);
          } else if (/* ProfanityFilter.DetectAllProfanities(name).Count > 0 */ false) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.OffensiveName);
          } else {
            await publicProfile!.update({
              Name: name,
            });

            await PlayerInventoryItem.destroy({
              where: {
                Cmid: publicProfile!.Cmid,
                ItemId: UberstrikeInventoryItem.NameChange,
              },
            });

            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
          }
        } else {
          EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.MemberNotFound);
        }
      }
    } catch (error) {
      this.handleEndpointError('ChangeMemberName', error);
    }
  }

  static async DepositCredits(bytes: byte[], outputStream: byte[]) {
    try {
      const depositTransaction = CurrencyDepositViewProxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('DepositCredits', depositTransaction, authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const memberWallet = await MemberWallet.findOne({ where: { Cmid: steamMember.Cmid } });

          if (memberWallet) {
            if (depositTransaction.Credits > 0) {
              await CurrencyDeposit.create({ ...depositTransaction });

              await memberWallet.update({
                Credits: memberWallet.Credits + depositTransaction.Credits,
              });

              BooleanProxy.Serialize(outputStream, true);
            } else {
              BooleanProxy.Serialize(outputStream, false);
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('DepositCredits', error);
    }
  }

  static async DepositPoints(bytes: byte[], outputStream: byte[]) {
    try {
      const depositTransaction = PointDepositViewProxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('DepositPoints', depositTransaction, authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const memberWallet = await MemberWallet.findOne({ where: { Cmid: steamMember.Cmid } });

          if (memberWallet) {
            if (depositTransaction.Points > 0) {
              await PointDeposit.create({ ...depositTransaction });

              await memberWallet.update({
                Points: memberWallet.Points + depositTransaction.Points,
              });

              BooleanProxy.Serialize(outputStream, true);
            } else {
              BooleanProxy.Serialize(outputStream, false);
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('DepositPoints', error);
    }
  }

  static async GenerateNonDuplicatedMemberNames(bytes: byte[], outputStream: byte[]) {
    try {
      const username = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GenerateNonDuplicatedMemberNames', username);

      const generatedUsernames: any[] = [];

      while (generatedUsernames.length < 3) {
        const number = Math.randomInt(1, 99999);

        const generatedUsername = `${username.substring(0, Math.min(username.length, 18 - String(number).length))}${number}`;

        if (!(await PublicProfile.findOne({ where: { Name: generatedUsername } }))) {
          generatedUsernames.push(generatedUsername);
        }
      }

      ListProxy.Serialize<string>(outputStream, generatedUsernames, StringProxy.Serialize);
    } catch (error) {
      this.handleEndpointError('GenerateNonDuplicatedMemberNames', error);
    }
  }

  static async GetCurrencyDeposits(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const pageIndex = Int32Proxy.Deserialize(bytes);
      const elementPerPage = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetCurrencyDeposits', authToken, pageIndex, elementPerPage);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const currencyDeposits = await CurrencyDeposit.findAll({
            where: {
              Cmid: steamMember.Cmid,
            },
            raw: true,
          });

          CurrencyDepositsViewModelProxy.Serialize(outputStream, new CurrencyDepositsViewModel({
            CurrencyDeposits: currencyDeposits.slice((pageIndex - 1) * elementPerPage, ((pageIndex - 1) * elementPerPage) + elementPerPage),
            TotalCount: currencyDeposits.length,
          }));
        }
      }
    } catch (error) {
      this.handleEndpointError('GetCurrencyDeposits', error);
    }
  }

  static async GetInventory(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetInventory', authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const playerInventoryItems = await PlayerInventoryItem.findAll({
            where: {
              Cmid: steamMember.Cmid,
              [Op.or]: [{ ExpirationDate: null }, { ExpirationDate: { [Op.gte]: new Date() } }],
            },
            raw: true,
          });

          ListProxy.Serialize<ItemInventoryView>(outputStream, playerInventoryItems as ItemInventoryView[], ItemInventoryViewProxy.Serialize);
        }
      }
    } catch (error) {
      this.handleEndpointError('GetInventory', error);
    }
  }

  static async GetItemTransactions(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const pageIndex = Int32Proxy.Deserialize(bytes);
      const elementPerPage = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetItemTransactions', authToken, pageIndex, elementPerPage);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const itemTransactions = await ItemTransaction.findAll({
            where: {
              Cmid: steamMember.Cmid,
            },
            raw: true,
          });

          ItemTransactionsViewModelProxy.Serialize(outputStream, new ItemTransactionsViewModel({
            ItemTransactions: itemTransactions.slice((pageIndex - 1) * elementPerPage, ((pageIndex - 1) * elementPerPage) + elementPerPage),
            TotalCount: itemTransactions.length,
          }));
        }
      }
    } catch (error) {
      this.handleEndpointError('GetItemTransactions', error);
    }
  }

  static async GetLoadout(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetLoadout', authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);

      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          let playerLoadout = await PlayerLoadout.findOne({ where: { Cmid: steamMember.Cmid } });

          if (!playerLoadout) {
            playerLoadout = await PlayerLoadout.create({
              Cmid: steamMember.Cmid,
              Boots: UberstrikeInventoryItem.LutzDefaultGearBoots,
              Gloves: UberstrikeInventoryItem.LutzDefaultGearGloves,
              Head: UberstrikeInventoryItem.LutzDefaultGearHead,
              LowerBody: UberstrikeInventoryItem.LutzDefaultGearLowerBody,
              UpperBody: UberstrikeInventoryItem.LutzDefaultGearUpperBody,
              MeleeWeapon: UberstrikeInventoryItem.TheSplatbat,
              Weapon1: UberstrikeInventoryItem.MachineGun,
              Weapon2: UberstrikeInventoryItem.ShotGun,
              Weapon3: UberstrikeInventoryItem.SniperRifle,
            });
          }

          const playerInventory = await PlayerInventoryItem.findAll({ where: { Cmid: steamMember.Cmid } });
          playerLoadout = this.filterLoadout<PlayerLoadout>(playerLoadout, playerInventory);

          LoadoutViewProxy.Serialize(outputStream, new LoadoutView({ ...playerLoadout.get({ plain: true }) }));
        }
      }
    } catch (error) {
      this.handleEndpointError('GetLoadout', error);
    }
  }

  static async GetMember(bytes, outputStream) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });
          const memberWallet = await MemberWallet.findOne({ where: { Cmid: steamMember.Cmid } });
          const memberItems = (await PlayerInventoryItem.findAll({ where: { Cmid: steamMember.Cmid } })).map((_) => _.ItemId);
          const playerStatistics = await PlayerStatistics.findOne({ where: { Cmid: steamMember.Cmid } });

          if (publicProfile && memberWallet && memberItems && playerStatistics) {
            UberstrikeUserViewModelProxy.Serialize(outputStream, new UberstrikeUserViewModel({
              CmuneMemberView: new MemberView({
                PublicProfile: publicProfile.get({ plain: true }),
                MemberWallet: memberWallet.get({ plain: true }),
                MemberItems: memberItems,
              }),
              UberstrikeMemberView: new UberstrikeMemberView({
                PlayerStatisticsView: playerStatistics,
              }),
            }));
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('GetMember', error);
    }
  }

  static async GetMemberListSessionData(bytes, outputStream) {
    try {
      const authTokens = ListProxy.Deserialize<string>(bytes, StringProxy.Deserialize);

      this.debugEndpoint('GetMemberListSessionData', authTokens);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetMemberListSessionData', error);
    }
  }

  static async GetMemberSessionData(bytes, outputStream) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetMemberSessionData', authToken);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('GetMemberSessionData', error);
    }
  }

  static async GetMemberWallet(bytes, outputStream) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetMemberWallet', authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const memberWallet = await MemberWallet.findOne({ where: { Cmid: steamMember.Cmid } });

          if (memberWallet) {
            MemberWalletViewProxy.Serialize(outputStream, new MemberWalletView({
              ...memberWallet.get({ plain: true }),
              Credits: Math.max(memberWallet.Credits!, 0),
              Points: Math.max(memberWallet.Points!, 0),
            }));
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('GetMemberWallet', error);
    }
  }

  static async GetPointsDeposits(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const pageIndex = Int32Proxy.Deserialize(bytes);
      const elementPerPage = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetPointsDeposits', authToken, pageIndex, elementPerPage);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const pointDeposits = await PointDeposit.findAll({
            where: {
              Cmid: steamMember.Cmid,
            },
            raw: true,
          });

          PointDepositsViewModelProxy.Serialize(outputStream, new PointDepositsViewModel({
            PointDeposits: pointDeposits.slice((pageIndex - 1) * elementPerPage, ((pageIndex - 1) * elementPerPage) + elementPerPage),
            TotalCount: pointDeposits.length,
          }));
        }
      }
    } catch (error) {
      this.handleEndpointError('GetPointsDeposits', error);
    }
  }

  static async IsDuplicateMemberName(bytes: byte[], outputStream: byte[]) {
    try {
      const username = StringProxy.Deserialize(bytes);

      this.debugEndpoint('IsDuplicateMemberName', username);

      BooleanProxy.Serialize(outputStream, (await PublicProfile.findOne({ where: { Name: username } })) !== undefined);
    } catch (error) {
      this.handleEndpointError('IsDuplicateMemberName', error);
    }
  }

  static async SetLoadout(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      let loadoutView = LoadoutViewProxy.Deserialize(bytes);

      this.debugEndpoint('SetLoadout', authToken, loadoutView);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const playerInventory = await PlayerInventoryItem.findAll({ where: { Cmid: steamMember.Cmid } });

          loadoutView = this.filterLoadout(loadoutView, playerInventory);

          const playerLoadout = await PlayerLoadout.findOne({ where: { Cmid: steamMember.Cmid } });
          if (playerLoadout) {
            await playerLoadout.update({
              UpperBody: loadoutView.UpperBody,
              Weapon1: loadoutView.Weapon1,
              Weapon2: loadoutView.Weapon2,
              Weapon3: loadoutView.Weapon3,
              Type: loadoutView.Type,
              QuickItem3: loadoutView.QuickItem3,
              QuickItem2: loadoutView.QuickItem2,
              QuickItem1: loadoutView.QuickItem1,
              MeleeWeapon: loadoutView.MeleeWeapon,
              LowerBody: loadoutView.LowerBody,
              Head: loadoutView.Head,
              Gloves: loadoutView.Gloves,
              FunctionalItem3: loadoutView.FunctionalItem3,
              FunctionalItem2: loadoutView.FunctionalItem2,
              FunctionalItem1: loadoutView.FunctionalItem1,
              Face: loadoutView.Face,
              Cmid: loadoutView.Cmid,
              Boots: loadoutView.Boots,
              Backpack: loadoutView.Backpack,
              LoadoutId: loadoutView.LoadoutId,
              Webbing: loadoutView.Webbing, // Holo
              SkinColor: loadoutView.SkinColor,
            });
          } else {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
            return;
          }

          EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
        } else {
          EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.MemberNotFound);
        }
      }
    } catch (error) {
      this.handleEndpointError('SetLoadout', error);
    }
  }

  static async UpdatePlayerStatistics(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const playerStatistics = PlayerStatisticsViewProxy.Deserialize(bytes);

      this.debugEndpoint('UpdatePlayerStatistics', authToken, playerStatistics);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const statistics = await PlayerStatistics.findOne({ where: { Cmid: steamMember.Cmid } });

          if (statistics) {
            await statistics.update({
              Hits: playerStatistics.Hits,
              Shots: playerStatistics.Shots,
              Splats: playerStatistics.Splats,
              Splatted: playerStatistics.Splatted,
              Headshots: playerStatistics.Headshots,
              Nutshots: playerStatistics.Nutshots,
              Xp: playerStatistics.Xp,
              TimeSpentInGame: playerStatistics.TimeSpentInGame,
              Level: playerStatistics.Level,

              WeaponStatistics: {
                // Machine Gun
                MachineGunTotalDamageDone: playerStatistics.WeaponStatistics.MachineGunTotalDamageDone,
                MachineGunTotalSplats: playerStatistics.WeaponStatistics.MachineGunTotalSplats,
                MachineGunTotalShotsFired: playerStatistics.WeaponStatistics.MachineGunTotalShotsFired,
                MachineGunTotalShotsHit: playerStatistics.WeaponStatistics.MachineGunTotalShotsHit,

                // Shotgun
                ShotgunTotalDamageDone: playerStatistics.WeaponStatistics.ShotgunTotalDamageDone,
                ShotgunTotalSplats: playerStatistics.WeaponStatistics.ShotgunTotalSplats,
                ShotgunTotalShotsFired: playerStatistics.WeaponStatistics.ShotgunTotalShotsFired,
                ShotgunTotalShotsHit: playerStatistics.WeaponStatistics.ShotgunTotalShotsHit,

                // Splattergun
                SplattergunTotalDamageDone: playerStatistics.WeaponStatistics.SplattergunTotalDamageDone,
                SplattergunTotalSplats: playerStatistics.WeaponStatistics.SplattergunTotalSplats,
                SplattergunTotalShotsFired: playerStatistics.WeaponStatistics.SplattergunTotalShotsFired,
                SplattergunTotalShotsHit: playerStatistics.WeaponStatistics.SplattergunTotalShotsHit,

                // Sniper Rifle
                SniperTotalDamageDone: playerStatistics.WeaponStatistics.SniperTotalDamageDone,
                SniperTotalSplats: playerStatistics.WeaponStatistics.SniperTotalSplats,
                SniperTotalShotsFired: playerStatistics.WeaponStatistics.SniperTotalShotsFired,
                SniperTotalShotsHit: playerStatistics.WeaponStatistics.SniperTotalShotsHit,

                // Melee Weapons
                MeleeTotalDamageDone: playerStatistics.WeaponStatistics.MeleeTotalDamageDone,
                MeleeTotalSplats: playerStatistics.WeaponStatistics.MeleeTotalSplats,
                MeleeTotalShotsFired: playerStatistics.WeaponStatistics.MeleeTotalShotsFired,
                MeleeTotalShotsHit: playerStatistics.WeaponStatistics.MeleeTotalShotsHit,

                // Cannon
                CannonTotalDamageDone: playerStatistics.WeaponStatistics.CannonTotalDamageDone,
                CannonTotalSplats: playerStatistics.WeaponStatistics.CannonTotalSplats,
                CannonTotalShotsFired: playerStatistics.WeaponStatistics.CannonTotalShotsFired,
                CannonTotalShotsHit: playerStatistics.WeaponStatistics.CannonTotalShotsHit,

                // Launcher
                LauncherTotalDamageDone: playerStatistics.WeaponStatistics.LauncherTotalDamageDone,
                LauncherTotalSplats: playerStatistics.WeaponStatistics.LauncherTotalSplats,
                LauncherTotalShotsFired: playerStatistics.WeaponStatistics.LauncherTotalShotsFired,
                LauncherTotalShotsHit: playerStatistics.WeaponStatistics.LauncherTotalShotsHit,
              },
              PersonalRecord: {
                MostArmorPickedUp: playerStatistics.PersonalRecord.MostArmorPickedUp,
                MostCannonSplats: playerStatistics.PersonalRecord.MostCannonSplats,
                MostConsecutiveSnipes: playerStatistics.PersonalRecord.MostConsecutiveSnipes,
                MostDamageDealt: playerStatistics.PersonalRecord.MostDamageDealt,
                MostDamageReceived: playerStatistics.PersonalRecord.MostDamageReceived,
                MostHeadshots: playerStatistics.PersonalRecord.MostHeadshots,
                MostHealthPickedUp: playerStatistics.PersonalRecord.MostHealthPickedUp,
                MostLauncherSplats: playerStatistics.PersonalRecord.MostLauncherSplats,
                MostMachinegunSplats: playerStatistics.PersonalRecord.MostMachinegunSplats,
                MostMeleeSplats: playerStatistics.PersonalRecord.MostMeleeSplats,
                MostNutshots: playerStatistics.PersonalRecord.MostNutshots,
                MostShotgunSplats: playerStatistics.PersonalRecord.MostShotgunSplats,
                MostSniperSplats: playerStatistics.PersonalRecord.MostSniperSplats,
                MostSplats: playerStatistics.PersonalRecord.MostSplats,
                MostSplattergunSplats: playerStatistics.PersonalRecord.MostSplattergunSplats,
                MostXPEarned: playerStatistics.PersonalRecord.MostXPEarned,
              },
            });
          } else {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
            return;
          }

          EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
        } else {
          EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.MemberNotFound);
        }
      }
    } catch (error) {
      this.handleEndpointError('UpdatePlayerStatistics', error);
    }
  }

  static async RemoveItemFromInventory(bytes: byte[], outputStream: byte[]) {
    try {
      const itemId = Int32Proxy.Deserialize(bytes);
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('RemoveItemFromInventory', itemId, authToken);

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

        const transaction = await ItemTransaction.findOne({ where: { Cmid: publicProfile.Cmid, ItemId: itemId } });
        const item = await PlayerInventoryItem.findOne({ where: { Cmid: publicProfile.Cmid, ItemId: itemId } });

        if (!transaction && !item) {
          Int32Proxy.Serialize(outputStream, BuyItemResult.InvalidData);
          return;
          // eslint-disable-next-line no-else-return
        } else if (item) {
          // Allow removing items added by the "inventory" command
          await PlayerInventoryItem.destroy({
            where: {
              Cmid: publicProfile.Cmid,
              ItemId: itemId,
            },
          });

          Int32Proxy.Serialize(outputStream, BuyItemResult.OK);
          return;
        }

        const memberWallet = await MemberWallet.findOne({ where: { Cmid: publicProfile.Cmid } });
        if (memberWallet) {
          await memberWallet.update({
            Credits: memberWallet.Credits! + Math.round(transaction!.Credits! * 0.75),
            Points: memberWallet.Points! + Math.round(transaction!.Points! * 0.75),
          });
        }

        await transaction!.destroy();
        await item!.destroy();

        Int32Proxy.Serialize(outputStream, BuyItemResult.OK);
      }
    } catch (error) {
      this.handleEndpointError('RemoveItemFromInventory', error);
    }
  }

  private static filterLoadout<T extends LoadoutView | PlayerLoadout>(loadoutView: T, playerInventory: PlayerInventoryItem[]): T {
    if (loadoutView.UpperBody !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.UpperBody)) loadoutView.UpperBody = 0;
    if (loadoutView.Weapon1 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Weapon1)) loadoutView.Weapon1 = 0;
    if (loadoutView.Weapon2 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Weapon2)) loadoutView.Weapon2 = 0;
    if (loadoutView.Weapon3 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Weapon3)) loadoutView.Weapon3 = 0;
    if (loadoutView.QuickItem3 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.QuickItem3)) loadoutView.QuickItem3 = 0;
    if (loadoutView.QuickItem2 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.QuickItem2)) loadoutView.QuickItem2 = 0;
    if (loadoutView.QuickItem1 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.QuickItem1)) loadoutView.QuickItem1 = 0;
    if (loadoutView.MeleeWeapon !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.MeleeWeapon)) loadoutView.MeleeWeapon = 0;
    if (loadoutView.LowerBody !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.LowerBody)) loadoutView.LowerBody = 0;
    if (loadoutView.Head !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Head)) loadoutView.Head = 0;
    if (loadoutView.Gloves !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Gloves)) loadoutView.Gloves = 0;
    if (loadoutView.FunctionalItem3 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.FunctionalItem3)) loadoutView.FunctionalItem3 = 0;
    if (loadoutView.FunctionalItem2 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.FunctionalItem2)) loadoutView.FunctionalItem2 = 0;
    if (loadoutView.FunctionalItem1 !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.FunctionalItem1)) loadoutView.FunctionalItem1 = 0;
    if (loadoutView.Face !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Face)) loadoutView.Face = 0;
    if (loadoutView.Boots !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Boots)) loadoutView.Boots = 0;
    if (loadoutView.Backpack !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Backpack)) loadoutView.Backpack = 0;
    if (loadoutView.Webbing !== 0 && !playerInventory.find((_) => _.ItemId === loadoutView.Webbing)) loadoutView.Webbing = 0;

    return loadoutView;
  }
}
