const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartSchema= new Schema({
    products: {
        //the cart is an array of product's id
        type:[Schema.Types.ObjectId],
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    //if the cart has been paid for
    fulfilled :{
        type: Boolean,
        default: false
    }
},
//similar to the created prop of other schemas
{timestamps: true}
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;