import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import { __dirname } from '../../utils.js';

const filePath = path.join(__dirname, '../src/productos.json');

let products = []

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        products = JSON.parse(data);
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});

console.log(products);

class ProductManager {
    static notFound = 'Producto no existe';

    constructor(path) {
        this.path = path;
        this.products = products;
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
        try {
            if (this.products.find((item) => item.code === objProduct.code)) {
                console.log('Producto existente, por favor intente nuevamente.');
            } else {
                const newProduct = {
                    title: objProduct.title,
                    description: objProduct.description,
                    price: objProduct.price,
                    status: objProduct.status || true,
                    thumbnail: objProduct.thumbnail,
                    code: objProduct.code,
                    stock: objProduct.stock,
                    category: objProduct.category
                };

                const process = this.products.push(newProduct);
                console.log('Producto agregado.');
                return newProduct;
            }
        } catch (err) {
            console.log(err);
        }
    }

    getProducts = async (options, query) => {

        const process = this.products.slice(options.limit * (options.page - 1), options.limit * options);
        return process
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
}

export { ProductManager as memProduct, ProductManager };