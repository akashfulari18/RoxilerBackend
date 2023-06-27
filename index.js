const express = require('express') 
const cors  = require("cors")
const connection = require('./db')
const productRoute = require('./routes/product.routes')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())
app.use("/product",productRoute)

app.listen(process.env.port,async()=>{
    
try {
    await connection 
    console.log("Connected")

    
} catch (error) {
    console.log("not connected")
}
    console.log(`Server is running at ${process.env.port} `)
})