const kafka = require('kafka-node')
const {Producer} = kafka
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' })
const producer = new Producer(client)

const kafkaProduce = async (topic, message) => {
    const payloads = [
        { topic, messages: JSON.stringify(message), partition: 0 }
    ]

    await producer.send(payloads, async function (err, data) { 
        // empty 
    })
}

module.exports = { kafkaProduce }
