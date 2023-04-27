import express from "express";
import routerProd from './routes/products_routes.js';
import routerCart from './routes/carts_routes.js';
import exphbs from 'express-handlebars';
import { __dirname } from './utils.js'
import { Server } from 'socket.io';

const port = 3000;
const ws_port = 8080;
let prods = [];


// Servidor express base
const server = express();
const httpServer = server.listen(ws_port, () => {
    console.log(`Servidor Socket.io iniciado en puerto ${ws_port}`);
});

const wss = new Server(httpServer, {
    cors: {
        origin: `http://localhost:${port}`,
        methods: ["GET", "POST"]
    }
});

server.use(express.json());
server.use(express.urlencoded({extended: true}));

// Inicialización del servidor base
server.listen(port, () => {
  console.log(`Servidor base API / static iniciado en puerto ${port}`);
});


// Helper para handlebars
const hbs = exphbs.create({
    helpers: {
      capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }
  });


// Motor de plantillas handlebars
server.engine('handlebars', hbs.engine);
server.set('views', __dirname+'/views');
server.set('view engine', 'handlebars');


// Endpoints API REST
server.use('/', routerProd);
server.use('/api', routerCart);

// Contenidos estáticos
server.use('/static', express.static(__dirname + '/public'))

// Eventos socket.io
wss.on('connection', (socket) => {
  console.log(`Cliente conectado (${socket.id})`);

  // socket.emit('productos', prods);

  socket.on('addProduct', () => {    
    io.sockets.emit('productos', prods);
  });
})



