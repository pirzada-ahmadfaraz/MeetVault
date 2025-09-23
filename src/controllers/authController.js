const { validationResult } = require('express-validator');
const { User } = require('../models');
const JWTUtils = require('../utils/jwt');
const ApiResponse = require('../utils/response');

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        return ApiResponse.conflict(res, `User with this ${field} already exists`);
      }

      // Create new user
      const user = new User({
        username,
        email: email.toLowerCase(),
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate JWT token
      const token = JWTUtils.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user._id
      });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return ApiResponse.created(res, {
        user: user.toJSON(),
        token,
        refreshToken
      }, 'User registered successfully');

    } catch (error) {
      console.error('Registration error:', error);
      return ApiResponse.error(res, 'Registration failed', 500);
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { identifier, password } = req.body;

      // Find user by email or username
      const user = await User.findByCredentials(identifier, password);

      if (!user.isActive) {
        return ApiResponse.unauthorized(res, 'Account is deactivated');
      }

      // Generate JWT token
      const token = JWTUtils.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user._id
      });

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return ApiResponse.success(res, {
        user: user.toJSON(),
        token,
        refreshToken
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }
      return ApiResponse.error(res, 'Login failed', 500);
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.validationError(res, null, 'Refresh token is required');
      }

      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Invalid refresh token');
      }

      // Generate new tokens
      const newToken = JWTUtils.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      const newRefreshToken = JWTUtils.generateRefreshToken({
        userId: user._id
      });

      return ApiResponse.success(res, {
        token: newToken,
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully');

    } catch (error) {
      console.error('Token refresh error:', error);
      return ApiResponse.unauthorized(res, 'Invalid refresh token');
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId)
        .populate('createdMeetings', 'title meetingId isActive startTime')
        .populate('joinedMeetings', 'title meetingId isActive startTime');

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      return ApiResponse.success(res, user.toJSON(), 'Profile retrieved successfully');

    } catch (error) {
      console.error('Get profile error:', error);
      return ApiResponse.error(res, 'Failed to retrieve profile', 500);
    }
  }

  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { firstName, lastName, username } = req.body;
      const userId = req.userId;

      // Check if username is taken by another user
      if (username) {
        const existingUser = await User.findOne({
          username,
          _id: { $ne: userId }
        });

        if (existingUser) {
          return ApiResponse.conflict(res, 'Username is already taken');
        }
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (username !== undefined) updateData.username = username;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      return ApiResponse.success(res, user.toJSON(), 'Profile updated successfully');

    } catch (error) {
      console.error('Update profile error:', error);
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return ApiResponse.validationError(res, errors);
      }
      return ApiResponse.error(res, 'Failed to update profile', 500);
    }
  }

  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return ApiResponse.unauthorized(res, 'Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return ApiResponse.success(res, null, 'Password changed successfully');

    } catch (error) {
      console.error('Change password error:', error);
      return ApiResponse.error(res, 'Failed to change password', 500);
    }
  }

  static async logout(req, res) {
    try {
      // In a real application, you might want to invalidate the token
      // For now, we'll just return success as the client should remove the token
      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return ApiResponse.error(res, 'Logout failed', 500);
    }
  }

  static async deactivateAccount(req, res) {
    try {
      const userId = req.userId;

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
      }

      return ApiResponse.success(res, null, 'Account deactivated successfully');

    } catch (error) {
      console.error('Deactivate account error:', error);
      return ApiResponse.error(res, 'Failed to deactivate account', 500);
    }
  }

  static async oauthLogin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { provider, providerId, email, name, image } = req.body;

      // Check if user already exists with this OAuth provider
      let user = await User.findOne({
        $or: [
          { [`oauth.${provider}.id`]: providerId },
          { email: email.toLowerCase() }
        ]
      });

      if (user) {
        // Update OAuth info if user exists
        if (!user.oauth) user.oauth = {};
        if (!user.oauth[provider]) {
          user.oauth[provider] = {
            id: providerId,
            email: email
          };
        }
        user.lastLogin = new Date();
        if (image && !user.profilePicture) {
          user.profilePicture = image;
        }
        await user.save();
      } else {
        // Create new user from OAuth data
        const nameParts = name ? name.split(' ') : ['', ''];
        user = new User({
          username: email.split('@')[0] + '_' + provider,
          email: email.toLowerCase(),
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          profilePicture: image,
          oauth: {
            [provider]: {
              id: providerId,
              email: email
            }
          },
          isEmailVerified: true, // OAuth emails are pre-verified
          lastLogin: new Date()
        });

        await user.save();
      }

      if (!user.isActive) {
        return ApiResponse.unauthorized(res, 'Account is deactivated');
      }

      // Generate JWT tokens
      const token = JWTUtils.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email
      });

      const refreshToken = JWTUtils.generateRefreshToken({
        userId: user._id
      });

      return ApiResponse.success(res, {
        user: user.toJSON(),
        token,
        refreshToken
      }, 'OAuth login successful');

    } catch (error) {
      console.error('OAuth login error:', error);
      return ApiResponse.error(res, 'OAuth login failed', 500);
    }
  }
}

module.exports = AuthController;