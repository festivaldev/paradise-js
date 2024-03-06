/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable no-unused-vars */

import * as ws from 'ws';
import type ParadiseServiceSettings from '@/ParadiseServiceSettings';
import { Socket } from 'net';

declare global {
  var ServiceSettings: ParadiseServiceSettings;
}

declare module 'ws' {
  export interface WebSocket extends ws {
    _socket: Socket;
  }
}
