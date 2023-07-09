import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "tickets";

const schema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
});

const ticketModel = mongoose.model(collection, schema);

export default ticketModel;
