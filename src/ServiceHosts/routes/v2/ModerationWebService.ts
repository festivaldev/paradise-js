import { ChannelType, MemberAccessLevel, MemberOperationResult } from '@/Cmune/DataCenter/Common/Entities';
import { CommActorInfo } from '@/UberStrike/Core/Models';
import {
  CommActorInfoProxy, DateTimeProxy, EnumProxy, Int32Proxy, ListProxy, StringProxy,
} from '@/UberStrike/Core/Serialization';
import {
  Clan, ClanMember, ModerationAction, PublicProfile,
} from '@/models';
import { ApiVersion, ModerationFlag } from '@/utils/';
import { Op } from 'sequelize';
import BaseWebService from './BaseWebService';

export default class ModerationWebService extends BaseWebService {
  public static get ServiceName(): string { return 'ModerationWebService'; }

  public static get ServiceVersion(): string { return ApiVersion.Current; }

  protected static get ServiceInterface(): string { return 'IModerationWebServiceContract'; }

  public static async BanPermanently(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const targetCmid = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('BanPermanently', authToken, targetCmid);

      throw new Error('Not Implemented');
    } catch (error) {
      this.handleEndpointError('BanPermanently', error);
    }
  }

  public static async SetModerationFlag(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const targetCmid = Int32Proxy.Deserialize(bytes);
      const moderationFlag = EnumProxy.Deserialize<ModerationFlag>(bytes);
      const expireTime = DateTimeProxy.Deserialize(bytes);
      const reason = StringProxy.Deserialize(bytes);

      this.debugEndpoint('SetModerationFlag', authToken, targetCmid, moderationFlag, expireTime, reason);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

          if (!publicProfile || publicProfile.AccessLevel < MemberAccessLevel.Moderator) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
          } else {
            const targetProfile = await PublicProfile.findOne({ where: { Cmid: targetCmid } });

            if (!targetProfile || targetProfile.Cmid === publicProfile.Cmid) {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
            } else if (targetProfile.AccessLevel < publicProfile.AccessLevel) {
              const moderationAction = await ModerationAction.findOne({ where: { TargetCmid: targetCmid, ModerationFlag: moderationFlag } });

              if (moderationAction) {
                await moderationAction.update({
                  ActionDate: new Date(),
                  ExpireTime: expireTime,
                  SourceCmid: publicProfile.Cmid,
                  SourceName: publicProfile.Name,
                  TargetName: targetProfile.Name,
                });
              } else {
                await ModerationAction.create({
                  ActionDate: new Date(),
                  ExpireTime: expireTime,
                  ModerationFlag: moderationFlag,
                  Reason: reason,
                  SourceCmid: publicProfile.Cmid,
                  SourceName: publicProfile.Name,
                  TargetCmid: targetProfile.Cmid,
                  TargetName: targetProfile.Name,
                });
              }

              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
            } else {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('SetModerationFlag', error);
    }
  }

  public static async UnsetModerationFlag(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const targetCmid = Int32Proxy.Deserialize(bytes);
      const moderationFlag = EnumProxy.Deserialize<ModerationFlag>(bytes);

      this.debugEndpoint('UnsetModerationFlag', authToken, targetCmid, moderationFlag);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

          if (!publicProfile || publicProfile.AccessLevel < MemberAccessLevel.Moderator) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
          } else {
            const targetProfile = await PublicProfile.findOne({ where: { Cmid: targetCmid } });

            if (!targetProfile || targetProfile.Cmid === publicProfile.Cmid) {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
            } else if (targetProfile.AccessLevel < publicProfile.AccessLevel) {
              const moderationAction = await ModerationAction.findOne({ where: { TargetCmid: targetCmid, ModerationFlag: moderationFlag } });

              if (moderationAction) {
                await moderationAction.update({
                  ExpireTime: new Date(0),
                });

                EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
              } else {
                EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
              }
            } else {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('UnsetModerationFlag', error);
    }
  }

  public static async ClearModerationFlags(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const targetCmid = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('ClearModerationFlags', authToken, targetCmid);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

          if (!publicProfile || publicProfile.AccessLevel < MemberAccessLevel.Moderator) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
          } else {
            const targetProfile = await PublicProfile.findOne({ where: { Cmid: targetCmid } });

            if (!targetProfile || targetProfile.Cmid === publicProfile.Cmid) {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
            } else if (targetProfile.AccessLevel < publicProfile.AccessLevel) {
              const moderationActions = await ModerationAction.findAll({ where: { TargetCmid: targetCmid } });

              if (moderationActions?.length) {
                for (const action of moderationActions) {
                  await action.update({
                    ExpireTime: new Date(0),
                  });
                }

                EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
              } else {
                EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
              }
            } else {
              EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidData);
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('ClearModerationFlags', error);
    }
  }

  public static async GetNaughtyList(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetNaughtyList', authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const publicProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });

          if (publicProfile && publicProfile.AccessLevel >= MemberAccessLevel.Moderator) {
            const naughtyUsers: List<CommActorInfo> = [];
            const moderationActions = await ModerationAction.findAll({
              where: {
                [Op.or]: [{ ExpireTime: null }, { ExpireTime: { [Op.gte]: new Date() } }],
              },
            });

            for (const action of moderationActions) {
              const user = naughtyUsers.find((_) => _.Cmid === action.TargetCmid);

              if (user) {
                user.ModerationFlag |= action.ModerationFlag!;
              } else {
                const profile = await PublicProfile.findOne({ where: { Cmid: action.TargetCmid } });
                let clan;
                const clanMember = await ClanMember.findOne({ where: { Cmid: action.TargetCmid } });

                if (clanMember) {
                  clan = await Clan.findOne({ where: { GroupId: clanMember.GroupId } });
                }

                naughtyUsers.push(new CommActorInfo({
                  AccessLevel: profile!.AccessLevel,
                  Channel: ChannelType.Steam,
                  ClanTag: clan?.Tag,
                  Cmid: action.TargetCmid,
                  ModerationFlag: action.ModerationFlag,
                  ModInformation: action.Reason,
                  PlayerName: profile!.Name,
                }));
              }
            }

            ListProxy.Serialize<CommActorInfo>(outputStream, naughtyUsers, CommActorInfoProxy.Serialize);
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('GetNaughtyList', error);
    }
  }
}
