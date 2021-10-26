const jwt = require("jsonwebtoken");
const config = require("../config/keys");

module.exports = function(req, res, next)
{
    const token = req.header('x-auth-token');
    if(!token)
    {
        //status 401 = authorization error
        return res.status(401).json({msg: "you're not authorized"});

    }
    try{
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded.user
        next();
    }
    catch (error){
        return res.status(401).json({msg: "invalid token"});
    }
}