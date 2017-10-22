///<reference path="./bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="./webrtc-lobby-client.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebRTCLobbyList = (function (_super) {
    __extends(WebRTCLobbyList, _super);
    function WebRTCLobbyList() {
        _super.apply(this, arguments);
        // The address of the lobby server.
        this.lobbies = [];
    }
    WebRTCLobbyList.prototype.refresh = function () {
        var _this = this;
        if (!this.open) {
            return;
        }
        this.send('lobby.list', { Service: this.service }).then(function (resp) {
            _this.lobbies = resp.Lobbies || [];
        });
    };
    WebRTCLobbyList.prototype.connect = function (id, offer, password) {
        return this.send('lobby.connect', { Id: id, Offer: offer, Password: password });
    };
    __decorate([
        property({ type: Array, notify: true })
    ], WebRTCLobbyList.prototype, "lobbies", void 0);
    __decorate([
        observe('service,open,location')
    ], WebRTCLobbyList.prototype, "refresh", null);
    WebRTCLobbyList = __decorate([
        component("webrtc-lobby-list")
    ], WebRTCLobbyList);
    return WebRTCLobbyList;
}(WebRTCLobbyClient));
// after the element is defined, we register it in Polymer
WebRTCLobbyList.register();
