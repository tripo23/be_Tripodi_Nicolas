import mongoose from 'mongoose';
import cartsModel from './models/carts.model.js'


class CartManager {

    static notFound = "err";
    constructor(path) {
        this.path = path;
        this.cart = [];
    }

    newCart = async () => {
        const newCart = {
            products: []
        };
        const process = await cartsModel.create(newCart);
        return process._id;
    }

    getCartByID = async (id) => {
        try {
            const found = await cartsModel.findById(id);
            return found ? found : CartManager.notFound;
        } catch (err) {
            console.log(err);
        }
    }

    
    // REVISAR.
    addProductToCart = async (data) => {
       try {
            const cartToUpdate = await this.getCartByID(data.cid);
            if (cartToUpdate == CartManager.notFound) {
                return 'err'
            } else {
                    const process = await cartsModel.updateOne({ '_id': new mongoose.Types.ObjectId(data.cid) }, data);
                }
            
       } catch (error) {
            console.log(error);
       }
    }

    async load() {
        try {
            this.cart = await cartsModel.find().lean();
        } catch (error) {
            this.cart = [];
        }
    }

}

export default CartManager;