import { MemberAccessLevel } from '@/Cmune/DataCenter/Common/Entities';
import ParadiseCommand from '../ParadiseCommand';

export default class PlayersCommand extends ParadiseCommand {
  public static override Command: string = 'players';
  public static override Aliases: string[] = ['player', 'p'];

  public override Description: string = 'List and manage players.';
  public override HelpString: string = `${PlayersCommand.Command}\t\t${this.Description}`;

  public override UsageText: string[] = [
    `${PlayersCommand.Command}: ${this.Description}`,
    '  delete\tDeletes a player.',
    '  list\t\tLists all players that are currently online.',
    '  list-all\tLists all known players.',
    '  search <pattern>\t\tSearches a player by name, CMID, Steam ID or E-Mail address',
  ];

  public override MinimumAccessLevel: MemberAccessLevel = MemberAccessLevel.Moderator;

  public override async Run(args: string[]): Promise<any> {
    console.log('run');
  }
}
