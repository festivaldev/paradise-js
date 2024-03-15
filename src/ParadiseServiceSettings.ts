import { DiscordSettings } from '@/discord/DiscordSettings';
import { Log } from '@/utils';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export class ServerPassPhrase {
  public Id: string;
  public PassPhrase: string;
}

export class DatabaseSettings {
  public Server: string;
  public Type: string = 'mysql';
  public Port: number = 3306;
  public Username: string;
  public Password: string;
  public DatabaseName: string = 'paradise';
}

export class ParadiseServiceSettings {
  public Hostname: string = '127.0.0.1';

  public WebServicePort: number = 8080;
  public FileServerPort: number = 8081;
  public SocketPort: number = 8082;

  public DatabaseSettings: DatabaseSettings;

  public WebServicePrefix: string = 'UberStrike.DataCenter.WebService.CWS.';
  public WebServiceSuffix: string = 'Contract.svc';
  public EncryptionInitVector: string = 'aaaaBBBBccccDDDD'; // Must be 16 characters
  public EncryptionPassPhrase: string = 'mysupersecretpassphrase';
  public ServerPassPhrases: ServerPassPhrase[] = [];

  public FileServerRoot: string = 'wwwroot';

  /**
   * @deprecated Use a reverse proxy to provide SSL encryption
   */
  public EnableSSL: bool = false;

  /**
   * @deprecated Use a reverse proxy to provide SSL encryption
   */
  public SSLCertificateName: string;

  public DiscordSettings: DiscordSettings;

  constructor(path: string) {
    try {
      const settings = YAML.parse(fs.readFileSync(path, 'utf-8'));

      for (const key of Object.keys(settings)) {
        if (key in this) {
          this[key] = settings[key];
        }
      }
    } catch (error: any) {
      Log.error('There was an error parsing the settings file.', error);
    }
  }
}

export default new ParadiseServiceSettings(path.join(process.cwd(), 'Paradise.Settings.WebServices.yml'));
