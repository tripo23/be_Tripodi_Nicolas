import { Router } from "express";
import {ProductManager} from '../dao/services/productManager.dbclass.js';
import { auth } from '../utils.js';

const producto = new ProductManager();
const router = Router();

const baseURL = 'http://localhost:3030/'


router.get('/', auth, async (req, res) => {
    // http://localhost:3030/?limit=2&page=1&sort=-1&field=category&value=electronics
    // http://localhost:3030/?sort=-1&field=stock&value=10 MIRA SI el stock es >10

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