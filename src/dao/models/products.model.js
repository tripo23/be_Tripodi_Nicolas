import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null); 

const collection = 'products';

const schema = new mongoose.Schema({
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