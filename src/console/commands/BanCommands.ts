import { MemberAccessLevel } from '@festivaldev/uberstrike-js/Cmune/DataCenter/Common/Entities';
import { ModerationAction, PublicProfile } from '@/models';
import { ModerationFlag } from '@/utils';
import moment from 'moment';
import { Op } from 'sequelize';
import ParadiseCommand from '../ParadiseCommand';

export class BanCommand extends ParadiseCommand {
  public static override Command: string = 'ban';
  public static override Aliases: string[] = [];

  public override Description: string = 'Bans a player for a specified duration.';
  public override HelpString: string = `${BanCommand.Command}\t\t${this.Description}`;

  public override UsageText: string[] = [
    `${BanCommand.Command}: ${this.Description}`,
    `Usage: ${BanCommand.Command} <name> <duration> <reason>`,
  ];

  public override MinimumAccessLevel: MemberAccessLevel = MemberAccessLevel.Moderator;

  public override async Run(args: string[]): Promise<any> {
    if (args.length < 2) {
      this.PrintUsageText();
      return;
    }

    const searchString = args[0];

    if (searchString.length < 3) {
      this.WriteLine('Search pattern must contain at least 3 characters.');
      return;
    }

    const publicProfile = await PublicProfile.getProfile(searchString);

    if (!publicProfile) {
      this.WriteLine(`Failed to ban player: Could not find player matching ${searchString}.`);
      return;
    }

    const duration = Number(args[1]);
    if (Number.isNaN(duration)) {
      this.WriteLine('Invalid parameter: duration');
      return;
    }

    if (await ModerationAction.findOne({
      where: {
        ModerationFlag: ModerationFlag.Banned,
        ExpireTime: {
          [Op.gt]: new Date(),
        },
        TargetCmid: publicProfile.Cmid,
      },
    })) {
      this.WriteLine('Failed to ban player: Player is already banned.');
      return;
    }

    const reason = args.slice(2).join(' ');

    await ModerationAction.create({
      ModerationFlag: ModerationFlag.Banned,
      SourceCmid: 0,
      SourceName: 'root',
      TargetCmid: publicProfile.Cmid,
      TargetName: publicProfile.Name,
      ActionDate: new Date(),
      ExpireTime: duration === 0 ? new Date('9999-12-31T23:59:59.999Z') : moment(new Date()).add(duration, 'minutes').toDate(),
      Reason: reason,
    });

    /// TODO: Send ban event to Realtime servers

    if (duration === 0) {
      this.WriteLine(`Player has been banned permanently. (reason: ${reason})`);
    } else {
      this.WriteLine(`Player has been banned for ${duration} minute(s). (reason: ${reason})`);
    }
  }
}

export class UnbanCommand extends ParadiseCommand {
  public static override Command: string = 'unban';
  public static override Aliases: string[] = [];

  public override Description: string = 'Unbans a player.';
  public override HelpString: string = `${UnbanCommand.Command}\t\t${this.Description}`;

  public override UsageText: string[] = [
    `${UnbanCommand.Command}: ${this.Description}`,
    `Usage: ${UnbanCommand.Command} <name>`,
  ];

  public override MinimumAccessLevel: MemberAccessLevel = MemberAccessLevel.Moderator;

  public override async Run(args: string[]): Promise<any> {
    if (args.length < 1) {
      this.PrintUsageText();
      return;
    }

    const searchString = args[0];

    if (searchString.length < 3) {
      this.WriteLine('Search pattern must contain at least 3 characters.');
      return;
    }

    const publicProfile = await PublicProfile.getProfile(searchString);

    if (!publicProfile) {
      this.WriteLine(`Failed to ban player: Could not find player matching ${searchString}.`);
      return;
    }

    if (!(await ModerationAction.findOne({
      where: {
        ModerationFlag: ModerationFlag.Banned,
        ExpireTime: {
          [Op.gt]: new Date(),
        },
        TargetCmid: publicProfile.Cmid,
      },
    }))) {
      this.WriteLine('Failed to ban player: Player is not currently banned.');
      return;
    }

    await ModerationAction.update({
      ExpireTime: new Date(0),
    }, {
      where: {
        ModerationFlag: ModerationFlag.Banned,
        TargetCmid: publicProfile.Cmid,
        ExpireTime: {
          [Op.gt]: new Date(),
        },
      },
    });

    this.WriteLine('User has been unbanned successfully.');
  }
}
