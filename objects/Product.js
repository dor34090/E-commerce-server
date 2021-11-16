const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true 
    },
    name:{
        type: String,
        required: true,
        unique:true
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    brand:{
        type: String
    },
    quantity:{
        type: Number,
        required: true
    },
    thumbnail:{
        type: String,
    },
    images:{
        type: [String],
    },
    features: {
        type: [String],
    },
    created:{
        type: Date,
        default: Date.now()
    },
    updated:{
        type: Date,
        default: Date.now()
    }
});
productSchema.plugin(uniqueValidator, {message: "product already exists"});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;