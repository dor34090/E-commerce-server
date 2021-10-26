const express = require("express");
const router = express.Router();
const {isEmpty} = require("lodash");
const Product = require("../objects/Product");
const Cart = require("../objects/Cart");
const Payment = require("../objects/Payment");
const auth = require("../middleware/authorization");
const stripe = require("stripe")("sk_test_51JmbjQCjbjmMgMWBAH5mjVL0ySYZ9zImunWqtpDSh5UGOaImQAKulWrpdZgtfcTcICsAT2l5Yrd3I5PxlPmA9OGw00HvAl0xLL");


router.post("/", auth, async(req,res)=>{
    try {
        const {cart, total, token} = req.body;
        const {card} = token;
        const shippingAddress = {
            address1: card.address_line1,
            address2: card.address_line2,
            coty: card.address_city,
            country: card.address_country,
            state: card.address_state,
            zip: card.address_zip
        };
        stripe.charges.create({
            amount: total*100,
            currency:"usd",
            receipt_email:token.email,
            source:req.body.token.id,
            description:`Payment for the purchase of ${cart.products.length} items from eShop`
        },async  (err, charge)=>{
            if(err){
                return res.send({status:400, err});
            }
            if(charge && charge.status=== "succeeded"){
                        const authorization = {
                    ...charge.payment_method_details,
                    receipt: charge.receipt_url,
                    token: token.id
                };
                        const context = {
                    authorization,
                    userId: req.user.id,
                    cartId: cart._id,
                    reference: charge.id,
                    transaction: charge.balance_transaction,
                    shippingAddress,
                };
                let payment = new Payment(context);
                payment = await payment.save();
                await Cart.findOneAndUpdate(
                    {_id: cart._id},
                    {$set:{fulfilled:true}},
                    {new:true});
                //using the products from the cart directly will give an error, because they are strings
                //for this, we will refetch the products in their object form
                const theCart = await Cart.findById({_id: cart._id});
                theCart.products.forEach( async (product) => {
                    let productDetails = await Product.findById({_id:product});
                    const qty = Number(productDetails.quantity) - 1;
                    await Product.findOneAndUpdate(
                        {_id:product},
                        {$set:{quantity:qty}},
                        {new:true}
                    );
                });
                res.send({status: 200});
            }
        })
        
        
    } catch (error) {
        res.sendStatus(500);
    }
})

module.exports = router;