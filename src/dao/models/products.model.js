import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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

schema.plugin(mongoosePaginate);
const productModel = mongoose.model(collection, schema);

export default productModel;