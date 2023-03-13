import { DBUser, FastifyRoute } from "../el";
import { createHash } from "crypto";
import { RouteHandlerMethod } from "fastify";

export const jwtVerify: RouteHandlerMethod = async function (req, rep) {
    try {
        req.jwtPayload = (await req.jwtVerify() as { username: string })
    } catch (err) {
        this.log.error(err)
        rep.send({ status: { err: 1, msg: "INVAILED_TOKEN" } })
    }
}

export const authenticate: FastifyRoute = {
    url: "/session/auth",
    method: "POST",
    schema: {
        body: {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                }
            }
        },
        response: {
            200: {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "object",
                        "properties": {
                            "err": {
                                "type": "number"
                            },
                            "msg": {
                                "type": "string"
                            }
                        }
                    },
                    "token": {
                        "type": ["string", "null"]
                    }
                }
            }
        }
    },
    handler: async function(req, rep) {
        const { username, password } = req.body as { username: string, password: string }

        this.log.info(`Authenticate request: ${username} with password ${password}`)

        const user = await DBUser.findOne({ username, password: createHash('SHA512').update(password).digest('hex') })
        if (user == null) {
            return await rep.code(200).send({ status: { err: 1, msg: "USERNAME_AND_PASSWORD_MISMATCH" } })
        }

        const token = await rep.jwtSign({
            username, easterEgg: "You've found a easter egg which is useless"
        })
        

        return await rep.code(200).send({ status: { err: 0, msg: "AUTH_OK" }, token })
    }
}

export const register: FastifyRoute = {
    url: "/session/register",
    method: "POST",
    schema: {
        // todo schema
    },
    handler: async function(req, rep) {
        const { username, password } = req.body as { username: string, password: string }
        const encPassword = createHash('SHA512').update(password).digest('hex')

        const user = await DBUser.findOne({ username })
        if (user != null) {
            return await rep.code(200).send({ status: { err: 1, msg: "DUPE_USERNAME" } })
        }

        await new DBUser({
            username, password: encPassword, tests: [], vocabulary: []
        }).save()

        return await rep.code(200).send( { status: { err: 0, msg: "REGISTER_OK" }} )
    }
}