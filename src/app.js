import express, { urlencoded } from 'express';
import products from "./routes/products.router.js"
import carts from "./routes/carts.router.js"
import viewsRouter from "./routes/views.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import {Server} from "socket.io"
import { createServer } from 'http';
import ProductManager from "./dao/filesystem/manager/ProductManager.js";
import mongoose from 'mongoose'
import Message from './dao/mongo/models/message.js';
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import MongoStore from "connect-mongo";
import session from "express-session";
import sessionsRouter from "./routes/session.router.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";


// Define el helper "eq"

const hbs = handlebars.create({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    ifEquals: function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const app = express();
const connection = await mongoose.connect("mongodb+srv://gustavo2021arias:A12345@pruebacoder.pkazyau.mongodb.net/?retryWrites=true&w=majority")
const httpServer = createServer(app);
const io = new Server(httpServer);
const productManager = new ProductManager();
app.use(
  session({
    store: new MongoStore({
      mongoUrl:
        "mongodb+srv://gustavo2021arias:A12345@pruebacoder.pkazyau.mongodb.net/?retryWrites=true&w=majority",
      ttl: 3600,
    }),
    secret: "CoderS3cretFelis",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(urlencoded({ extended: true }))
//app.use('/api/products',products);
app.use('/api/carts',carts);

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/",viewsRouter)
app.get('/filesystem', (req, res) => {
    const products = productManager.getProducts();
    res.render('home', { products });
  });


  app.get('/chat', async (req, res) => {
    const messages = await Message.find().lean();
    res.render('chat', { messages });
  });

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('message', async (data) => {
    const { user, message } = data;

  if (!user || user.trim() === '') {
    console.log('Error: el campo "user" es requerido');
    return;
  }

    // Guardar el mensaje en la colección "messages" en MongoDB
    const newMessage = new Message({ user, message });
    await newMessage.save();

    // Emitir el evento "messageLogs" a todos los clientes conectados
    const messages = await Message.find().lean();
    io.emit('messageLogs', messages);
  });


  });

  httpServer.listen(8080, () => {
    console.log('Server is running on port 8080');
  });
  


app.use("/api/sessions", sessionsRouter);



export {io};
