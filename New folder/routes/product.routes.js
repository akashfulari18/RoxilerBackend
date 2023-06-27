const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const ProductModel = require('../model/product.model')

const productRoute= express.Router()

productRoute.get('/',async(req,res)=>{
let {month} = req.query
    const { search, page = 1, per_page = 10 } = req.query;
let sr="Men"
    if(month<10){
        month=`0${month}`
    }

    const query = {
      dateOfSale: { $regex: `.*-${month}-.*` }, // Matches any year-month combination
    
    
    };
    // if (search) {
    //     query.$or = [
    //       { title: { $regex: search, $options: 'i' } }, // Case-insensitive search on product title
    //       { description: { $regex: search, $options: 'i' } }, // Case-insensitive search on product description
    //     //   { 'price': { $regex: search, $options: 'i' } } // Case-insensitive search on product price
    //     ];
    //   }
  

    console.log(month)
    try {

        const result = await ProductModel.find(query).toArray()
       

        res.status(200).send({ data: result })
    } catch (err) {
        res.status(400).send({ err: err.message })
    }

})

module.exports=productRoute