import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

app.use("/api/v1/auth" , authRouter)
app.use("/api/v1/shop" , shopRouter)
app.use("/api/v1/item" , itemRouter)
app.use("/api/v1/order" , orderRouter)




export {app}
