import mongoose from 'mongoose';
import productsModel from '../models/products.model.js'
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
            status: Joi.boolean().optional().default(true),
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
            await this.load();
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
                    category: objProduct.category,
                    owner: objProduct.owner
                };

                const process = await productsModel.create(newProduct);
                console.log('Producto agregado.');
                return newProduct;
            }
        } catch (err) {
            console.log(err);
        }
    }

    getProducts = async (options, query) => {


        let queryObject = {};
        const field = query.field;
        let value = query.value;

        if (field === "stock") {
            queryObject = {
                stock: { $gt: query.value }
            }
        } else {
            queryObject[field] = value;
        }

        const process = await productsModel.paginate(queryObject, options);

        this.products = process.docs.map(doc => doc.toObject({ getters: false }));
        return process
    }

    getProductById = async (id) => {
        try {
            const found = await productsModel.findById(id);
            return found ? found : ProductManager.notFound;
        } catch (err) {
            console.log(err);
        }
    }

    updateProduct = async (id, data) => {

        try {
            // Con mongoose.Types.ObjectId realizamos el casting para que el motor reciba el id en el formato correcto
            const process = await productsModel.updateOne({ '_id': new mongoose.Types.ObjectId(id) }, data);
        } catch (error) {
            console.log(error);
        }
    }

    deleteProduct = async (id) => {
        try {
            await this.load();
            const process = await productsModel.deleteOne({ '_id': new mongoose.Types.ObjectId(id) });
            console.log('Producto eliminado.');
        } catch (err) {
            console.log(err);
        }
    }

    checkStock = async (data) => {
        await this.load();
        const current = await this.getProductById(data.pid);
        if (current.stock >= parseInt(data.quantity)) {
            return true;
        } else {
            return false;
        }
    };

    getStock = async (data) => {
        await this.load();
        const current = await this.getProductById(data.pid);
        return current ? current.stock : 0;
    }

    decreaseStock = async (data) => {
        for (const item of data) {
            try {
                const current = await this.getProductById(item.pid);
                const newStock = parseInt(current.stock) - parseInt(item.quantity);
                const process = await productsModel.updateOne({ '_id': new mongoose.Types.ObjectId(item.pid) }, { $set: { stock: newStock } });
            } catch (error) {
                console.log(error);
            }
        }
    }

    checkPrice = async (pid) => {
        await this.load();
        const current = await this.getProductById(pid);
        return current.price
    }

    async load() {
        try {
            this.products = await productsModel.find().lean();
        } catch (error) {
            this.products = [];
        }
    }
}

export { ProductManager as mongoProduct, ProductManager };