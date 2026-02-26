const express = require('express');
const router = express.Router();
const expertiseController = require('../controllers/expertiseController');

router.get('/', expertiseController.getAllDomains);

module.exports = router;