import mongoose from 'mongoose';

const collection = 'products';

const schema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    status: Boolean,
    thumbnail: String,
    code: String,
    stock: Number,
    category: String
});

const productModel = mongoose.model(collection, schema);

export default productModel;