import fs from 'fs';
import Joi from 'joi';

class ProductManager {
    static notFound = 'Producto no existe';

    constructor(path) {
        this.path = path;
        this.products = [];
        this.schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            code: Joi.string().required(),
            stock: Joi.number().required(),
            status: Joi.boolean().required(),
            thumbnails: Joi.array().optional(),
            category: Joi.string().required()
        });
    }

    handlePostRequest(req, res) {
        try {
          const { error, value } = this.schema.validate(req.body);
          if (error) {
            const err = [false, error]
            return err;
          } 
          return value;

        } catch (error) {
          // Handle any other errors that may occur during validation or object addition
          console.error(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }

    addProduct = async (objProduct) => {
        const generatedID = await this.idGenerator();
        try {
            await this.load();
            if (this.products.find((item) => item.code === objProduct.code)) {
                console.log('Producto existente, por favor intente nuevamente.');
            } else {
                const newProduct = {
                    id: generatedID,
                    title: objProduct.title,
                    description: objProduct.description,
                    price: objProduct.price,
                    status: objProduct.status || true,
                    thumbnail: objProduct.thumbnail,
                    code: objProduct.code,
                    stock: objProduct.stock,
                    category: objProduct.category
                    };
    
                this.products.push(newProduct);
                await this.save();
                console.log('Producto agregado.');
                return newProduct;
            }       
        } catch(err) {
            console.log(err);
        }
    }

    getProducts = async () => {
        try {
            await this.load();
            if (this.products.length == 0) {
                console.log('No hay productos.');
            } else {
                console.log(this.products);
            }
        } catch (err) {
            console.log(err);
        }
    }

    getProductById = async (id) => {
        try {
            await this.load();
            const found = this.products.find(product => product.id === parseInt(id));
            return found ? found : ProductManager.notFound;
        } catch (err) {
            console.log(err);
        }
    }

    updateProduct = async (id, data) => {      
        try {
            await this.load();
            const productToUpdate = await this.getProductById(id);
            const props = Object.keys(data);
            props.forEach(prop => {
                if (productToUpdate.hasOwnProperty(prop)) {
                    productToUpdate[prop] = data[prop];
                }
            })
           
            await this.save();
            console.log('Producto actualizado.');
        } catch (error) {
            console.log(error);
        }
    }

    deleteProduct = async (id) => {
        try {
            await this.load();
            this.products = this.products.filter((product) => parseInt(product.id) !== parseInt(id));
            console.log('Producto eliminado.');
            await this.save();
        } catch (err) {
            console.log(err);
        }
    }

    async load() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            this.products=[];
        }
    }

    async save() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products));
        } catch (error) {
            console.log(error);
        }
    }

    idGenerator = async () => {
        try {
            let newID;
            await this.load();
            if (this.products.length > 0) {
                const length = this.products.length;
                const lastID = this.products[length-1].id;
                newID = parseInt(lastID+1);
            } else {
                newID = 1;
            }
            return newID;
        } catch (err){
            console.log(err);
        }
    }
}

export default ProductManager;