import { Router } from "express";
import {ProductManager} from '../dao/services/productManager.dbclass.js';
import { addProduct, chat, deleteProduct, getProducts, productByPID, realTimeProducts, realTimeProductsPost, updateProduct, fakeProduct, productManager, addProductFromView } from "../dao/controllers/product_controller.js";
import { auth, userOnly, adminOnly, adminOrPremiumOnly } from '../utils.js';
import { addLogger } from "../dao/services/logger.service.js";

const producto = new ProductManager();
const router = Router();


router.get('/products', addLogger, getProducts);
router.get('/realtimeproducts', realTimeProducts);
router.get('/productmanager', adminOrPremiumOnly, productManager);
router.post('/newproduct', addProductFromView);
router.get('/chat', userOnly, chat);
router.get('/mockingproducts', fakeProduct);
router.post('/realtimeproducts', realTimeProductsPost);
router.get('/products/:pid/', productByPID);
router.put('/products/:pid/', adminOrPremiumOnly, updateProduct);
router.post('/products', addProduct);
router.post('/products/:pid/', adminOrPremiumOnly, deleteProduct);



export default router;