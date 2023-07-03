import { Router } from "express";
import CartManager from '../dao/services/cartManager.dbclass.js';
import { AddNewCart, AddProductToCart, addArrayToCart, carts, deleteAllProducts, deleteProductFromCart, updateCart } from "../dao/controllers/cart_controller.js";

const cart = new CartManager('./carrito.json');
const router = Router();


router.get('/carts/:cid', carts);
router.post('/carts', AddNewCart);
router.post('/carts/:cid/product/:pid', AddProductToCart);
router.put('/carts/:cid/product/:pid', updateCart);
router.put('/carts/:cid', addArrayToCart);
router.delete('/carts/:cid/product/:pid', deleteProductFromCart);
router.delete('/carts/:cid', deleteAllProducts);

export default router;