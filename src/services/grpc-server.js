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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const auth_service_1 = require("./auth.service");
// Define paths
const PROTO_PATH = path_1.default.join(__dirname, "../../../protos/auth.proto");
console.log("Resolved proto file path:", PROTO_PATH);
// Load the .proto file with type options
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
// Create a typed object from the package definition
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
// Create the gRPC server
const server = new grpc.Server();
// Implement service methods
server.addService(authProto.AuthService.service, {
    Register: (call, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, role, name, companyRefId, token } = call.request;
        try {
            const user = yield (0, auth_service_1.registerUser)(email, password, role, name, companyRefId, token);
            callback(null, user);
        }
        catch (error) {
            callback(error, null);
        }
    }),
    Login: (call, callback) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, password } = call.request;
            const result = yield (0, auth_service_1.loginUser)(username, password);
            callback(null, result);
        }
        catch (error) {
            callback(error, null);
        }
    }),
});
// Start the gRPC server
server.bindAsync("0.0.0.0:3001", grpc.ServerCredentials.createInsecure(), () => {
    console.log("Auth Service gRPC server running at http://0.0.0.0:3001");
    server.start();
});
