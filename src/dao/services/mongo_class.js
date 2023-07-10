import mongoose from "mongoose";
import config from "../../config/config.js"

export default class MongoSingleton {
    static #instance

    constructor() {
        mongoose.connect(config.mongoose_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        })
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new MongoSingleton();
            console.log('Conexión DB creada');
        } else {
            console.log('Conexión DB existente');
        }
        return this.#instance
    }
}