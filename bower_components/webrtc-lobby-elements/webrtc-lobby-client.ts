///<reference path="./bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="./typings/browser/ambient/es6-promise/index.d.ts" />

interface Data {
  data: RPCResponse
}

interface RPCResponse {
  error: any
  id: number
  result: any
  method: string
  params: any[]
}

type Resolver = {
  resolve: (data: any)=>void
  reject: (error: any)=>void
}

type Handler = (params: any, resolve: (data: any)=>void, reject: (error: any)=>void)=>void;

interface Window { msCrypto: Crypto; }

class WebRTCLobbyClient extends polymer.Base {
  @property({type: String}) url: string;

  @property({type: String, notify: true}) error: string;

  @property({type: String}) service: string;
  @property({type: Object, value: {}}) location: any;
  @property({type: Boolean}) open: boolean = false;

  private curID: number = 0;
  private promises: { [id: number]: Resolver; } = {};
  private handlers: { [method: string]: Handler; } = {};

  public debug = false;

  nextID(): number {
    this.curID = (this.curID || 0) + 1;
    return this.curID;
  }

  onOpen() {
    this.open = true;
  }

  created() {
    this.getLocation()
  }

  send(method: string, params: any): Promise<any> {
    const id = this.nextID();

    const body = {
      method: method,
      params: [params],
      id: id
    }
    const p = new Promise((resolve: (data: any)=>void, reject: (error: any)=>void)=>{
      if (!this.promises) {
        this.promises = {};
      }
      this.promises[id] = {
        resolve: resolve,
        reject: reject
      }
    });
    this.sendRaw(body);
    return p;
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.location = position.coords;
    });
  }

  register(method: string, handler: Handler) {
    if (!this.handlers) {
      this.handlers = {};
    }
    this.handlers[method] = handler;
  }

  sendRaw(body: any) {
    if (this.debug) {
      console.log('sending', body);
    }
    this.$.socket.send(body);
  }

  message(event: any, data: Data) {
    if (data.data.method) {
      if (this.debug) {
        console.log('rpc', data.data);
      }
      const p = new Promise((resolve: (result: any)=>void, reject: (error: any)=>void) => {
        const handler = this.handlers[data.data.method];
        if (!handler) {
          reject('unknown rpc call');
          return;
        }
        handler(data.data.params[0], resolve, reject);
      }).then((result: any) => {
        this.sendRaw({
          id: data.data.id,
          error: null,
          result: result
        });
      }).catch((error: Error) => {
        this.sendRaw({
          id: data.data.id,
          error: error.message || error,
          result: null
        });
      });
      return;
    }
    if (this.debug) {
      console.log('response', data.data);
    }
    const resolver = this.promises[data.data.id];
    delete this.promises[data.data.id];
    if (data.data.error) {
      this.error = data.data.error;
      resolver.reject(data.data.error);
      return;
    }
    resolver.resolve(data.data.result);
  }
}
