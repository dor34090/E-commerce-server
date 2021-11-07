const express = require("express");
const app= express();
const cors = require("cors");
const connectDB = require("./config/db.js");
const port = process.env.port || 8080;
const morgan = require("morgan");
//the .config gives us access to the variables
require("dotenv").config();


app.use(cors());
//connecting to mongoDB
connectDB();
app.use(morgan("dev"));
//logs everytime a route is loaded (helps in debugging)

//define routes and API
app.use(express.json({extended:false}));
app.use("/api/users", require("./routes/userApi"));
app.use("/api/products", require("./routes/productsApi"));
app.use("/api/auth", require("./routes/authApi"));
app.use("/api/cart", require("./routes/cartApi"));
app.use("/api/profile", require("./routes/profileApi"));
app.use("/api/payment", require("./routes/paymentApi"));

app.get("/", (req, res)=>
{
    res.send("app is up");
});

app.listen(port, ()=>
{
    console.log(`server is listening at port ${port}`);
})