const express = require('express');
const router  = express.Router();
const { executeCode } = require('../controllers/executeController');
const { protect } = require('../middleware/auth');
router.post('/', protect, executeCode);
module.exports = router;
