import { DBUser, DBWords, FastifyRoute } from "../el";
import { jwtVerify } from "./session";

export const listWords: FastifyRoute = {
    url: "/vocabulary/list",
    method: "GET",
    schema: {
        // TODO complete schema to boost performance
    },
    onRequest: jwtVerify,
    handler: async function(req, rep) {
        const { username } = req.jwtPayload as { username: string }
        const user = await DBUser.findOne({ username })

        if (!user) {
            this.log.info("VL1 Error: USER NOT FOUND! Username = " + username)
            return await rep.code(200).send({ status: { err: 2, msg: "INTERNAL_SERVER_ERROR_VL1" } })
        }

        const words = []
        for (const w of user.vocabulary) {
            words.push({ ...((await DBWords.findOne({ word: w.word }))?.toObject()), learningRate: w.learningRate })
        }

        return rep.code(200).send({ status: { err: 0, msg: "OK" }, vocabulary: words })
    }
}

export const addWord: FastifyRoute = {
    url: "/vocabulary/add",
    method: "POST",
    schema: {
        // todo
    },
    preHandler: jwtVerify,
    handler: async function(req, rep) {
        const { word } = req.body as { word : string }
        const { username } = req.jwtPayload as { username: string }

        await DBUser.updateOne( { username }, { "$push": {
            vocabulary: { word, learningRate: -1 }
        } } )

        return await rep.code(200).send({ status: { err: 0, msg: "OK" } })
    }
}

export const getWordDict: FastifyRoute = {
    url: "/vocabulary/words/:word",
    method: "GET",
    schema: {
        // TODO complete schema to boost performance
    },
    onRequest: jwtVerify,
    handler: async function(req, rep) {
        const { username } = req.jwtPayload as { username: string }
        const word = (req.params as { word: string }).word as string

        this.log.info(`WWW1 ${username} requested the definition of ${word}`)

        return rep.code(200).send({ status: { err: 0, msg: "OK" }, word: await DBWords.findOne({ word }) })
    }
}