//import {factoryCart} from '../services/factory.js';
import { TicketManager } from '../services/ticketManager.dbclass.js';
import { CartManager } from '../services/cartManager.dbclass.js';
import { ProductManager } from '../services/productManager.dbclass.js';
import { transport } from '../../config/nodemailer.config.js'


const producto = new ProductManager();
const cart = new CartManager();
const ticket = new TicketManager();

export const carts = async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    if (selectedCart == "err") {
        res.status(404).json({ error: "No existe cart con ese ID" });
    } else {
        res.status(200).send(selectedCart)
    }
};

export const purchase = async (req, res) => {
    const cid = req.params.cid;
    const selectedCart = await cart.getCartByID(cid);
    if (selectedCart == "err") {
        res.status(404).json({ error: "No existe cart con ese ID" });
    } else {
        const currentProducts = selectedCart.products;

        // Me quedo con los productos del carrito y la cantidad de cada uno
        const extractedData = currentProducts.map((item) => {
            const { product, quantity } = item;
            return {
                pid: product._id.toString(),
                quantity,
            };
        });

        //Traigo los productos con stock.
        const hasStock = await extractedData.reduce(async (result, item) => {
            const hasSufficientStock = await producto.checkStock({ pid: item.pid, quantity: item.quantity });
            if (hasSufficientStock) {
                const previousResult = await result;
                return [...previousResult, item];
            }
            return result;
        }, Promise.resolve([]));

        if (hasStock.length === 0) {
            console.log('No hay stock suficiente');
            res.status(404).json({ error: "No hay stock suficiente para ninguno de los productos seleccionados" });
            return;
        }

        //Hago lo propio para los que no tienen stock suficiente.
        const itemsWithoutStock = await (async () => {
            return extractedData.reduce(async (accumulatorPromise, item) => {
                const accumulator = await accumulatorPromise;
                const hasStock = await producto.checkStock(item);
                if (!hasStock) {
                    accumulator.push(item);
                }
                return accumulator;
            }, []);
        })();

        // Resto el stock de los productos agregados.
        await producto.decreaseStock(hasStock);

        // Vacío el carrito 
        await cart.deleteAllProducts({cid});
        
        //Cargo los productos sin stock al carrito
        for (const item of itemsWithoutStock) {
            const data = {
                cid: cid, 
                pid: item.pid,
                quantity: item.quantity
            }
            await cart.addProductToCart(data);
        }

        // Calculo el total del carrito
        let total = 0;
        for (const item of hasStock) {
            const unitPrice = await producto.checkPrice(item.pid)
            const pricePerProduct = parseInt(unitPrice) * parseInt(item.quantity);
            total += pricePerProduct
        }

        // Mando a crear el ticket
        const ticketData = {
            amount: total,
        }
        const tid = await ticket.newTicket(ticketData);

        //Agrego los productos al ticket
        for (const item of hasStock) {
            await ticket.addProducts(tid, item);
        }

        //Me guardo en una variable el ticket completo
        const ticketComplete = await ticket.getTicketById(tid);
        // console.log('ticket id', tid);
        // console.log(ticketComplete.products);

        await sendTicketByMail(req, res, ticketComplete);

        res.status(200).send(ticketComplete)
    }
}

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

export const sendTicketByMail = async (req, res, data) => {
    const ticketProducts = data.products;
    const productListHTML = ticketProducts.map(prod => `
        <li>
            <strong>${prod.product.title}</strong>
            <br>
            Quantity: ${prod.quantity}
            <br>
            Price: $${prod.product.price}
        </li>
    `).join('');
    const result = await transport.sendMail({
        from: 'tripodi.nicolas@gmail.com',
        // to: req.session.user.email,
        to: 'tripodi.nicolas@gmail.com',
        subject: 'Your Purchase Receipt',
        html: `
        <h2>Thank you for your purchase!</h2>
        <p>Here are the details of your purchase:</p>
        <ul>
            ${productListHTML}
        </ul>
        <h3>
        Total: $${data.amount}
        </h3>
    `
    });
}
