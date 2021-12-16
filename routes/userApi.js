const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator");
const User = require("../objects/User");
const bcrypt = require("bcryptjs");
//when you use two dots in require you "go back" a folder from the one the file is in
const jwt= require("jsonwebtoken");
const config = require("../config/keys");

router.get("/", (req, res)=> res.send("User route"));
router.post("/",
            [
                check("name", "Name is required").not().isEmpty(), 
                check("email", "Email is required").isEmail(),
                check("password", "password should have at least 5 characters").isLength({min:5})

            ]
        , async(req, res)=> {
            const errors= validationResult(req);
            //all the errors from our checks will be put into an array called errors
        
    
             
    if(!errors.isEmpty())
    {
        
        //this is a structure, i.e an object-array hybrid that contains the value from my body as it is already structured
        return res.status(400).json({errors:errors.array()});
        //sends the client the array which containt our error text if they inserted according the errors made
    }
    try {
        console.log(req.body);
            const {name, email, password, role} = req.body;  
        let user = await User.findOne({email:email});
        //returns a promise before a value, so it must be fully completed first
        if(user)
        {
            return res.status(400).json({errors: [{msg:"User already exists"}]});
        }
        user = new User({
            name,
            email,
            password
        });
        //genSalt return a promise first, hence the await
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.save();
        const payload = {
            user:{
                //because mongoDB creates a unique id for each user it's best to use this to find it
                id: user.id,
            },
        };
        jwt.sign(payload, config.jwtSecret, {expiresIn: 3600*24},
         (err, token) =>
        {
            if(err) throw err;
            
            res.json({token});
           
        }
        );
        //res.send("User created"); 
    } 
    catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
    
});


module.exports = router;