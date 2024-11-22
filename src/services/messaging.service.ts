import { connectRabbitMQ } from "../config/rabbitmq.config"

export const publishToQueue = async (queue: string, message: string) => {
    const { connection, channel } = await connectRabbitMQ()
    await channel.assertQueue(queue, { durable: true })
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true })
    console.log("Message sent to queue:", message)
    await channel.close()
    await connection.close()
}
