import { Router } from "express";
import CartManager from '../dao/cartManager.dbclass.js';

const cart = new CartManager('./carrito.json');
const router = Router();



router.get('/carts/:cid', async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    if (selectedCart == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).send(selectedCart);
    }
});

router.post('/carts', async (req,res) => {
    const cartID = await cart.newCart();
    const message = `Carrito enviado con id  ${cartID}`;
    res.status(200).json({message, cartID});
});

router.post('/carts/:cid/product/:pid', async (req,res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = 1; // harcodeado a pedido de la consigna.
    const data = {cid, pid, quantity}

    const cartUpdate = await cart.addProductToCart(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Carrito actualizado'});
    }
});

router.put('/carts/:cid/product/:pid', async (req,res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    const data = {cid, pid, quantity}

    const cartUpdate = await cart.updateQuantity(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Carrito actualizado'});
    }
});

router.put('/carts/:cid', async (req,res) => {
    const cid = req.params.cid;
    const data = req.body.products;
    const cartUpdate = await cart.addArrayToCart(data, cid);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Carrito actualizado'});
    }
});


router.delete('/carts/:cid/product/:pid', async (req,res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const data = {cid, pid}

    const cartUpdate = await cart.deleteProductFromCart(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart o prod con ese ID'});
    } else {
        res.status(200).json({message: 'Producto eliminado'});
    }
});

router.delete('/carts/:cid', async (req,res) => {
    const cid = req.params.cid;
    const data = {cid}

    const cartUpdate = await cart.deleteAllProducts(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Productos eliminados'});
    }
});

export default router;