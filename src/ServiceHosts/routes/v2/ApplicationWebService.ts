import { ChannelType, PhotonUsageType } from '@/Cmune/DataCenter/Common/Entities';
import { ApplicationConfigurationView } from '@/UberStrike/Core/Models/Views';
import {
  ApplicationConfigurationViewProxy, AuthenticateApplicationViewProxy, EnumProxy, ListProxy, MapViewProxy, MatchStatsProxy, StringProxy,
} from '@/UberStrike/Core/Serialization';
import { AuthenticateApplicationView } from '@/UberStrike/DataCenter/Common/Entities';
import {
  ApplicationConfiguration, Map, MapSettings, PhotonServer,
} from '@/models';
import { ApiVersion } from '@/utils';
import BaseWebService from './BaseWebService';

export default class ApplicationWebService extends BaseWebService {
  public static get ServiceName(): string { return 'ApplicationWebService'; }
  public static get ServiceVersion(): string { return ApiVersion.Current; }
  protected static get ServiceInterface(): string { return 'IApplicationWebServiceContract'; }

  static supportedClientVersions: List<string> = ['4.7.1'];
  static supportedClientChannels: List<ChannelType> = [ChannelType.Steam];

  static async AuthenticateApplication(bytes: byte[], outputStream: byte[]) {
    try {
      const clientVersion = StringProxy.Deserialize(bytes);
      const channelType = EnumProxy.Deserialize<ChannelType>(bytes);
      const publicKey = StringProxy.Deserialize(bytes);

      this.debugEndpoint('AuthenticateApplication', clientVersion, channelType, publicKey);

      if (!ApplicationWebService.supportedClientChannels.includes(channelType)) {
        AuthenticateApplicationViewProxy.Serialize(outputStream, new AuthenticateApplicationView({
          IsEnabled: false,
        }));
      } else {
        AuthenticateApplicationViewProxy.Serialize(outputStream, new AuthenticateApplicationView({
          IsEnabled: true,
          GameServers: (await PhotonServer.findAll({ where: { UsageType: PhotonUsageType.All }, raw: true })),
          CommServer: (await PhotonServer.findAll({ where: { UsageType: PhotonUsageType.CommServer }, order: [['MinLatency', 'ASC']], raw: true }))[0] ?? null,
          WarnPlayer: !ApplicationWebService.supportedClientVersions.includes(clientVersion),
          // EncryptionInitVector: this.EncryptionInitVector,
          // EncryptionPassPhrase: this.EncryptionPassPhrase
        }));
      }
    } catch (e) {
      this.handleEndpointError('AuthenticateApplication', e);
    }
  }

  static async GetConfigurationData(bytes: byte[], outputStream: byte[]) {
    try {
      const clientVersion = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetConfigurationData', clientVersion);

      if (ApplicationWebService.supportedClientVersions.includes(clientVersion)) {
        const applicationConfiguration = await ApplicationConfiguration.findOne();

        ApplicationConfigurationViewProxy.Serialize(outputStream, new ApplicationConfigurationView({ ...applicationConfiguration!.get({ plain: true }) }));
      }
    } catch (e) {
      this.handleEndpointError('AutGetConfigurationDatahenticateApplication', e);
    }
  }

  static async GetMaps(bytes: byte[], outputStream: byte[]) {
    try {
      const clientVersion = StringProxy.Deserialize(bytes);
      const clientType = EnumProxy.Deserialize(bytes);

      this.debugEndpoint('GetMaps', clientVersion, clientType);

      if (ApplicationWebService.supportedClientVersions.includes(clientVersion)) {
        const maps = await Map.findAll({
          where: { IsParadiseMap: false },
          raw: true,
        });
        const mapSettings = await MapSettings.findAll({
          raw: true,
        });

        const mapData = maps.reduce((acc: any[], cur: any) => {
          acc.push({
            ...cur,
            Settings: mapSettings.filter((_) => _.MapId === cur.MapId).reduce((acc, cur) => {
              acc[cur.GameModeType!] = {
                ...cur,
                MapId: undefined,
                GameModeType: undefined,
              };

              return acc;
            }, {}),
          });

          return acc;
        }, []);

        ListProxy.Serialize(outputStream, mapData, MapViewProxy.Serialize);
      }
    } catch (e) {
      this.handleEndpointError('GetMaps', e);
    }
  }

  static async GetCustomMaps(bytes: byte[], outputStream: byte[]) {
    try {
      const clientVersion = StringProxy.Deserialize(bytes);
      const clientType = EnumProxy.Deserialize(bytes);

      this.debugEndpoint('GetMaps', clientVersion, clientType);

      if (ApplicationWebService.supportedClientVersions.includes(clientVersion)) {
        const maps = await Map.findAll({
          where: { IsParadiseMap: true },
          raw: true,
        });
        const mapSettings = await MapSettings.findAll({
          raw: true,
        });

        const mapData = maps.reduce((acc: any[], cur: any) => {
          acc.push({
            ...cur,
            Settings: mapSettings.filter((_) => _.MapId === cur.MapId).reduce((acc, cur) => {
              acc[cur.GameModeType!] = {
                ...cur,
                MapId: undefined,
                GameModeType: undefined,
              };

              return acc;
            }, {}),
          });

          return acc;
        }, []);

        ListProxy.Serialize(outputStream, mapData, MapViewProxy.Serialize);
      }
    } catch (e) {
      this.handleEndpointError('GetCustomMaps', e);
    }
  }

  static async SetMatchScore(bytes: byte[], outputStream: byte[]) {
    try {
      const clientVersion = StringProxy.Deserialize(bytes);
      const scoringView = MatchStatsProxy.Deserialize(bytes);
      const serverAuthentication = StringProxy.Deserialize(bytes);

      this.debugEndpoint('SetMatchScore', clientVersion, scoringView, serverAuthentication);

      throw new Error('Not Implemented');
    } catch (e) {
      this.handleEndpointError('SetMatchScore', e);
    }
  }
}
