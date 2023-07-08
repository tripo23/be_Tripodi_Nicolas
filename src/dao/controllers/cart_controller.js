//import {factoryCart} from '../services/factory.js';

import { CartManager } from '../services/cartManager.dbclass.js';

//const cart = new factoryCart();
const cart = new CartManager();

export const carts = async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    if (selectedCart == "err") {
        res.status(404).json({ error: "No existe cart con ese ID" });
    } else {
        res.status(200).send(selectedCart)
    }
};

export const AddNewCart = async (req,res) => {
    const cartID = await cart.newCart();
    const message = `Carrito enviado con id  ${cartID}`;
    res.status(200).json({message, cartID});
};

export const AddProductToCart = async (req,res) => {
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
};

export const updateCart = async (req,res) => {
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
};

export const addArrayToCart = async (req,res) => {
    const cid = req.params.cid;
    const data = req.body;
    console.log(req.body);
    const cartUpdate = await cart.addArrayToCart(data, cid);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Carrito actualizado'});
    }
};


export const deleteProductFromCart = async (req,res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const data = {cid, pid}

    const cartUpdate = await cart.deleteProductFromCart(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart o prod con ese ID'});
    } else {
        res.status(200).json({message: 'Producto eliminado'});
    }
};

export const deleteAllProducts = async (req,res) => {
    const cid = req.params.cid;
    const data = {cid}

    const cartUpdate = await cart.deleteAllProducts(data);
    
    if (cartUpdate == 'err') {
        res.status(404).json({error: 'No existe cart con ese ID'});
    } else {
        res.status(200).json({message: 'Productos eliminados'});
    }
};