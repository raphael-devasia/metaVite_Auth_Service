const amqp = require("amqplib")

export const connectRabbitMQ = async () => {
    const connection = await amqp.connect("amqp://localhost")
    const channel = await connection.createChannel()
    return { connection, channel }
}
