import { Router } from "express";
import ProductManager from '../dao/productManager.dbclass.js';

const producto = new ProductManager();
const router = Router();


router.get('/api/realtimeproducts', async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('realtimeproducts', { productos: prodRender });
});

router.get('/api/products', auth, async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('products', { products: prodRender, user: req.session.user });
});

router.get('/api/chat', async (req, res) => {
    await producto.load();
    const prodRender = producto.products;
    res.render('chat', { productos: prodRender });
});


router.post('/api/realtimeproducts', async (req, res) => {
  await producto.load();
  let prodRender = producto.products;
  let errorDelete = false;

  if (req.query.method == "DELETE") {
    const prodToDelete = await producto.getProductById(Number(req.body.id));

    if (prodToDelete.status != "Producto no existe") {
      const deleteProduct = await producto.deleteProduct(Number(req.body.id));
      prodRender = prodRender.filter((item) => item.id != Number(req.body.id));
      res.render("realTimeProducts", { productos: prodRender, errorDelete });
    } else {
        errorDelete = true;
        const errorMessage = `Product with ID ${Number(req.body.id)} doesn't exist`;
        res.render("realTimeProducts", {
            productos: prodRender,
            errorDelete,
            errorMessage,
        });
    }
  } else {
        const prods = await producto.addProduct(req.body);
        prodRender.push(prods);
        res.render("realtimeproducts", { productos: prodRender });
  }
});


// /products?limit=1
router.get('/api/products', async (req, res) => {
    await producto.load();
    if (req.query.limit) {
        const limit = req.query.limit;
        const shortArray = producto.products.slice(0, limit);
        res.status(200).send(shortArray);

    } else {
        res.status(200).send(producto.products);
    }
});

// /products/3
router.get('/api/products/:pid/', async (req, res) => {
    const selectedProduct = await producto.getProductById(req.params.pid);
    res.send(selectedProduct);
});

router.put('/api/products/:pid/', async (req, res) => {
    const data = req.body;
        await producto.updateProduct(req.params.pid, data)
        res.status(200).json({message: 'Producto actualizado'});
});

router.delete('/api/products/:pid/', async (req, res) => {
        await producto.deleteProduct(req.params.pid);
        res.status(200).json({message: 'Producto eliminado'});
});


router.post('/api/products', async (req, res) => {
    const handled = await producto.handlePostRequest(req,res);
    const data = req.body;
    if (handled[0] == false) {
        res.status(400).json({ error: handled[1].details[0].message}) 
    } else {
            producto.addProduct(data)
            res.status(200).json({message: 'Producto enviado'});
        } 
    }
);

function auth(req, res, next) {
    console.log(req.session.user);
    if (req.session?.user) {
        return next();
    }
    res.render('login', {
        sessionInfo: req.sessionStore
    });
}

export default router;