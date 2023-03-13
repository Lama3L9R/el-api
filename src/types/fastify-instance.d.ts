import { Mongoose } from "mongoose";

declare module 'fastify' {
    export interface FastifyInstance {
        mongodb: Mongoose
    }

    export interface FastifyRequest {
        jwtPayload: any
    }
}