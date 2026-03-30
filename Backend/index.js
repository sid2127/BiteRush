import dotenv from "dotenv";
import 'dotenv/config';

dotenv.config({
    path: 'https://biterush-backend-rxbk.onrender.com'
});

import { app , server } from "./app.js";
import { connectDB } from "./src/db/index.js";


connectDB().
then(()=> {
    server.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening on port ${process.env.PORT}`)
})
})
.catch((error)=> {
    console.log("Erron in Db connection :" , error);
    
})

