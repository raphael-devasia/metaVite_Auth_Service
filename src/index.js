"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = __importDefault(require("./config/db.config"));
require("./services/grpc-server"); // Import the gRPC server setup
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
(0, db_config_1.default)()
    .then(() => {
    console.log(`Auth Service is running on port ${PORT}`);
})
    .catch((error) => {
    console.error("Failed to connect to the database:", error);
});
