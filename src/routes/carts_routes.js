const express = require('express');
const router = express.Router();
const CartManager = require('../CartManager');
const cart = new CartManager('./carrito.json');

router.post('/carts', async (req,res) => {
    await cart.newCart();
    res.status(200).json({message: 'Carrito enviado'});
});

router.get('/carts/:cid', async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    if (selectedCart == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).send(selectedCart);
    }
})

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

module.exports = router;