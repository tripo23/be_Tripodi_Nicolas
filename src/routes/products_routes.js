import { Router } from "express";
import {ProductManager} from '../dao/services/productManager.dbclass.js';
import { addProduct, chat, deleteProduct, getProducts, productByPID, realTimeProducts, realTimeProductsPost, updateProduct } from "../dao/controllers/product_controller.js";
import { auth, userOnly, adminOnly } from '../utils.js';

const producto = new ProductManager();
const router = Router();


router.get('/products', getProducts);
router.get('/realtimeproducts',realTimeProducts);
router.get('/chat', userOnly, chat);
router.post('/realtimeproducts', realTimeProductsPost);
router.get('/products/:pid/', productByPID);
router.put('/products/:pid/', adminOnly, updateProduct);
router.delete('/products/:pid/', adminOnly, deleteProduct);
router.post('/products', adminOnly, addProduct);


export default router;