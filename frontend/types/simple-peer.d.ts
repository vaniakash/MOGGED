declare module 'simple-peer' {
  import { EventEmitter } from 'events';

  namespace SimplePeer {
    interface Options {
      initiator?: boolean;
      trickle?: boolean;
      stream?: MediaStream;
      config?: RTCConfiguration;
      channelConfig?: RTCDataChannelInit;
      channelName?: string;
      offerOptions?: RTCOfferOptions;
      answerOptions?: RTCAnswerOptions;
      sdpTransform?: (sdp: string) => string;
      objectMode?: boolean;
      allowHalfOpen?: boolean;
      wrtc?: any;
    }

    type SignalData = {
      type?: string;
      sdp?: string;
      candidate?: RTCIceCandidateInit;
      [key: string]: any;
    };
  }

  class SimplePeer extends EventEmitter {
    constructor(opts?: SimplePeer.Options);
    signal(data: SimplePeer.SignalData | string): void;
    send(chunk: ArrayBufferView | ArrayBuffer | Buffer | string | Blob): void;
    destroy(err?: Error): void;
    readonly connected: boolean;
    readonly destroyed: boolean;
    readonly readable: boolean;
    readonly writable: boolean;
    on(event: 'signal', listener: (data: SimplePeer.SignalData) => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'stream', listener: (stream: MediaStream) => void): this;
    on(event: 'track', listener: (track: MediaStreamTrack, stream: MediaStream) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export = SimplePeer;
}
