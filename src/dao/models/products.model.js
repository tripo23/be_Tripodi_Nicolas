import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

mongoose.pluralize(null); 

const collection = 'products';

const schema = new mongoose.Schema({
    title: { type: String},
    description: { type: String},
    price: { type: Number},
    status: { type: Boolean, default: true},
    thumbnail: { type: String},
    code: { type: String},
    stock: { type: Number},
    category: { type: String},
    owner: {type: String, default: 'admin'},
});

schema.plugin(mongoosePaginate);
const productModel = mongoose.model(collection, schema);

export default productModel;