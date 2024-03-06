import { Log } from '@/utils';
import express, { type Express } from 'express';
import { type AddressInfo } from 'net';
import path from 'path';

export default class FileServerHost {
  public readonly port: number;

  public readonly expressApp: Express;

  constructor(port: number = 8081) {
    this.port = port;

    this.expressApp = express();
    this.expressApp.disable('x-powered-by');
    this.expressApp.disable('etag');
    this.expressApp.set('json spaces', 2);

    // if (process.env["NODE_ENV"] !== "production") {
    // this.expressApp.use(morgan(`[${chalk.blue('INFO')}] [WebServiceHost] [:date[iso]] :remote-addr ":method :url HTTP/:http-version" :status (:req[Content-Length]/:res[content-length] bytes)`));
    // }

    this.expressApp.use('/', express.static(path.join(process.cwd(), 'wwwroot')));
  }

  public async start(): Promise<void> {
    Log.info('Starting HTTP server...');

    return new Promise((resolve, reject) => {
      const listener = this.expressApp.listen(this.port, global.ServiceSettings.Hostname ?? '0.0.0.0', () => {
        const address: AddressInfo = (listener.address() as AddressInfo);
        Log.info(`HTTP server listening on ${address.address}:${address.port}.`);

        resolve();
      });
    });
  }
}
