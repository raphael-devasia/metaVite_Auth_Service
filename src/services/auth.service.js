"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const user_repository_1 = require("../repositories/user.repository");
const uuid_1 = require("uuid");
// Register user
const registerUser = (email, password, role, name, companyRefId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const username = generateUsername(role, name.firstName, name.lastName);
    const result = yield (0, user_repository_1.createUser)(email, password, role, name, username, companyRefId, token);
    return result;
});
exports.registerUser = registerUser;
const loginUser = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const role = findRoleFromUsername(username);
    const result = yield (0, user_repository_1.checkUser)(username, password, role);
    return result;
});
exports.loginUser = loginUser;
function generateUsername(role, firstName, lastName) {
    const rolePrefixes = {
        shipperAdmin: "SA",
        driver: "DR",
        shipperStaff: "SS",
        carrierAdmin: "CA",
        appAdmin: "AA",
    };
    const prefix = rolePrefixes[role];
    const nameInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(); // Get initials
    // Generate a unique identifier (5 characters: last 3 digits of timestamp + 2 random letters)
    const timestampPart = Date.now().toString().slice(-3); // Last 3 digits of timestamp
    const randomPart = Math.random().toString(36).toUpperCase().slice(-2); // 2 random letters
    // Combine to make a 10-character username
    return `${prefix}${nameInitials}${timestampPart}${randomPart}`;
}
// Helper function to generate a unique companyRefId
const generateCompanyRefId = (role) => {
    const prefix = role === "shipperAdmin" ? "SH" : "CA"; // Prefix for shipper or carrier
    const uniqueId = (0, uuid_1.v4)().split("-")[0].toUpperCase();
    return `${prefix}-${uniqueId}`;
};
const findRoleFromUsername = (username) => {
    const rolePrefixes = {
        SA: "shipperAdmin",
        DR: "driver",
        SS: "shipperStaff",
        CA: "carrierAdmin",
        AA: "appAdmin",
    };
    const prefix = username.slice(0, 2);
    return rolePrefixes[prefix] || "unknown";
};
