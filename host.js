"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@methodus/server");
const user_1 = require("./server/controllers/user");
let SetupServer = class SetupServer extends server_1.ConfiguredServer {
};
SetupServer = __decorate([
    server_1.ServerConfiguration("express", { port: process.env.PORT || 8020 }),
    server_1.PluginConfiguration('@methodus/describe'),
    server_1.ClientConfiguration(user_1.User, "Local", "express")
], SetupServer);
new SetupServer();
//# sourceMappingURL=host.js.map