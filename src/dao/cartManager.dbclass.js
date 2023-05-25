import mongoose from "mongoose";
import cartsModel from "./models/carts.model.js";
import productModel from "./models/products.model.js";

class CartManager {
  static notFound = "err";
  constructor(path) {
    this.path = path;
    this.cart = [];
  }

  newCart = async () => {
    const newCart = {
      products: [],
    };
    const process = await cartsModel.create(newCart);
    return process._id;
  };
  
  getCartByID = async (id) => {
    try {
        let found = await cartsModel.findById(id).populate({
            path: 'products.product',
            model: productModel,
            lean: true
        }); 
    
    return found ? found : CartManager.notFound;

    } catch (err) {
      console.log(err);
    }
  };

  addProductToCart = async (data) => {
    try {
      const cartToUpdate = await this.getCartByID(data.cid);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            const productId = new mongoose.Types.ObjectId(data.pid);
            const productToUpdate = cartToUpdate.products.find(prod => prod._id.equals(productId));
            if (productToUpdate) {
                productToUpdate.quantity = productToUpdate.quantity + parseInt(data.quantity);
            } else {
                cartToUpdate.products.push({product: new mongoose.Types.ObjectId(data.pid), quantity: parseInt(data.quantity)});
            }
            const process = await cartToUpdate.save();    
      }
    } catch (error) {
      console.log(error);
    }
  };

  updateQuantity = async (data) => {
    try {
      const cartToUpdate = await this.getCartByID(data.cid);
      console.log(cartToUpdate);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            const productId = new mongoose.Types.ObjectId(data.pid);
            const productToUpdate = cartToUpdate.products.find(prod => prod.product._id.equals(productId));
            if (productToUpdate) {
                productToUpdate.quantity = productToUpdate.quantity + parseInt(data.quantity);
            } else {
                return "err"
            }
            const process = await cartToUpdate.save();    
      }
    } catch (error) {
      console.log(error);
    }
  };

  updateCart = async (data) => {
    try {
      const cartToUpdate = await this.getCartByID(data.cid);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            cartToUpdate.products.push({_id: new mongoose.Types.ObjectId(data.pid), quantity: parseInt(data.quantity)});
            const process = await cartToUpdate.save();    
      }
    } catch (error) {
      console.log(error);
    }
  };


  addArrayToCart = async (data, cid) => { 
    try {
      let cartToUpdate = await this.getCartByID(cid);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            //cartToUpdate.products = [cartToUpdate.products, ...data.products];
            cartToUpdate.products = cartToUpdate.products.concat(data.products)
            const process = await cartToUpdate.save();    
      }
    } catch (error) {
      console.log(error);
    }
  };


  deleteProductFromCart = async (data) => {
    try {
      const cartToUpdate = await this.getCartByID(data.cid);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            
            const productId = new mongoose.Types.ObjectId(data.pid);
            const productExists = cartToUpdate.products.some(prod => prod.product._id.equals(productId));
        if (productExists) {
            cartToUpdate.products = cartToUpdate.products.filter(prod => !prod.product._id.equals(productId));
        } else {
            return 'err'
        }
        const process = await cartToUpdate.save();
      }
    } catch (error) {
      console.log(error);
    }
  };

  deleteAllProducts = async (data) => {
    try {
      let cartToUpdate = await this.getCartByID(data.cid);
      if (cartToUpdate == CartManager.notFound) {
        return "err";
      } else {
            cartToUpdate.products = []
            const process = await cartToUpdate.save();
      }
    } catch (error) {
      console.log(error);
    }
  };

  async load() {
    try {
      this.cart = await cartsModel.find().lean();
    } catch (error) {
      this.cart = [];
    }
  }
}

export default CartManager;
