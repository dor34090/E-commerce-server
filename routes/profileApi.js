const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");
const auth= require("../middleware/authorization");
const Profile= require("../objects/Profile");
const Product = require("../objects/Product");
const User = require("../objects/User");

router.get("/:id", async (req,res)=>{
    try {
        const profile= await Profile.findOne({userId: req.params.id});
        //returns a profile object
        if(!profile){
            return res.status(400).json({msg:"Merchant not found"});
        }
        res.json(profile);
        //json is an object format so you can just json the profile object
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
})

router.post("/", [auth, [check("address", "Address required").not().isEmpty(), check("bio", "Bio required").not().isEmpty()]], async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors: errors.array()});
    }
    const {website, address, bio, facebook, instagram, twitter, linkedin, youtube} = req.body;
    const profileData = {};
    profileData.userId= req.user.id;
    if(website) profileData.website = website;
    if(address) profileData.address= address;
    if(bio) profileData.bio = bio;
    //placing social media links into one object
    profileData.socialMedia = {facebook, twitter, instagram, youtube, linkedin};
    if(facebook) profileData.socialMedia.facebook= facebook;
    if(twitter) profileData.socialMedia.twitter= twitter;
    if(instagram) profileData.socialMedia.instagram= instagram;
    if(youtube) profileData.socialMedia.youtube= youtube;
    if(linkedin) profileData.socialMedia.linkedin= linkedin;

    try {
        //the one creating the profile is the user who owns the profile
        //so we can tie the profile to the userId
        let profile= await Profile.findOne({userId: req.user.id})
        if(profile)
        {
            //overwriting the existing profile with the updated one
            profile = await Profile.findOneAndUpdate({userId: req.user.id}, {$set:profileData}, {new:true});
            return res.json(profile);
        }
        profile = new Profile(profileData);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.delete("/", auth, async (req,res)=>{
    try {
        //running through all products and deleting them one by one
        const products= await Product.find({userId: req.user.id});
        products.forEach( async product=>{
            await Product.findOneAndRemove({_id: product._id});
        })
        await Profile.findOneAndRemove({userId: req.user.id});
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg:"User details deleted successfully"});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
})


module.exports = router;