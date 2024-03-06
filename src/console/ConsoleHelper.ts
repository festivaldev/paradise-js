import packageJson from '../../package.json';

export default class ConsoleHelper {
  public static PrintConsoleHeader(): void {
    console.log(`Paradise Web Services [Version ${packageJson.version}]`);
    console.log('(c) 2017, 2022-2024 Team FESTIVAL. All rights reserved.\n');
  }

  public static PrintConsoleHeaderSubtitle(): void {
    console.log('\r\nType "help" (or "h") to see available commands.');
  }
}
