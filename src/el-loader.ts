import { run as getEnvironment } from 'envinfo'
import pino from 'pino'
import pretty from 'pino-pretty'
import { boot as bootApplication } from './el-api/el'
import fs from 'fs'
import { ELServerConfig } from './el-api/el-config'

const DEFAULT_CONFIG = { http: { listen: '0.0.0.0', port: 1048 }, database: { mongodbURL: 'mongodb://localhost:27017/el' } }

;(async () => {
    const logger = pino(pretty())

    logger.info("Starting application with environment")

    logger.info(await getEnvironment({
        System: ['OS'],
        Binaries: ['Node', 'MongoDB']
    }))

    let config: ELServerConfig | null = null
    if (!fs.existsSync("config.json")) {
        logger.info("Config file does not exsist! Creating a new one and using the default config to start.")
        fs.writeFileSync('config.json', JSON.stringify(DEFAULT_CONFIG, null, 4))
    } else {
        config = JSON.parse(fs.readFileSync('config.json').toString())
    }

    bootApplication(config ?? DEFAULT_CONFIG, logger)
})()
