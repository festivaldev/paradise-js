import { Log } from '@/utils';
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
import express, { type Express } from 'express';
import { AddressInfo } from 'net';
// eslint-disable-next-line camelcase
import WebServicesV2_0, { Services as ServicesV2_0 } from './routes/v2';

export default class WebServiceHost {
  public readonly port: number;

  public readonly expressApp: Express;

  constructor(port: number = 8080) {
    this.port = port;

    this.expressApp = express();
    this.expressApp.disable('x-powered-by');
    this.expressApp.disable('etag');
    this.expressApp.set('json spaces', 2);

    // if (process.env["NODE_ENV"] !== "production") {
    // this.expressApp.use(morgan(`[${chalk.blue('INFO')}] [WebServiceHost] [:date[iso]] :remote-addr ":method :url HTTP/:http-version" :status (:req[Content-Length]/:res[content-length] bytes)`));
    // }

    bodyParserXml(bodyParser);

    this.expressApp.use(express.urlencoded({ extended: true }));
    this.expressApp.use(bodyParser.xml());

    this.expressApp.use('/2.0', WebServicesV2_0);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const listener = this.expressApp.listen(this.port, global.ServiceSettings.Hostname ?? '0.0.0.0', () => {
        for (const [serviceName, service] of Object.entries(ServicesV2_0)) {
          Log.debug(`Initializing ${service.ServiceName} (${service.ServiceVersion})...`);
        }

        const address: AddressInfo = (listener.address() as AddressInfo);
        Log.info(`HTTP server listening on ${address.address}:${address.port}.`);

        resolve();
      });
    });
  }
}
