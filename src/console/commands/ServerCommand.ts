import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import ParadiseCommand from '../ParadiseCommand';

export default class ServerCommand extends ParadiseCommand {
  public static override Command: string = 'server';
  public static override Aliases: string[] = [];

  public override Description: string = 'Manage server credentials.';
  public override HelpString: string = `${ServerCommand.Command}\t\t${this.Description}`;

  public override UsageText: string[] = [
    `${ServerCommand.Command}: ${this.Description}`,
    '  generate\t\tGenerates credentials for a new server.',
  ];

  public override async Run(args: string[]): Promise<any> {
    if (args.length < 1) {
      this.PrintUsageText();
      return;
    }

    switch (args[0].toLocaleLowerCase()) {
      case 'gen':
      case 'generate': {
        const serverId = uuid();
        const passphrase = crypto.createHash('SHA512').update(`${serverId}_${new Date().getTime()}`).digest('base64');

        this.WriteLine(`Server ID: ${serverId}`);
        this.WriteLine(`Passphrase: ${passphrase}`);

        break;
      }
      default:
        this.WriteLine(`${ServerCommand.Command}: unknown command ${args[0]}\n`);
        break;
    }
  }
}
