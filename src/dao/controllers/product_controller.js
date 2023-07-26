
//import {factoryProduct} from '../services/factory.js';
import { ProductManager } from '../services/productManager.dbclass.js';
import { newFakeProduct } from '../../utils.js';
const producto = new ProductManager();
//const producto = new factoryProduct();


export const getProducts = async (req, res) => {
    // /?limit=2&page=1&sort=-1&field=category&value=electronics
    // /?sort=-1&field=stock&value=10 MIRA SI el stock es >10
    const options = {
        limit: req.query.limit ? req.query.limit : 10,
        sort: req.query.sort ? { precio: req.query.sort } : {},
        page: req.query.page ? req.query.page : 1
    }
    let query = {
        field: req.query.field ? req.query.field : "",
        value: req.query.value ? req.query.value : ""
    }

    if (query.field.length == 0 || query.value.length == 0) {
        query = {};
    }

    const object = await producto.getProducts(options, query);
    req.logger.info(`products getted - ${new Date().toLocaleTimeString()}`);
    res.status(200).send(object);
};

export const realTimeProducts = async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('realtimeproducts', { productos: prodRender });
};


export const chat = async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('chat', { productos: prodRender });
};

export const realTimeProductsPost = async (req, res) => {
    await producto.load();
    let prodRender = producto.products;
    let errorDelete = false;

    if (req.query.method == "DELETE") {
        const prodToDelete = await producto.getProductById(Number(req.body.id));

        if (prodToDelete.status != "Producto no existe") {
            const deleteProduct = await producto.deleteProduct(Number(req.body.id));
            prodRender = prodRender.filter((item) => item.id != Number(req.body.id));
            res.render("realTimeProducts", { productos: prodRender, errorDelete });
        } else {
            errorDelete = true;
            const errorMessage = `Product with ID ${Number(req.body.id)} doesn't exist`;
            res.render("realTimeProducts", {
                productos: prodRender,
                errorDelete,
                errorMessage,
            });
        }
    } else {
        const prods = await producto.addProduct(req.body);
        prodRender.push(prods);
        res.render("realtimeproducts", { productos: prodRender });
    }

}
export const productByPID = async (req, res) => {
    const selectedProduct = await producto.getProductById(req.params.pid);
    res.send(selectedProduct);
}

export const updateProduct = async (req, res) => {
    const data = req.body;
    await producto.updateProduct(req.params.pid, data);
    req.logger.info(`product updated - ${new Date().toLocaleTimeString()}`);
    res.status(200).json({ message: 'Producto actualizado' });
}

export const deleteProduct = async (req, res) => {
    await producto.deleteProduct(req.params.pid);
    req.logger.info(`products deleted - ${new Date().toLocaleTimeString()}`);
    res.status(200).json({ message: 'Producto eliminado' });
}

export const addProduct = async (req, res) => {
    const handled = await producto.handlePostRequest(req, res);
    const data = req.body;
    if (handled[0] == false) {
        req.logger.error(`cannot add product - ${new Date().toLocaleTimeString()}`);
        res.status(400).json({ error: handled[1].details[0].message })

    } else {
        producto.addProduct(data)
        req.logger.info(`product added - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Producto enviado' });
    }
}

export const fakeProduct = async (req, res) => {
    const fakeProducts = [];
    for (let i = 0; i < 100; i++) { fakeProducts.push(newFakeProduct()) }
    res.send({ status: 'OK', payload: fakeProducts });
}