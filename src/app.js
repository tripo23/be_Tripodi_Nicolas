import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import express from "express";
import mongoose from 'mongoose';
import session from 'express-session';
import mongoStore from 'connect-mongo'

import passport from 'passport';
import initializePassport from './config/passport.config.js';

import exphbs from 'express-handlebars';
import { __dirname } from './utils.js';

import routerProd from './routes/products_routes.js';
import routerCart from './routes/carts_routes.js';
import mainRoutes from './routes/main_routes.js';
import userRoutes from './routes/user_routes.js'
import viewRoutes from './routes/view_routes.js'
import sessionRoutes from './routes/session_routes.js'
import messageModel from './dao/models/messages.model.js';

dotenv.config({path: path.join(__dirname, '..', '.env')});

const port = parseInt(process.env.port) || 3030;
const ws_port = parseInt(process.env.ws_port) || 8080;
const mongoose_url = process.env.mongoose_url;
const secret_session = process.env.secret_session;



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



// Inicialización del servidor
try {
  await mongoose.connect(mongoose_url);

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
server.use('/', mainRoutes);
server.use('/', userRoutes);
server.use('/', sessionRoutes);
server.use('/', viewRoutes)

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




