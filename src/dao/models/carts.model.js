import mongoose from 'mongoose';

const collection = 'carts';

const schema = new mongoose.Schema({
    id: Number,
    products: [
        {
            pid: Number,
            quantity: Number
        }
    ]
});

const cartModel = mongoose.model(collection, schema);

export default cartModel;