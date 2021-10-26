const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ProfileSchema= new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
    },
    website:{
        type:String,

    },
    address:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:true
    },
    socialMedia:{
        facebook:{
            type:String,
            default:""
        },
        twitter:{
            type:String,
            default:""
        },
        instagram:{
            type:String,
            default:""
        },
        youtube:{
            type:String,
            default:""
        },
        linkedin:{
            type:String,
            default:""
        },
    },
    created:{
        type:Date,
        default:Date.now()
    }
})

const Profile= mongoose.model("Profile", ProfileSchema);
module.exports = Profile;