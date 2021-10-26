const mongoose= require("mongoose");
//because we're dealing with the DB here
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default:"buyer"
    },
    date:{
        type: Date,
        default: Date.now()
    }
});

const User= mongoose.model("User", UserSchema);
module.exports = User;