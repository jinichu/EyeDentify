///<reference path="./bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="./webrtc-lobby-client.ts" />

interface Lobby {
  ID: string;
  Name: string;
  Creator: string;
  Hidden: boolean;
  RequiresPassword: boolean;
  Distance: number;
  People: number;
  Capacity: number;
}

interface ListLobbyResponse {
  Lobbies: Lobby[];
}

@component("webrtc-lobby-list")
class WebRTCLobbyList extends WebRTCLobbyClient {
  // The address of the lobby server.

  @property({type: Array, notify: true}) lobbies: Lobby[] = [];

  @observe('service,open,location')
  refresh() {
    if (!this.open) {
      return;
    }
    this.send('lobby.list', {Service: this.service}).then((resp: ListLobbyResponse)=>{
      this.lobbies = resp.Lobbies || [];
    });
  }

  connect(id: string, offer: string, password: string) {
    return this.send('lobby.connect', {Id: id, Offer: offer, Password: password});
  }
}

// after the element is defined, we register it in Polymer
WebRTCLobbyList.register();
