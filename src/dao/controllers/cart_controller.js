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
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
        res.status(404).json({ error: "No existe cart con ese ID" });
    } else {
        res.status(200).send(selectedCart)
    }
};

export const purchase = async (req, res) => {
    const cid = req.params.cid;
    const selectedCart = await cart.getCartByID(cid);
    if (selectedCart == "err") {
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
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
        console.log('extracted data: ', extractedData);

        // reviso si hay stock disponible
        const itemsToPurchase = []
        const itemsWithoutStock= []
        for (const item of extractedData) {

            const stock = await producto.getStock(item);
            console.log('stock: ', stock);
            if (stock >= item.quantity) {
                itemsToPurchase.push(item);
            } else {
                if (stock == 0) {
                    itemsWithoutStock.push(item);
                } else {
                    const partialStockToPurchase = {pid: item.pid, quantity: stock}
                    const pendingStockToBuy = item.quantity - stock
                    const partialStockToCart = {pid: item.pid, quantity: pendingStockToBuy }

                    itemsToPurchase.push(partialStockToPurchase);
                    itemsWithoutStock.push(partialStockToCart);
                }
            }
        }

        if (itemsToPurchase.length === 0) {
            req.logger.error(`no products with stock - ${new Date().toLocaleTimeString()}`);
            res.status(404).json({ error: "No hay stock suficiente para ninguno de los productos seleccionados" });
            return;
        }

        console.log('itemsToPurchase: ', itemsToPurchase);
        console.log('itemsWithoutStock: ', itemsWithoutStock);
        

        // Resto el stock de los productos agregados.
        await producto.decreaseStock(itemsToPurchase);
        req.logger.info(`stock consumed - ${new Date().toLocaleTimeString()}`);

        // Vacío el carrito 
        await cart.deleteAllProducts({ cid });

        //Cargo los productos sin stock al carrito
        for (const item of itemsWithoutStock) {
            const data = {
                cid: cid,
                pid: item.pid,
                quantity: item.quantity
            }
            await cart.addProductToCart(data);
            req.logger.info(`no stock products added to cart - ${new Date().toLocaleTimeString()}`);
        }

        // Calculo el total del carrito
        let total = 0;
        for (const item of itemsToPurchase) {
            const unitPrice = await producto.checkPrice(item.pid)
            const pricePerProduct = parseInt(unitPrice) * parseInt(item.quantity);
            total += pricePerProduct
        }

        // Mando a crear el ticket
        const ticketData = {
            purchaser: req.session.user,
            amount: total,
        }
        const tid = await ticket.newTicket(ticketData);
        req.logger.info(`ticket created - ${new Date().toLocaleTimeString()}`);

        //Agrego los productos al ticket
        for (const item of itemsToPurchase) {
            await ticket.addProducts(tid, item);
        }

        //Me guardo en una variable el ticket completo
        const ticketComplete = await ticket.getTicketById(tid);
        // console.log('ticket id', tid);
        // console.log(ticketComplete.products);

        await sendTicketByMail(req, res, ticketComplete);
        req.logger.info(`ticket sent by mail - ${new Date().toLocaleTimeString()}`);

        //res.status(200).send(ticketComplete)

        res.render('purchaseConfirmed', { ticketComplete, itemsWithoutStock });
    }
}

export const AddNewCart = async (req, res) => {
    const cartID = await cart.newCart();
    const message = `Carrito enviado con id  ${cartID}`;
    if (res) {
        req.logger.info(`cart created - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message, cartID });
    }
    return cartID;
};

export const AddProductToCart = async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = 1; // harcodeado a pedido de la consigna.
    const data = { cid, pid, quantity }

    // veo si este producto le pertenece al usuario premium
    const currentProduct = await producto.getProductById(pid);
    // console.log('owner', currentProduct.owner);
    // console.log('user', req.session.user);
    // if (currentProduct.owner === req.session.user) {
    //     console.log('unauthorized');
    //     res.status(401).json({ error: 'Usuario no autorizado' });
    // } else {
        const cartUpdate = await cart.addProductToCart(data);

        if (cartUpdate == 'err') {
            req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
            res.status(404).json({ error: 'No existe cart con ese ID' });
        } else {
            req.logger.info(`product added to cart - ${new Date().toLocaleTimeString()}`);
            res.status(200).json({ message: 'Carrito actualizado' });
        }
    // }

};

export const updateCart = async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    const data = { cid, pid, quantity }

    const cartUpdate = await cart.updateQuantity(data);

    if (cartUpdate == 'err') {
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
        res.status(404).json({ error: 'No existe cart con ese ID' });
    } else {
        req.logger.info(`cart updated - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Carrito actualizado' });
    }
};

export const addArrayToCart = async (req, res) => {
    const cid = req.params.cid;
    const data = req.body;
    const cartUpdate = await cart.addArrayToCart(data, cid);

    if (cartUpdate == 'err') {
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
        res.status(404).json({ error: 'No existe cart con ese ID' });
    } else {
        req.logger.info(`cart updated - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Carrito actualizado' });
    }
};


export const deleteProductFromCart = async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const data = { cid, pid }

    const cartUpdate = await cart.deleteProductFromCart(data);

    if (cartUpdate == 'err') {
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
        res.status(404).json({ error: 'No existe cart o prod con ese ID' });
    } else {
        req.logger.info(`product deleted from cart - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Producto eliminado' });
    }
};

export const deleteAllProducts = async (req, res) => {
    const cid = req.params.cid;
    const data = { cid }

    const cartUpdate = await cart.deleteAllProducts(data);

    if (cartUpdate == 'err') {
        req.logger.error(`cart not found - ${new Date().toLocaleTimeString()}`);
        res.status(404).json({ error: 'No existe cart con ese ID' });
    } else {
        req.logger.info(`all products deleted from cart - ${new Date().toLocaleTimeString()}`);
        res.status(200).json({ message: 'Productos eliminados' });
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
        to: req.session.user,
        //to: 'tripodi.nicolas@gmail.com',
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

export const getTicketById = async (req, res) => {
    const currentTicket = await ticket.getTicketById(req.params.tid);
    res.status(200).send(currentTicket);
}

export const getTickets = async (req, res) => {
    const tickets = await ticket.getTickets();
    !tickets? res.status(404).json({ error: 'No hay tickets' }) : res.status(200).send(tickets);
}