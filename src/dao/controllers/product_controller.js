import { ProductManager } from '../services/productManager.dbclass.js';
import { newFakeProduct } from '../../utils.js';
import { userInfo } from './user_controller.js';
import { sendProductDeletionAlertEmail } from '../../utils.js';

const producto = new ProductManager();

export const getProducts = async (req, res) => {
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
    res.render('realtimeproducts', { productos: prodRender, email: req.session.user });
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
    const currentProduct = await producto.getProductById(req.params.pid);
    const productOwnerEmail = currentProduct.owner;
    const owner = await userInfo(productOwnerEmail);

    
    //A pedido de la consigna no permito borrar un producto que no esté creado por el mismo usuario.
    if (owner.email === req.session.user) {
        if (owner.role === 'premium') {
            sendProductDeletionAlertEmail(owner.email, currentProduct);
        }
        await producto.deleteProduct(req.params.pid);
        req.logger.info(`products deleted - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Producto eliminado' });

    } else {
        if (req.session.role === "admin") {
            if (owner.role === 'premium') {
                sendProductDeletionAlertEmail(owner.email, currentProduct);
            }

            await producto.deleteProduct(req.params.pid);
            req.logger.info(`products deleted - ${new Date().toLocaleTimeString()}`);
            res.status(200).json({ message: 'Producto eliminado' });
        } else {
            res.status(401).json({ error: 'Usuario no autorizado' });
        }
    }
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

export const addProductFromView = async (req, res) => {
    const data = req.body;
    console.log(data);
    producto.addProduct(data);
    req.logger.info(`product added - ${new Date().toLocaleTimeString()}`);
    //res.status(200).json({ message: 'Producto enviado' });
    res.render('productmanager', { email: req.session.user, message: 'added' });
}

export const productManager = async (req, res) => {
    res.render('productmanager', { email: req.session.user });
}

export const fakeProduct = async (req, res) => {
    const fakeProducts = [];
    for (let i = 0; i < 100; i++) { fakeProducts.push(newFakeProduct()) }
    res.send({ status: 'OK', payload: fakeProducts });
}