const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password not required for OAuth users
      return !this.oauth || Object.keys(this.oauth).length === 0;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdMeetings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }],
  joinedMeetings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  }],
  profilePicture: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  oauth: {
    google: {
      id: String,
      email: String
    },
    github: {
      id: String,
      email: String
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate full name virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform output (remove sensitive data)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email or username
userSchema.statics.findByCredentials = async function(identifier, password) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');

  if (!user || !await user.comparePassword(password)) {
    throw new Error('Invalid credentials');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);