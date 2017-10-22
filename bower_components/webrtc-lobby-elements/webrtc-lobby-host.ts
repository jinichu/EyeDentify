///<reference path="./bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="./webrtc-lobby-client.ts" />

interface Lobby {
}

interface CreateLobbyResponse {
  Lobbies: Lobby[];
}

interface ConnectLobbyRequest {
  ID: string;
  Offer: string;
  Password: string;
}

@component("webrtc-lobby-host")
class WebRTCLobbyHost extends WebRTCLobbyClient {
  // The address of the lobby server.

  @property({type: String, notify: true}) token: string = this.generateToken();
  @property({type: String}) name: string;
  @property({type: String, value: ''}) creator: string;
  @property({type: String, value: ''}) password: string;
  @property({type: Number, value: 0}) people: number;
  @property({type: Number, value: 0}) capacity: number;
  @property({type: Boolean, value: false}) hidden: boolean;
  @property({type: Object, value: {}}) location: any;
  @property({type: Function}) offer: (req: ConnectLobbyRequest, resolve: any)=>void;

  attached() {
    this.register('client.connect', (req: ConnectLobbyRequest, resolve: (resp: any)=>void, reject: (error: any)=>void) => {
      if (this.password.length > 0 && this.password != req.Password) {
        reject('invalid credentials');
      }
      if (typeof this.offer === 'function') {
        this.offer(req, resolve);
        return;
      }
      reject('no offer handler available');
    });
  }

  @observe('open,service,token,name,creator,hidden,password,people,capacity,location')
  refresh() {
    if (!this.open) {
      return;
    }
    this.send('lobby.new', {
      Service: this.service,
      ID: this.token,
      Name: this.name,
      Creator: this.creator,
      Hidden: this.hidden,
      RequiresPassword: this.password.length > 0,
      People: this.people,
      Capacity: this.capacity,
      Location: this.location
    }).then((resp: CreateLobbyResponse)=>{});
  }

  static LETTERS = "1234567890abcdefghijklmnopqrstuvwxyz";

  generateToken(length: number = 10): string {
    const crypto = window.crypto || window.msCrypto;
    const buf = new Uint8Array(length);
    crypto.getRandomValues(buf);
    let str = "";
    for (let i = 0; i < buf.length; i++) {
      const n = buf[i];
      str += WebRTCLobbyHost.LETTERS[n % WebRTCLobbyHost.LETTERS.length];
    }
    return str;
  }
}

// after the element is defined, we register it in Polymer
WebRTCLobbyHost.register();
