const express = require("express");
const router = express.Router();
const auth = require("../middleware/authorization");
const User = require("../objects/User");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("../config/keys");

router.get("/", auth, async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id).select("-password"); //so that it doesn't send the pass
    console.log(user);
    res.json(user);
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/changeRole", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { role: "merchant" });
    res.send("Role changed");
  } catch (error) {
    console.error(error.message);
  }
});

router.post(
  "/",
  [
    check("email", "Email is required").isEmail(),
    check("password", "password required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //all the errors from our checks will be put into an array called errors

    console.log(req.body);
    const { email, password } = req.body;
    if (!errors.isEmpty()) {
      //this is a structure, i.e an object-array hybrid that contains the value from my body as it is already structured
      return res.status(400).json({ errors: errors.array() });
      //sends the client the array which containt our error text if they inserted according the errors made
    }
    try {
      let user = await User.findOne({ email: email });
      //returns a promise before a value, so it must be fully completed first
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid username or password" }] });
      }
      const match = await bcrypt.compare(password, user.password);
      //returns a boolean value
      if (!match) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid username or password" }] });
      }
      const payload = {
        user: {
          //because mongoDB creates a unique id for each user it's best to use this to find it
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: 900000 },
        (err, token) => {
          if (err) throw err;

          res.json({ token });
        }
      );
      //res.send("User created");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
