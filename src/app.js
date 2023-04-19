const express = require('express');
const routerProd = require('./routes/products_routes');
const routerCart = require('./routes/carts_routes');
const server = express();
const port = 8080;


server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use('/api', routerProd);
server.use('/api', routerCart);
// server.use('/static', express.static(__dirname + '/public'))

server.listen(port, () => {
    console.log(`Servidor iniciado en puerto ${port}`);
});