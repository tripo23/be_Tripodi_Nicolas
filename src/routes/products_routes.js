const express = require('express');
const router = express.Router();
const ProductManager = require('../ProductManager');
const producto = new ProductManager('./archivo.json');



// /products?limit=1
router.get('/products', async (req, res) => {
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
router.get('/products/:pid/', async (req, res) => {
    const selectedProduct = await producto.getProductById(req.params.pid);
    res.send(selectedProduct);
});

router.put('/products/:pid/', async (req, res) => {
    const data = req.body;
        await producto.updateProduct(req.params.pid, data)
        res.status(200).json({message: 'Producto actualizado'});
});

router.delete('/products/:pid/', async (req, res) => {
        await producto.deleteProduct(req.params.pid);
        res.status(200).json({message: 'Producto eliminado'});
});


router.post('/products', (req, res) => {
    const handled = producto.handlePostRequest(req,res);
    const data = req.body;
    if (handled[0] == false) {
        res.status(400).json({ error: handled[1].details[0].message}) 
    } else {
            producto.addProduct(data)
            res.status(200).json({message: 'Producto enviado'});
        } 
    }
);


module.exports = router;