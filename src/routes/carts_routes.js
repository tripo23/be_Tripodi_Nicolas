import { Router } from "express";
import {CartManager} from '../dao/services/cartManager.dbclass.js';
import { AddNewCart, AddProductToCart, addArrayToCart, carts, deleteAllProducts, deleteProductFromCart, purchase, updateCart } from "../dao/controllers/cart_controller.js";
import { userOnly } from '../utils.js';
const cart = new CartManager('./carrito.json');
const router = Router();


router.post('/carts', AddNewCart);
router.get('/carts/:cid', carts);
router.put('/carts/:cid', addArrayToCart);
router.delete('/carts/:cid', deleteAllProducts);
router.get('/carts/:cid/purchase', purchase)
//router.post('/carts/:cid/product/:pid', userOnly, AddProductToCart);
router.post('/carts/:cid/product/:pid', AddProductToCart);
router.put('/carts/:cid/product/:pid', updateCart);
router.delete('/carts/:cid/product/:pid', deleteProductFromCart);

export default router;