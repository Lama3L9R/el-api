# el-api

[![996.icu](https://img.shields.io/badge/link-996.icu-red.svg)](https://996.icu)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

Project EL API Implementation but ultra high performance

---

## Usage

0. Make sure you have mongodb installed and ecdict.db(aka stardict.db)
1. Clone this repo
2. `$ yarn install`
3. `$ yarn build`
4. Use `node ./dist/ecdict-migrate.js <path/to/ecdict.db> <mongodbURL>` to migrate. Or you can download a pre-migrated json format of this database from `https://t.me/lamaradio/328`. Json format can be imported to MongoDB directly no other steps are required!
5. Use `node ./dist/el-loader.js` to start the server. Make sure to check out the config file after the first launch.
6. Use a reverse proxy(traefik or nginx) to set up SSL | THIS STEP IS NECESSARY AND NEVER CAN BE SKIPPED ON PRODUCTION ENVIRONMENT!!!

