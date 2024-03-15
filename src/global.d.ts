/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */

import { Socket } from 'net';
import * as ws from 'ws';

// declare global {
//   var ServiceSettings: ParadiseServiceSettings;
// }

declare module 'ws' {
  export interface WebSocket extends ws {
    _socket: Socket;
  }
}
