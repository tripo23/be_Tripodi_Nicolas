import config from './config/config.js';
import { Server } from 'socket.io';
import express from "express";
import session from 'express-session';
import mongoStore from 'connect-mongo'

import passport from 'passport';
import initializePassport from './config/passport.config.js';
import MongoSingleton from './dao/services/mongo_class.js';

import CustomError from './dao/services/customError.js';
import { __dirname, errorsDict } from './utils.js';
import { addLogger } from './dao/services/logger.service.js';

import exphbs from 'express-handlebars';

import routerProd from './routes/products_routes.js';
import routerCart from './routes/carts_routes.js';
import mainRoutes from './routes/main_routes.js';
import userRoutes from './routes/user_routes.js'
import viewRoutes from './routes/view_routes.js'
import ticketRoutes from './routes/tickets_routes.js'
import sessionRoutes from './routes/session_routes.js'
import messageModel from './dao/models/messages.model.js';


const port = parseInt(config.port) || 3030;
const ws_port = parseInt(config.ws_port) || 8080;
const mongoose_url = config.mongoose_url;
const secret_session = config.secret_session;



let prods = [];


// Servidor express base
const server = express();
const httpServer = server.listen(ws_port, () => {
    console.log(`Servidor Socket.io iniciado en puerto ${ws_port}`);
});

const wss = new Server(httpServer, {
    cors: {
        origin: `http://localhost:${port}`,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: 'Content-Type, Authorization',
    }
});

server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(addLogger);


// Inicialización del servidor
try {
  MongoSingleton.getInstance();
  server.listen(port, () => {
    console.log(`Servidor base API / static iniciado en puerto ${port}`);
  });  
} catch (error) {
    console.log('No se puede conectar con el servidor de bbdd');
}


// Helper for handlebars
const hbs = exphbs.create({
  helpers: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

// Engine setup
server.engine('handlebars', hbs.engine);
server.set('views', new URL('./views', import.meta.url).pathname);
server.set('view engine', 'handlebars');

// Manejo de sesiones
server.use(session({
  store: mongoStore.create({
    mongoUrl: mongoose_url,
    mongoOptions: {useNewUrlParser:true, useUnifiedTopology:true},
    ttl: 100
  }),
  secret: secret_session,
  resave: true,
  saveUninitialized: true
}));
initializePassport();
server.use(passport.initialize());
server.use(passport.session());



// Endpoints API REST
server.use('/api', routerProd);
server.use('/api', routerCart);
server.use('/', ticketRoutes);
server.use('/', mainRoutes);
server.use('/', userRoutes);
server.use('/', sessionRoutes);
server.use('/', viewRoutes)

//Captura de errores en rutas

server.all('*', (req, res) => {
  throw new CustomError(errorsDict.ROUTING_ERROR);
})

server.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({ status: 'ERR', payload: { msg: err.message } });
})


// Contenidos estáticos
server.use('/static', express.static(__dirname + '/public'))



// Eventos socket.io
wss.on('connection', (socket) => {
  console.log(`Cliente conectado (${socket.id})`);

  socket.on('addProduct', () => {    
    io.sockets.emit('productos', prods);
  });

  socket.on('message', (msg) => {
    socket.emit('new_msg', msg);
    const process = messageModel.create(msg);
  });

  socket.on('newChatClient', async () => {
    const historyMsg = await messageModel.find();
    socket.emit('historyMsg', historyMsg )
  })
})

