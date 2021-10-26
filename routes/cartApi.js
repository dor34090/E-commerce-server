const express = require("express");
const router = express.Router();
const {isEmpty} = require("lodash");
const Product = require("../objects/Product");
const Cart = require("../objects/Cart");
const auth = require("../middleware/authorization");

router.get("/",auth,  async (req, res)=>{
        try {
            const userId = req.user.id;
            const carts = await Cart.find({userId});
            if(isEmpty(carts))
            {
                return res.send({products:[]});
            }
            let retrievedCart;
            carts.forEach(cart=>{
                //going through the carts to return the unpaid one
                if(!cart.fulfilled)
                {
                    retrievedCart = cart;
                }
            });
            let products = [];
            let result;
            //the products prop is an array of ids
            //the query asigns an actual product object for every id
            if(!isEmpty(retrievedCart))
            {
                products = retrievedCart.products.map(async (product) => await Product.findById({_id: product}));
                //makes sure the query is done before proceeding
                products = await Promise.all(products);
                result = {...retrievedCart.toJSON(), products};
            }
            res.send({result});
        } catch (error) {
            res.status(500);
        }
})

router.put("/:id",auth,  async (req,res) =>{
    try {
        const cartId = req.params.id;
        const product = req.body.product;
        const cart = await Cart.update(
            {id:cartId},
            {$pullAll:{products:[product]}}
        );
        res.send({cart});
    } catch (error) {
        res.status(500).json(error);
    }
})

router.post("/", auth, async(req,res)=>{
    try {
        const userId = req.user.id;
        const {products} = req.body;
        let cart, unpaidCart;
        const carts = await Cart.find({userId});
        //reduce method performs a function on every array value and adds it to an accumulative result
        const hasNoValidCarts = carts.reduce((acc, value)=>{
            if(!value.fulfilled){
                unpaidCart = value;
            }
            return acc && value.fulfilled
        }, true);
        if(hasNoValidCarts){
            cart = new Cart ({userId, products});
            cart = await cart.save();
        }else{
            //making an array that combines previous products from cart with the new ones
            //converting each one to a string to make id pulling more efficient
            const stringProduct = [
                ...unpaidCart.products,...products
            ].map(product=>product.toString());
            //the Set object is an object of unique value
            //the Array.from makes an array from the object that removed the duplicates
            const newProducts = Array.from(new Set(stringProduct));
            cart = await Cart.findByIdAndUpdate({_id: unpaidCart._id}, {products: newProducts});
        }
        let value = cart.products.map(async (id) => await Product.findById(id));
        value = await Promise.all(value);
        res.send({...cart.toJSON(), products:value});
    } catch (error) {
        res.send(error);
    }
})

module.exports = router;