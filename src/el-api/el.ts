import { ELServerConfig } from "./el-config";
import fastify, { RouteOptions } from "fastify";
import cors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyJwt from "@fastify/jwt";
import { Logger } from "pino";
import mongoose, { Schema } from "mongoose";
import { createHash } from "crypto";
import * as SessionRoutes from './routes/session'
import * as VocabularyRoutes from './routes/vocabulary'


export type FastifyRoute = RouteOptions

export const DBUser = mongoose.model('user', new Schema({ 
    username: String,
    password: String,
    vocabulary: [
        {
            word: String,
            learningRate: Number,
        }
    ],
    tests: [
        {
            type: String,
            words: [ 
                {
                    type: String, // etc, cte
                    question: String,
                    answerA: String,
                    answerB: String,
                    correctAnswer: String
                }
            ],
            result: [
                {
                    word: String,
                    isCorrect: String
                }
            ]
        }
    ]
}))

export const DBWords = mongoose.model('words', new Schema({ // data from https://github.com/skywind3000/ECDICT
    word: String,
    phonetic: String,
    definition: String,
    translation: String,
    pos: String,
    tag: String,
    bnc: String,
    exchange: String
}))

export async function boot(config: ELServerConfig, logger: Logger) {
    const server = fastify({ logger })
    const mongodb = await mongoose.connect(config.database.mongodbURL)

    process.on('SIGINT', async () => {
        await server.close()
        await mongoose.disconnect()
    })

    server.decorate('mongodb', mongodb)
    // await server.register(fastifyRateLimit, {
        // max: 1500,
        // timeWindow: '1 minute'
    // })
    await server.register(fastifyJwt, {
        secret: createHash('SHA512').update(Math.random() + '<114514>' + Date.now()).digest('hex')
    })

    server.route(SessionRoutes.authenticate)
    server.route(SessionRoutes.register)

    server.route(VocabularyRoutes.listWords)
    server.route(VocabularyRoutes.getWordDict)
    server.route(VocabularyRoutes.addWord)

    server.addHook("onRequest", async (req, rep) => {
        rep.header("Access-Control-Allow-Origin", "*").header("Access-Control-Allow-Methods", "*").header("Access-Control-Allow-Headers", "*")
    })
    server.route({
        method: "OPTIONS",
        url: "/*",
        schema: {
            response: {
                200: {
                    type: "null"
                },
            },
        },
        handler: function(req, rep) {
            rep.header("Access-Control-Allow-Origin", "*").header("Access-Control-Allow-Methods", "*").header("Access-Control-Allow-Headers", "*").code(200).send()
        }
    
    })

    await server.listen({
        host: config.http.listen,
        port: config.http.port
    })

    logger.info('API Server start complete')
}