const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    age: {
      type: Number,
      default: null
    },
    heightCm: {
      type: Number,
      default: null
    },
    weightKg: {
      type: Number,
      default: null
    },
    primaryFocus: {
      type: String,
      default: 'Posture Correction'
    },
    intensityLevel: {
      type: String,
      default: 'Beginner'
    },
    healthScore: {
      type: Number,
      default: 70
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function save() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
