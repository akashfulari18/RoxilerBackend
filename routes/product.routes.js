const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const ProductModel = require('../model/product.model')
const { default: axios } = require('axios')


const productRoute = express.Router()

productRoute.get('/', async (req, res) => {
    let { month } = req.query

    const { search, page = 1, per_page = 10 } = req.query;

    if (month < 10) {
        month = `0${month}`
    }

    const query = {
        dateOfSale: { $regex: `.*-${month}-.*` }, 
    };

    if (!isNaN(search)) {
        query.$or = [
            { 'price': parseFloat(search) }
        ];
    } else {
        query.$or = [
            { 'title': { $regex: search, $options: 'i' } }, 
            { 'description': { $regex: search, $options: 'i' } }, 
        ];
    }

    try {
        const skip = (page - 1) * per_page;


        const result = await ProductModel.find(query).find(query)
            .skip(skip)
            .limit(per_page)

        // console.log(result)
        res.status(200).send({ data: result, totalRecords: result?.length })
    } catch (err) {
        res.status(400).send({ err: err.message })
    }

})

productRoute.get("/statastic", async (req, res) => {

    let { month } = req.query

    if (month < 10) {
        month = `0${month}`
    }


    try {

        const resultSold = await ProductModel.aggregate([
            {
                $match: {
                    dateOfSale: {
                        $regex: `.*-${month}-.*`,
                    },
                    sold: true,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
        ])

        const resultNotSold = await ProductModel.aggregate([
            {
                $match: {
                    dateOfSale: {
                        $regex: `.*-${month}-.*`,
                    },
                    sold: false,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
        ])
        res.status(200).send({ totalSaleAmtOfMth: (+resultSold[0].total.toFixed(2)) + (+resultNotSold[0].total.toFixed(2)), totalSoldPerMonth: +resultSold[0].total.toFixed(2), totalNotSoldPerMonth: +resultNotSold[0].total.toFixed(2) })

    } catch (err) {
        res.status(400).send({ err: err.message })

    }
})


productRoute.get("/chart", async (req, res) => {

    let { month } = req.query

    if (month < 10) {
        month = `0${month}`
    }

    const query = {
        dateOfSale: { $regex: `.*-${month}-.*` }, // Matches any year-month combination
    };
    try {

        const result = await ProductModel.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                {
                                    case: { $lte: ['$price', 100] },
                                    then: '0-100'
                                },
                                {
                                    case: { $lte: ['$price', 200] },
                                    then: '101-200'
                                },
                                {
                                    case: { $lte: ['$price', 300] },
                                    then: '201-300'
                                },
                                {
                                    case: { $lte: ['$price', 400] },
                                    then: '301-400'
                                },
                                {
                                    case: { $lte: ['$price', 500] },
                                    then: '401-500'
                                },
                                {
                                    case: { $lte: ['$price', 600] },
                                    then: '501-600'
                                },
                                {
                                    case: { $lte: ['$price', 700] },
                                    then: '601-700'
                                },
                                {
                                    case: { $lte: ['$price', 800] },
                                    then: '701-800'
                                },
                                {
                                    case: { $lte: ['$price', 900] },
                                    then: '801-900'
                                },
                            ],
                            default: '901-above',
                        },
                    },
                    count: { $sum: 1 }
                },
            },
            {
                $sort: { _id: 1 }
            },
        ])

        const chartData = result.reduce((data, { _id, count }) => {
            data[_id] = count
            return data;
        }, {});

        res.status(200).send({ total: chartData })

    } catch (err) {
        res.status(400).send({ err: err.message })

    }
})


productRoute.get('/pie', async (req, res) => {

    let { month } = req.query

    if (month < 10) {
        month = `0${month}`
    }

    const query = {
        dateOfSale: { $regex: `.*-${month}-.*` }, 
    };
    try {

        const result = await ProductModel.aggregate([
          {
            $match: query,
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
        ])

        const chartData = result.reduce((data, { _id, count }) => {
            data[_id] = count;
            return data;
          }, {});
      
        res.status(200).send({ total: chartData })
    } catch (err) {
        res.status(400).send({ err: err.message })

    }


})

productRoute.get("/combinedResponse",async(req,res)=>{
    let { month } = req.query
    
    try {

   

   
let respStat = await axios.get(`http://localhost:8002/product/statastic?month=${month}`)
       console.log(respStat?.data)
let respBar = await axios.get(`http://localhost:8002/product/chart?month=${month}`)
       console.log(respBar?.data)
let respPie = await axios.get(`http://localhost:8002/product/Pie?month=${month}`)
       console.log(respPie?.data)

        res.status(200).send( )

        
    } catch (err) {
        res.status(400).send({ err: err.message })

    }


})
module.exports = productRoute