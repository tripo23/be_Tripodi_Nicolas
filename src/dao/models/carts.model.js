import mongoose from "mongoose";
import productModel from "./products.model.js";

mongoose.pluralize(null); 

const collection = "carts";

const schema = new mongoose.Schema({
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

schema.pre('populate', function() {
  this.populate({ path: 'products.product', model: productModel });
});


const cartModel = mongoose.model(collection, schema);

export default cartModel;
