const express = require('express');
const authenticate = require('../middleware/authentication');
const authController = require('../controllers/auth_controller');
const eventController = require('../controllers/event_controller');
const router = express.Router();

router.get('/auth/profile-details', authenticate, authController.profileDetails);

router.get('/event/list', eventController.eventList);
router.get('/event/:id/join', authenticate, eventController.joinEvent);
router.get('/event/:id/leave', authenticate, eventController.leaveEvent);
router.get('/event/:id/delete', authenticate, eventController.deleteEvent);

module.exports = router;