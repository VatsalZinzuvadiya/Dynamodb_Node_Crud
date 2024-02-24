// /app/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users', userController.getUser);
router.post('/users', userController.createUser);
router.post('/userlogin' , userController.loginUser)

// Add more routes as needed

module.exports = router;
