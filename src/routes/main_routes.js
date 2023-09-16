import { Router } from "express";
import {ProductManager} from '../dao/services/productManager.dbclass.js';
import { auth } from '../utils.js';
import config from "../config/config.js";

const producto = new ProductManager();
const router = Router();
const baseURL = `${config.serverURL}/`;


router.get('/', auth, async (req, res) => {

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
    const prodRender = producto.products;
    //res.status(200).render('home', { productos: prodRender }); 
    res.status(200).send(object);
});

router.get('/loggerTest', async (req, res) => {
    req.logger.warn(`Alerta! - ${new Date().toLocaleTimeString()}`);
    req.logger.info(`Info! - ${new Date().toLocaleTimeString()}`);
    req.logger.error(`Error! - ${new Date().toLocaleTimeString()}`);
    res.send({message: 'alerta'});
})


export default router;