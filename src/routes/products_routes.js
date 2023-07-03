import { Router } from "express";
import ProductManager from '../dao/services/productManager.dbclass.js';
import { addProduct, chat, deleteProduct, getProducts, productByPID, realTimeProducts, realTimeProductsPost, updateProduct } from "../dao/controllers/product_controller.js";

const producto = new ProductManager();
const router = Router();


router.get('/products', getProducts);
router.get('/realtimeproducts',realTimeProducts);
router.get('/chat', chat);
router.post('/realtimeproducts', realTimeProductsPost);
router.get('/products/:pid/', productByPID);
router.put('/products/:pid/', updateProduct);
router.delete('/products/:pid/', deleteProduct);
router.post('/products', addProduct);


export default router;