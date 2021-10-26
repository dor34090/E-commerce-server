const express = require("express");
const router = express.Router();
const auth= require("../middleware/authorization");
const {check, validationResult} = require("express-validator");
const Product = require("../objects/Product");
const { json } = require("express");
const uniqueValidator = require('mongoose-unique-validator');

router.post("/",[auth, 
    [check("name", "name required").notEmpty(),
    check("description", "description required").notEmpty(),
    check("category", "category required").notEmpty(),
    check("price", "price required").notEmpty(),
    check("quantity", "quantity required").notEmpty(),
    ]

],  
async (req, res)=>{
    try {
        const errors = validationResult(req);
        
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }
    console.log(req.user);
    const {name, description, category, price, brand, quantity} = req.body
    const newProduct = new Product({
        userId: req.user.id,
        //when the value and the structure have the same name you can just write it once
        name,
        description,
        category,
        price,
        brand,
        quantity
    });
    const pName= newProduct.name;
    

    
    const product = await newProduct.save();
    console.log(product);

    res.json({product});
    } catch (error) {
        if(error.message==="Product validation failed: name: product already exists")
        {
            console.error(error.message);
            return res.status(400).json({msg:"product already exists"});
        }
        console.error(error.message);
        res.status(500).json("server error");
    }
})
//get all products

router.get("/", async (req, res)=> {
    try {
        const product = await Product.find();
        //returns all products
        
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("server error");
    }
});
router.get("/:id", async (req, res)=> {
    try {
        const product = await Product.findById(req.params.id);
        //returns all products
        if(!product)
        {
            return res.status(404).json({msg:"product was not found"});
        }
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("server error");
    }
});

router.get("/instructors/:id",auth,  async (req, res) =>{
    try {
        const products = await Product.find({userId: req.params.id});
        //returns all products
        
        res.json(products);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("server error");
    }
})

module.exports= router;