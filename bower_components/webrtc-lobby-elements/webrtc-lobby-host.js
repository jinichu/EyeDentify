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
var WebRTCLobbyHost = (function (_super) {
    __extends(WebRTCLobbyHost, _super);
    function WebRTCLobbyHost() {
        _super.apply(this, arguments);
        // The address of the lobby server.
        this.token = this.generateToken();
    }
    WebRTCLobbyHost.prototype.attached = function () {
        var _this = this;
        this.register('client.connect', function (req, resolve, reject) {
            if (_this.password.length > 0 && _this.password != req.Password) {
                reject('invalid credentials');
            }
            if (typeof _this.offer === 'function') {
                _this.offer(req, resolve);
                return;
            }
            reject('no offer handler available');
        });
    };
    WebRTCLobbyHost.prototype.refresh = function () {
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
        }).then(function (resp) { });
    };
    WebRTCLobbyHost.prototype.generateToken = function (length) {
        if (length === void 0) { length = 10; }
        var crypto = window.crypto || window.msCrypto;
        var buf = new Uint8Array(length);
        crypto.getRandomValues(buf);
        var str = "";
        for (var i = 0; i < buf.length; i++) {
            var n = buf[i];
            str += WebRTCLobbyHost.LETTERS[n % WebRTCLobbyHost.LETTERS.length];
        }
        return str;
    };
    WebRTCLobbyHost.LETTERS = "1234567890abcdefghijklmnopqrstuvwxyz";
    __decorate([
        property({ type: String, notify: true })
    ], WebRTCLobbyHost.prototype, "token", void 0);
    __decorate([
        property({ type: String })
    ], WebRTCLobbyHost.prototype, "name", void 0);
    __decorate([
        property({ type: String, value: '' })
    ], WebRTCLobbyHost.prototype, "creator", void 0);
    __decorate([
        property({ type: String, value: '' })
    ], WebRTCLobbyHost.prototype, "password", void 0);
    __decorate([
        property({ type: Number, value: 0 })
    ], WebRTCLobbyHost.prototype, "people", void 0);
    __decorate([
        property({ type: Number, value: 0 })
    ], WebRTCLobbyHost.prototype, "capacity", void 0);
    __decorate([
        property({ type: Boolean, value: false })
    ], WebRTCLobbyHost.prototype, "hidden", void 0);
    __decorate([
        property({ type: Object, value: {} })
    ], WebRTCLobbyHost.prototype, "location", void 0);
    __decorate([
        property({ type: Function })
    ], WebRTCLobbyHost.prototype, "offer", void 0);
    __decorate([
        observe('open,service,token,name,creator,hidden,password,people,capacity,location')
    ], WebRTCLobbyHost.prototype, "refresh", null);
    WebRTCLobbyHost = __decorate([
        component("webrtc-lobby-host")
    ], WebRTCLobbyHost);
    return WebRTCLobbyHost;
}(WebRTCLobbyClient));
// after the element is defined, we register it in Polymer
WebRTCLobbyHost.register();
