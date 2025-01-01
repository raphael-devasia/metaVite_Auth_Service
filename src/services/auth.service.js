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
const messaging_service_1 = require("./messaging.service");
// Register user
const registerUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    let companyRefId = "";
    const { role, email, password } = user;
    if (role === "shipperAdmin" || role === "carrierAdmin") {
        companyRefId = generateCompanyRefId(role);
    }
    else {
        companyRefId = user.companyRefId;
        console.log("companyRefId", companyRefId);
    }
    const { firstName, lastName } = user.name;
    const username = generateUsername(role, firstName, lastName);
    const result = yield (0, user_repository_1.createUser)(email, password, role, user.name, username, companyRefId, user.token);
    if (result.success) {
        // Publish an event to RabbitMQ for sending a welcome email
        console.log(result);
        const message = JSON.stringify({
            email: (_a = result.user) === null || _a === void 0 ? void 0 : _a.email,
            subject: "Welcome to Our Service",
            text: `Hello ${result.firstName},\n\nThank you for registering with us! Your username is ${(_b = result.user) === null || _b === void 0 ? void 0 : _b.username}.\n\nBest regards,\nThe Team`,
        });
        try {
            yield (0, messaging_service_1.publishToQueue)("emailQueue", message);
            console.log("Message published to emailQueue");
        }
        catch (messageError) {
            console.error("Error publishing to queue:", messageError);
        }
        const userId = (_c = result.user) === null || _c === void 0 ? void 0 : _c._id;
        const data = Object.assign(Object.assign({}, user), { userId, companyRefId, username });
        console.log('data that is sending to the carrier:', data);
        if (((_d = result.user) === null || _d === void 0 ? void 0 : _d.role) == "carrierAdmin" ||
            ((_e = result.user) === null || _e === void 0 ? void 0 : _e.role) == "driver") {
            try {
                yield (0, messaging_service_1.publishToQueue)("carrierServiceQueue", JSON.stringify(data));
                console.log("Message published to carrierServiceQueue");
            }
            catch (messageError) {
                console.error("Error publishing to queue:", messageError);
            }
        }
        else if (((_f = result.user) === null || _f === void 0 ? void 0 : _f.role) == "shipperAdmin" ||
            ((_g = result.user) === null || _g === void 0 ? void 0 : _g.role) == "shipperStaff") {
            try {
                yield (0, messaging_service_1.publishToQueue)("shipperServiceQueue", JSON.stringify(data));
                console.log("Message published to shipperServiceQueue");
            }
            catch (messageError) {
                console.error("Error publishing to queue:", messageError);
            }
        }
    }
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
    return `${prefix}${uniqueId}`;
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
