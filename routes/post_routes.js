const express = require('express');
const validate = require('../middleware/validation');
const userValidator = require('../validator.js/user_validator');
const authController = require('../controllers/auth_controller');
const eventController = require('../controllers/event_controller');
const authenticate = require('../middleware/authentication');
const upload = require('../middleware/upload_file');
const router = express.Router();

router.post('/auth/register', validate(userValidator.register), authController.register);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/resend-otp', authController.resendOtp);
router.post('/auth/login', validate(userValidator.login), authController.login);
router.post('/auth/guest-login', authController.guestLogin);

router.post('/event/create-event', authenticate, upload.single('event-image'), eventController.createEvent);

module.exports = router;