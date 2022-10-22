const express = require('express');
const router = express.Router();
const regisController = require('../controllers/registerController')

router.post('/', regisController.handleNewUser)

module.exports = router