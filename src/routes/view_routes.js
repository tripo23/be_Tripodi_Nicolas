import { Router } from "express";
import CartManager from '../dao/cartManager.dbclass.js';
import ProductManager from '../dao/productManager.dbclass.js';

const producto = new ProductManager();
const cart = new CartManager('./carrito.json');
const router = Router();

const baseURL = 'http://localhost:3030/'

router.get('/products', auth, async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('products', { products: prodRender, user: req.session.user, role: req.session.role });
});

router.get("/carts/:cid", async (req, res) => {
    const selectedCart = await cart.getCartByID(req.params.cid);
    if (selectedCart == "err") {
        res.status(404).json({ error: "No existe cart con ese ID" });
    } else {
        let cartRender = selectedCart;
        let total = 0;
        const cartID = req.params.cid;
        

        cartRender.products.forEach((prod) => {
            prod.subtotal = prod.quantity * prod.product.price;
            total += prod.subtotal;
        });

        res.status(200).render("cart", {
            products: cartRender.products,
            total: total,
            cartID: cartID
        });
    }
});

function auth(req, res, next) {
    if (req.session?.user) {
        return next();
    }
    res.render('login', {
        sessionInfo: req.sessionStore
    });
}


export default router;