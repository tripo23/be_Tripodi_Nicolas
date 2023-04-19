const express = require('express');
const router = express.Router();
const CartManager = require('../CartManager');
const cart = new CartManager('./carrito.json');

router.post('/carts', (req,res) => {
    const data = req.body;
    cart.newCart(data);
    res.status(200).json({message: 'Carrito enviado'});
});

router.get('/carts/:cid', async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    res.send(selectedCart);
})

router.post('/carts/:cid/product/:pid', (req,res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = 1; // harcodeado a pedido de la consigna.
    const data = {cid, pid, quantity}
    cart.addProductToCart(data);
    res.status(200).json({message: 'Carrito actualizado'});
});

module.exports = router;