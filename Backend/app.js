import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http'
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);

const io = new Server(server , {
    cors: {
    origin: "https://biterushfrontend.onrender.com",
    credentials: true,
    methods: ["POST" , "GET" , "PUT"]
}
})

app.set("io" , io);

app.use(cors({
    origin: "https://biterushfrontend.onrender.com",
    credentials: true
}));
app.use(express.json({limit: '16mb'}));
app.use(express.urlencoded({extended: true , limit: "16mb"}));
app.use(cookieParser());

//Importing Routes
import authRouter from './src/routes/auth.routes.js'; 
import shopRouter from './src/routes/shop.routes.js';
import itemRouter from './src/routes/item.routes.js';
import orderRouter from './src/routes/order.routes.js'
import { socketHandler } from './socket.js';

app.use("/api/v1/auth" , authRouter)
app.use("/api/v1/shop" , shopRouter)
app.use("/api/v1/item" , itemRouter)
app.use("/api/v1/order" , orderRouter)

socketHandler(io);


export {app , server}
