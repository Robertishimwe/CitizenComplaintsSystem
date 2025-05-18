"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceStatus = exports.UserRole = void 0;
// src/modules/users/enums/user.enums.ts
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CITIZEN"] = "CITIZEN";
    UserRole["AGENCY_STAFF"] = "AGENCY_STAFF";
})(UserRole || (exports.UserRole = UserRole = {}));
var ResourceStatus;
(function (ResourceStatus) {
    ResourceStatus["ACTIVE"] = "ACTIVE";
    ResourceStatus["INACTIVE"] = "INACTIVE";
})(ResourceStatus || (exports.ResourceStatus = ResourceStatus = {}));
