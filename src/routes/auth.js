const express = require('express');
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', 
  ValidationMiddleware.registerValidation(),
  AuthController.register
);

router.post('/login',
  ValidationMiddleware.loginValidation(),
  AuthController.login
);

router.post('/refresh-token',
  ValidationMiddleware.refreshTokenValidation(),
  AuthController.refreshToken
);

router.post('/oauth',
  ValidationMiddleware.oauthValidation(),
  AuthController.oauthLogin
);

// Protected routes
router.use(AuthMiddleware.authenticate);

router.get('/profile', AuthController.getProfile);

router.put('/profile',
  ValidationMiddleware.updateProfileValidation(),
  AuthController.updateProfile
);

router.put('/change-password',
  ValidationMiddleware.changePasswordValidation(),
  AuthController.changePassword
);

router.post('/logout', AuthController.logout);

router.post('/deactivate', AuthController.deactivateAccount);

module.exports = router;