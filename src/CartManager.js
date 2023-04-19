const fs = require('fs');
class CartManager {

    static notFound = "err";
    constructor(path) {
        this.path = path;
        this.cart = [];
    }

    newCart = async (data) => {
        const generatedID = await this.idGenerator();
        const newCart = {
            id: generatedID,
            products: data
        };
        this.cart.push(newCart);
        await this.save();
    }

    getCartByID = async (id) => {
        try {
            await this.load();
            const found = this.cart.find(cart => cart.id === parseInt(id));
            return found ? found : CartManager.notFound;
        } catch (err) {
            console.log(err);
        }
    }

    addProductToCart = async (data) => {
       try {
            const cartToUpdate = await this.getCartByID(data.cid); // que pasa si me trae un id que no es?
            if (cartToUpdate == CartManager.notFound) {
                return 'err'
            } else {
                const productToUpdate = cartToUpdate.products.find(product => product.pid === parseInt(data.pid));
                if (productToUpdate) {
                    productToUpdate.quantity = productToUpdate.quantity + parseInt(data.quantity);
                    console.log(productToUpdate);
                } else {
                    const newProduct = {
                        pid: parseInt(data.pid),
                        quantity: data.quantity
                    }
                    cartToUpdate.products.push(newProduct);
                }
                await this.save();
            }
            
       } catch (error) {
            console.log(error);
       }
    }


    idGenerator = async () => {
        let newID;
        try {
            await this.load();
            if (this.cart.length === 0) {
                newID = 1;
            } else {
                const length = this.cart.length;
                const lastID = this.cart[length-1].id;
                newID = parseInt(lastID+1);
            }
            return newID;    
        }   
         catch (err){
            console.log(`acá hay un error ${err}`);
        }
    }

    async load() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.cart = JSON.parse(data);
        } catch (error) {
            this.cart = [];
        }
    }

    async save() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.cart));
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = CartManager;