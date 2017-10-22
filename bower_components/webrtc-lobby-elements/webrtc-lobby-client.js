///<reference path="./bower_components/polymer-ts/polymer-ts.d.ts" />
///<reference path="./typings/browser/ambient/es6-promise/index.d.ts" />
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
var WebRTCLobbyClient = (function (_super) {
    __extends(WebRTCLobbyClient, _super);
    function WebRTCLobbyClient() {
        _super.apply(this, arguments);
        this.open = false;
        this.curID = 0;
        this.promises = {};
        this.handlers = {};
        this.debug = false;
    }
    WebRTCLobbyClient.prototype.nextID = function () {
        this.curID = (this.curID || 0) + 1;
        return this.curID;
    };
    WebRTCLobbyClient.prototype.onOpen = function () {
        this.open = true;
    };
    WebRTCLobbyClient.prototype.created = function () {
        this.getLocation();
    };
    WebRTCLobbyClient.prototype.send = function (method, params) {
        var _this = this;
        var id = this.nextID();
        var body = {
            method: method,
            params: [params],
            id: id
        };
        var p = new Promise(function (resolve, reject) {
            if (!_this.promises) {
                _this.promises = {};
            }
            _this.promises[id] = {
                resolve: resolve,
                reject: reject
            };
        });
        this.sendRaw(body);
        return p;
    };
    WebRTCLobbyClient.prototype.getLocation = function () {
        var _this = this;
        navigator.geolocation.getCurrentPosition(function (position) {
            _this.location = position.coords;
        });
    };
    WebRTCLobbyClient.prototype.register = function (method, handler) {
        if (!this.handlers) {
            this.handlers = {};
        }
        this.handlers[method] = handler;
    };
    WebRTCLobbyClient.prototype.sendRaw = function (body) {
        if (this.debug) {
            console.log('sending', body);
        }
        this.$.socket.send(body);
    };
    WebRTCLobbyClient.prototype.message = function (event, data) {
        var _this = this;
        if (data.data.method) {
            if (this.debug) {
                console.log('rpc', data.data);
            }
            var p = new Promise(function (resolve, reject) {
                var handler = _this.handlers[data.data.method];
                if (!handler) {
                    reject('unknown rpc call');
                    return;
                }
                handler(data.data.params[0], resolve, reject);
            }).then(function (result) {
                _this.sendRaw({
                    id: data.data.id,
                    error: null,
                    result: result
                });
            }).catch(function (error) {
                _this.sendRaw({
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
        var resolver = this.promises[data.data.id];
        delete this.promises[data.data.id];
        if (data.data.error) {
            this.error = data.data.error;
            resolver.reject(data.data.error);
            return;
        }
        resolver.resolve(data.data.result);
    };
    __decorate([
        property({ type: String })
    ], WebRTCLobbyClient.prototype, "url", void 0);
    __decorate([
        property({ type: String, notify: true })
    ], WebRTCLobbyClient.prototype, "error", void 0);
    __decorate([
        property({ type: String })
    ], WebRTCLobbyClient.prototype, "service", void 0);
    __decorate([
        property({ type: Object, value: {} })
    ], WebRTCLobbyClient.prototype, "location", void 0);
    __decorate([
        property({ type: Boolean })
    ], WebRTCLobbyClient.prototype, "open", void 0);
    return WebRTCLobbyClient;
}(polymer.Base));
