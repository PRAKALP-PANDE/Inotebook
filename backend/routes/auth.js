const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { exists } = require('../models/User');

const JWT_SECRET = 'prakalp$sign'

//Create a user using: POST "/api/auth/createuser". Doesn't require auth
//copied from express validator site
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 5 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 5 }),
],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res.status(400).json({ error: "User already exist" })
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Creating a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      })

      const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET); //jwt_secret string  has defined above i.e prakalp$sign
      res.json({ authtoken })

    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Internal server error");
    }

  })

//Create a authentication using: POST "/api/auth/login". Doesn't require auth
//copied from express validator site
router.post('/login', [
  body('email', 'Enter your email').isEmail(),
  body('password', 'Enter your password').exists(),
], async (req, res) => {

  // if there are errror return bad request and error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: "try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Try to login with correct credentials.." });
    }

    const data = {
      user: {
        id: user.id,
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Internal server error");
  }
})

module.exports = router