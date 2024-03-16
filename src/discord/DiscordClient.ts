import ParadiseService from '@/ParadiseService';
import { RealtimeError, WebSocketChatMessage } from '@/ServiceHosts/WebSocket';
import { DiscordUser, SteamMember } from '@/models';
import { Log } from '@/utils';
import crypto from 'crypto';
import {
  ActivityType,
  Client, Colors, EmbedBuilder, Events, GatewayIntentBits, Message, Partials, WebhookClient,
} from 'discord.js';
import { Op } from 'sequelize';
import { MemberAccessLevel } from 'uberstrike-js/dist/Cmune/DataCenter/Common/Entities';
import { CommActorInfo, EndOfMatchData, GameRoomData } from 'uberstrike-js/dist/UberStrike/Core/Models';
import { GameModeType } from 'uberstrike-js/dist/UberStrike/Core/Types';
import { DiscordSettings } from './DiscordSettings';

enum GAME_FLAGS {
  None = 0x0,
  LowGravity = 0x1,
  NoArmor = 0x2,
  QuickSwitch = 0x4,
  MeleeOnly = 0x8
}

export default class DiscordClient {
  private discordSettings: DiscordSettings;
  private discordClient: Client;

  private lobbyChatClient?: WebhookClient;
  private playerAnnouncementClient?: WebhookClient;
  private gameRoomAnnouncementClient?: WebhookClient;
  private gameRoundAnnouncementClient?: WebhookClient;
  private errorLogClient?: WebhookClient;

  public async Connect(): Promise<void> {
    if (this.discordClient || !ParadiseService.Instance.ServiceSettings.DiscordSettings.Enabled) return;
    this.discordSettings = ParadiseService.Instance.ServiceSettings.DiscordSettings;

    this.discordClient = new Client({
      intents: [
        // #region AllUnprivileged
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        // #endregion
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
      ],
    });

    this.discordClient.once(Events.ClientReady, this.OnReady.bind(this));
    this.discordClient.on(Events.MessageCreate, this.OnMessageCreate.bind(this));

    this.discordClient.login(this.discordSettings.BotToken);

    if (this.discordSettings.Integrations.LobbyChat && this.discordSettings.WebHooks.LobbyChat?.trim().length) {
      this.lobbyChatClient = new WebhookClient({ url: this.discordSettings.WebHooks.LobbyChat });
    }

    if ((this.discordSettings.Integrations.PlayerJoinAnnouncements || this.discordSettings.Integrations.PlayerLeaveAnnouncements)
      && this.discordSettings.WebHooks.PlayerAnnouncements?.trim().length) {
      this.playerAnnouncementClient = new WebhookClient({ url: this.discordSettings.WebHooks.PlayerAnnouncements });
    }

    if ((this.discordSettings.Integrations.RoomOpenAnnouncements || this.discordSettings.Integrations.RoomCloseAnnouncements)
      && this.discordSettings.WebHooks.RoomAnnouncements?.trim().length) {
      this.gameRoomAnnouncementClient = new WebhookClient({ url: this.discordSettings.WebHooks.RoomAnnouncements });
    }

    if ((this.discordSettings.Integrations.RoundStartAnnouncements || this.discordSettings.Integrations.RoundEndAnnouncements)
      && this.discordSettings.WebHooks.RoundAnnouncements?.trim().length) {
      this.gameRoundAnnouncementClient = new WebhookClient({ url: this.discordSettings.WebHooks.RoundAnnouncements });
    }

    if (this.discordSettings.Integrations.ErrorLog && this.discordSettings.WebHooks.ErrorLog?.trim().length) {
      this.errorLogClient = new WebhookClient({ url: this.discordSettings.WebHooks.ErrorLog });
    }
  }

  public async Disconnect(): Promise<void> {
    await this.discordClient.user?.setStatus('invisible');
  }

  public async SendLobbyChatMessage(message: WebSocketChatMessage): Promise<void> {
    if (!this.discordSettings.Integrations.LobbyChat) return;
    if (!this.discordSettings.ChatChannelId) return;

    const discordUser = await this.GetDiscordUserFromCmid(message.Cmid);
    let username: string | null = null;
    let avatarUrl: string | null = null;

    if (discordUser) {
      const guild = await this.discordClient.guilds.fetch(this.discordSettings.GuildId);
      const user = guild.members.cache.get(discordUser.DiscordUserId!);

      if (user) {
        username = user.nickname;
        avatarUrl = user.avatarURL();
      }
    }

    const embed = new EmbedBuilder({
      description: message.Message.replace(/(_|\*|~|`|\||\\)/g, '\\$1'),
      footer: {
        text: 'UberStrike Lobby Chat',
        icon_url: this.discordClient.user?.avatarURL()!,
      },
    });

    await this.lobbyChatClient?.send({
      username: username ?? message.Name,
      avatarURL: avatarUrl ?? undefined,
      embeds: [embed],
    });
  }

  public async SendPlayerJoinMessage(player: CommActorInfo): Promise<void> {
    if (!this.discordSettings.Integrations.PlayerJoinAnnouncements) return;
    if (this.discordSettings.AnnouncementBlacklist.includes(player.Cmid.toString())) return;

    const discordUser = await this.GetDiscordUserFromCmid(player.Cmid);
    const steamMember = await SteamMember.findOne({
      where: {
        Cmid: player.Cmid,
      },
    });

    const embed = new EmbedBuilder({
      title: 'Player connected',
      description: `${player.PlayerName} has joined the server.`,
      color: Colors.Green,
    });

    embed.addFields(
      { name: 'CMID', value: player.Cmid.toString() },
      { name: 'SteamID64', value: steamMember!.SteamId.toString(), inline: true },
      { name: 'Machine ID', value: steamMember!.MachineId },
      { name: 'Rank', value: MemberAccessLevel[player.AccessLevel] },
    );

    await this.playerAnnouncementClient?.send({
      username: 'UberStrike',
      embeds: [embed],
    });
  }

  public async SendPlayerLeftMessage(player: CommActorInfo): Promise<void> {
    if (!this.discordSettings.Integrations.PlayerLeaveAnnouncements) return;
    if (this.discordSettings.AnnouncementBlacklist.includes(player.Cmid.toString())) return;

    const embed = new EmbedBuilder({
      title: 'Player disconnected',
      description: `${player.PlayerName} has left the server.`,
      color: Colors.Red,
    });

    await this.playerAnnouncementClient?.send({
      username: 'UberStrike',
      embeds: [embed],
    });
  }

  public async SendGameRoomCreatedMessage(metadata: GameRoomData): Promise<void> {
    if (!this.discordSettings.Integrations.RoomOpenAnnouncements) return;

    const embed = new EmbedBuilder({
      title: 'Game Room created',
      color: Colors.Default,
      image: { url: `https://static.paradise.festival.tf/images/maps/${this.GetImageNameForMapID(metadata.MapID)}.jpg` },
      footer: {
        text: `Room ID: ${metadata.Number}`,
      },
    });

    try {
      embed.addFields(
        { name: 'Room Name', value: metadata.Name },
        { name: 'Map', value: this.GetNameForMapID(metadata.MapID), inline: true },
        { name: 'Gamemode', value: this.GetGamemodeName(metadata.GameMode), inline: true },
        { name: 'Player Limit', value: metadata.PlayerLimit.toString(), inline: true },
        { name: 'Time Limit', value: `${metadata.TimeLimit / 60} min`, inline: true },
        { name: 'Kill/Round Limit', value: metadata.KillLimit.toString(), inline: true },
        { name: 'Game Modifiers', value: this.GetGameFlags(metadata.GameFlags) },
        { name: 'Requires Password', value: metadata.IsPasswordProtected ? 'Yes' : 'No', inline: true },
        { name: 'Minimum Level', value: metadata.LevelMin > 0 ? metadata.LevelMin.toString() : 'None', inline: true },
        { name: 'Maximum Level', value: metadata.LevelMax > 0 ? metadata.LevelMax.toString() : 'None', inline: true },
        { name: 'Join this game', value: `uberstrike://connect/${metadata.Server.ConnectionString}/${metadata.Number}` },
      );

      await this.gameRoomAnnouncementClient?.send({
        username: 'UberStrike',
        embeds: [embed],
      });
    } catch (e: any) {
      Log.error(e);
      Log.info(JSON.stringify(embed.data.fields?.map((_) => ({
        Name: _.name,
        Value: _.value,
      })), null, 4));
    }
  }

  public async SendGameRoomDestroyedMessage(metadata: GameRoomData): Promise<void> {
    if (!this.discordSettings.Integrations.RoomCloseAnnouncements) return;

    const embed = new EmbedBuilder({
      title: 'Game Room closed',
      color: Colors.Default,
      footer: {
        text: `Room ID: ${metadata.Number}`,
      },
    });

    try {
      embed.addFields(
        { name: 'Room Name', value: metadata.Name },
        { name: 'Map', value: this.GetNameForMapID(metadata.MapID), inline: true },
        { name: 'Gamemode', value: this.GetGamemodeName(metadata.GameMode), inline: true },
      );

      await this.gameRoomAnnouncementClient?.send({
        username: 'UberStrike',
        embeds: [embed],
      });
    } catch (e: any) {
      Log.error(e);
      Log.info(JSON.stringify(embed.data.fields?.map((_) => ({
        Name: _.name,
        Value: _.value,
      })), null, 4));
    }
  }

  public async SendRoundStartedMessage(metadata: GameRoomData): Promise<void> {
    Log.debug('Round start messages not implemented');
  }

  public async SendRoundEndedMessage(metadata: GameRoomData, matchData: EndOfMatchData): Promise<void> {
    Log.debug('Round end messages not implemented');
  }

  public async LogError(error: Error | RealtimeError): Promise<void> {
    if (!this.discordSettings.Integrations.ErrorLog) return;

    if (error instanceof Error) {
      await this.errorLogClient?.send({
        username: 'UberStrike',
        content: `\`\`\`${error.message}\r\n${error.stack}\`\`\``,
      });
    } else if (error instanceof RealtimeError) {
      await this.errorLogClient?.send({
        username: 'UberStrike',
        content: `\`\`\`${error.ExceptionType}: ${error.Message}\r\n${error.StackTrace}\`\`\``,
      });
    }
  }

  public async IsMemberLinked(cmid: number): Promise<bool> {
    return (await DiscordUser.findOne({
      where: {
        Cmid: cmid,
        DiscordUserId: {
          [Op.ne]: null,
        },
      },
    })) != null;
  }

  public async BeginLinkMember(cmid: number): Promise<string | null> {
    if (await this.IsMemberLinked(cmid)) return null;

    let link = await DiscordUser.findOne({
      where: {
        Cmid: cmid,
        DiscordUserId: {
          [Op.ne]: null,
        },
        Nonce: {
          [Op.ne]: null,
        },
      },
    });
    if (link) return link.Nonce;

    const nonce = crypto.randomBytes(16).toString('hex');
    link = await DiscordUser.create({
      Cmid: cmid,
      Nonce: nonce,
    });

    return nonce;
  }

  public async GetDiscordUserFromCmid(cmid: number): Promise<DiscordUser | null> {
    return DiscordUser.findOne({
      where: {
        Cmid: cmid,
        DiscordUserId: {
          [Op.ne]: null,
        },
        Nonce: {
          [Op.ne]: null,
        },
      },
    });
  }

  public async GetDiscordUserFromDiscordId(discordUserId: string): Promise<DiscordUser | null> {
    return DiscordUser.findOne({
      where: {
        Cmid: {
          [Op.gt]: 0,
        },
        DiscordUserId: discordUserId,
        Nonce: {
          [Op.ne]: null,
        },
      },
    });
  }

  // #region Callbacks
  private async OnReady(readyClient: Client<boolean>): Promise<void> {
    await readyClient.user!.setPresence({
      activities: [{
        name: 'Paradise Web Services TEST',
        type: ActivityType.Playing,
      }],
      status: 'online',
    });
  }

  private async OnMessageCreate(message: Message): Promise<void> {
    if (message.author.bot || message.webhookId) return;

    if (message.channel.isDMBased()) {
      Log.debug("got dm");
      message.channel.send(`echo: ${message.content}`);
    } else if (message.channelId === this.discordSettings.ChatChannelId) {
      Log.debug("message from chat channel");
    } else if (message.channel.isTextBased()) {
      Log.debug("got regular message");
    }
  }
  // #endregion

  private GetNameForMapID(mapID: number): string {
    switch (mapID) {
      case 3: return 'Apex Twin';
      case 4: return 'Aqualab Research Hub';
      case 5: return 'Catalyst';
      case 6: return 'CuberSpace';
      case 7: return 'CuberStrike';
      case 8: return 'Fort Winter';
      case 9: return 'Ghost Island';
      case 10: return 'Gideon\'s Tower';
      case 11: return 'Monkey Island 2';
      case 12: return 'Lost Paradise 2';
      case 13: return 'Sky Garden';
      case 14: return 'SuperPRISM Reactor';
      case 15: return 'Temple of the Raven';
      case 16: return 'The Hangar';
      case 17: return 'The Warehouse';
      case 18: return 'Danger Zone';
      case 64: return 'Space City';
      case 65: return 'Spaceport Alpha';
      case 66: return 'UberZone';
      default: return 'Unknown Map';
    }
  }

  private GetImageNameForMapID(mapID: number): string {
    switch (mapID) {
      case 3: return 'ApexTwin';
      case 4: return 'AqualabResearchHub';
      case 5: return 'Catalyst';
      case 6: return 'Cuberspace';
      case 7: return 'CuberStrike';
      case 8: return 'FortWinter';
      case 9: return 'GhostIsland';
      case 10: return 'GideonsTower';
      case 11: return 'MonkeyIsland';
      case 12: return 'LostParadise2';
      case 13: return 'SkyGarden';
      case 14: return 'SuperPRISMReactor';
      case 15: return 'TempleOfTheRaven';
      case 16: return 'TheHangar';
      case 17: return 'TheWarehouse';
      case 18: return 'Volley';
      case 64: return 'SpaceCity';
      case 65: return 'SpacePortAlpha';
      case 66: return 'UberZone';
      default: return 'Default';
    }
  }

  private GetGamemodeName(gameMode: GameModeType): string {
    switch (gameMode) {
      case GameModeType.DeathMatch: return 'Deathmatch';
      case GameModeType.TeamDeathMatch: return 'Team Deathmatch';
      case GameModeType.EliminationMode: return 'Team Elimination';
      default: return 'Unknown Game Mode';
    }
  }

  private GetGameFlags(gameFlags: number): string {
    return (Object.values(GAME_FLAGS).filter(Number) as number[]).map((flag) => {
      switch (flag) {
        case GAME_FLAGS.None: return 'None';
        case GAME_FLAGS.LowGravity: return 'Low Gravity';
        case GAME_FLAGS.NoArmor: return 'No Armor';
        case GAME_FLAGS.QuickSwitch: return 'Quick Switch';
        case GAME_FLAGS.MeleeOnly: return 'Meelee Only';
        default: return null;
      }
    }).filter(Boolean).join(', ');
  }
}
