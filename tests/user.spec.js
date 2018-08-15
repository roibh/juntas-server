"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alsatian_1 = require("alsatian");
const Data = require("./data");
const user_1 = require("../server/controllers/user");
var Mutations;
(function (Mutations) {
    Mutations[Mutations["UID"] = 0] = "UID";
    Mutations[Mutations["COMPANY"] = 1] = "COMPANY";
    Mutations[Mutations["ID"] = 2] = "ID";
    Mutations[Mutations["FILE_ID"] = 3] = "FILE_ID";
    Mutations[Mutations["CASE_ID"] = 4] = "CASE_ID";
})(Mutations || (Mutations = {}));
function mutate(source, mutation) {
    const obj = JSON.parse(JSON.stringify(source));
    switch (mutation) {
        case 0:
            delete obj.uid;
            break;
        case 1:
            delete obj._company_id;
            delete obj.company_id;
            break;
        case 2:
            obj.id = guid();
            break;
        case 3:
            obj.file_id = guid();
            break;
        case 4:
            obj.case_id = guid();
            break;
    }
    return obj;
}
function guid() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
let TestsOfUser = class TestsOfUser {
    registerFail(userMutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new user_1.User();
            const result = yield controller.register(userMutation);
            alsatian_1.Expect(result).toBeDefined();
        });
    }
    register(userMutation) {
        return __awaiter(this, void 0, void 0, function* () {
            const controller = new user_1.User();
            const result = yield controller.register(userMutation);
            alsatian_1.Expect(result).toBeDefined();
        });
    }
    CleanUp() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
__decorate([
    alsatian_1.AsyncTest('register'),
    alsatian_1.TestCase(Data.newUser),
    alsatian_1.Timeout(10000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestsOfUser.prototype, "registerFail", null);
__decorate([
    alsatian_1.AsyncTest('register good'),
    alsatian_1.TestCase(Data.newUserNew),
    alsatian_1.Timeout(10000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestsOfUser.prototype, "register", null);
__decorate([
    alsatian_1.AsyncTeardownFixture,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestsOfUser.prototype, "CleanUp", null);
TestsOfUser = __decorate([
    alsatian_1.TestFixture('Test Message tile')
], TestsOfUser);
exports.TestsOfUser = TestsOfUser;
//# sourceMappingURL=user.spec.js.map