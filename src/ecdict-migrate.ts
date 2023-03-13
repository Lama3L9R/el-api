import { Mongoose, Schema } from 'mongoose'
import process from 'process'
import sqlite3 from 'sqlite3'

(async () => {
    const [,,ecdict, mongodbURL] = process.argv
    if (!ecdict || !mongodbURL) {
        console.log('Migrate to mongodb from sqlite3 (ecdict.db/stardict.db)')
        console.log('usage: <ecdict.db> <mongodb://....>')
        process.exit(1)
    }

    const ecdictDB = new sqlite3.Database(ecdict)
    const mongodb = new Mongoose()
    await mongodb.connect(mongodbURL)

    const MongoDBWords = mongodb.model('words', new Schema({ // data from https://github.com/skywind3000/ECDICT
        word: String,
        phonetic: String,
        definition: String,
        translation: String,
        pos: String,
        tag: String,
        bnc: String,
        exchange: String
    }))


    ecdictDB.each("SELECT * from stardict", async (err, row) => {
        if (err) {
            console.error(err)
        } else {
            
        }
    });

    for (const i of (await new Promise<any[]>((resolve, reject) => { // ecdictDB.each cannot use async callback so .... have to load all and write to database
        ecdictDB.all('SELECT * FROM stardict', (err, rows) => {
            if (err) {
                reject(err)
            } else {
                console.log("Data load done! total: " + rows.length + " lines of data ") 
                resolve(rows)
            }
        })
    }))) {
        await new MongoDBWords({
            ...i
        }).save()

        console.log("I: Moved " + i.word + " into MongoDB") 
    }
    
})()