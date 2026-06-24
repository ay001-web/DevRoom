const express = require('express');
const router  = express.Router();
const { createRoom, getRooms, getMyRooms, getRoom, updateCode, deleteRoom, getStats } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/my',    getMyRooms);
router.get('/',      getRooms);
router.post('/',     createRoom);
router.get('/:roomId',        getRoom);
router.patch('/:roomId/code', updateCode);
router.delete('/:roomId',     deleteRoom);

module.exports = router;
