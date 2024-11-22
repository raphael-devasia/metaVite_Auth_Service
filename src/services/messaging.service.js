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
exports.publishToQueue = void 0;
const rabbitmq_config_1 = require("../config/rabbitmq.config");
const publishToQueue = (queue, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { connection, channel } = yield (0, rabbitmq_config_1.connectRabbitMQ)();
    yield channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log("Message sent to queue:", message);
    yield channel.close();
    yield connection.close();
});
exports.publishToQueue = publishToQueue;
