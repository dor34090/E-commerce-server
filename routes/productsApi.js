const express = require("express");
const router = express.Router();
const auth= require("../middleware/authorization");
const {check, validationResult} = require("express-validator");
const Product = require("../objects/Product");
const { json } = require("express");
const {Storage} = require("@google-cloud/storage");
let multer= require("multer");
const memoryStorage= multer.memoryStorage;
const uniqueValidator = require('mongoose-unique-validator');

//init storage client on GCP storage
const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.GCLOUD_KEY_FILE
});
//init the bucket
const bucket= storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

//setting up a memoryStorage
//this will be a buffer between the user and the GCP storage (and what we will send to it)
multer = multer({
    storage:memoryStorage(),
    limit: {
        fileSize: 2000*1024*1024
    }
})

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

router.post("/upload/thumbnail",auth,multer.single("file"),  async (req, res) =>{
    try {
        const {id} = req.user;
        const {productId} = req.query;
        if(!req.file){
            res.status(400, "No file uploaded");
            return;
        }
        //creating a folder for each user
        //inside that folder, creating a folder for each of the user's products
        const blob = bucket.file(`${id}/${productId}/${req.file.originalname}`);
        const blobStream = await blob.createWriteStream();
        //handling error
        blobStream.on(`error`, (err)=>{
            console.log(err);
        });
        
        //handling success
        blobStream.on(`finish`, async ()=>{
            console.log(`successfully uploaded ${req.file.originalname}`);
            await blob.makePublic();
            await Product.findOneAndUpdate(
                {_id:productId},
                {$set: {thumbnail: blob.metadata.mediaLink}},
                 {new:true}
                 );
                 
            res.status(200).send({msg: `successfully uploaded ${req.file.originalname}`});
        });
        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("server error");
    }
})

module.exports= router;