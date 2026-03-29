import dotenv from "dotenv";
dotenv.config({
    path: './.env'
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

