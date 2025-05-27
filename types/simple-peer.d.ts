declare module 'simple-peer' {
  export interface Options {
    initiator: boolean;
    trickle: boolean;
    stream?: MediaStream;
    config?: RTCConfiguration;
    sdpTransform?: (sdp: string) => string;
    offerOptions?: RTCOfferOptions;
    answerOptions?: RTCAnswerOptions;
  }

  export interface Instance extends EventEmitter {
    signal(data: SignalData): void;
    destroy(): void;
  }

  export interface SignalData {
    type?: string;
    [key: string]: any;
  }

  export interface EventEmitter {
    on(event: string, listener: Function): this;
    once(event: string, listener: Function): this;
    off(event: string, listener: Function): this;
    removeListener(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
  }

  export default function SimplePeer(opts?: Options): Instance;
}
