const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const serializeUser = (user, token = null) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    primaryFocus: user.primaryFocus,
    intensityLevel: user.intensityLevel,
    healthScore: user.healthScore,
    token
  };
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json(serializeUser(user, generateToken(user._id)));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(serializeUser(user, generateToken(user._id)));
});

const getUserProfile = asyncHandler(async (req, res) => {
  res.json(serializeUser(req.user));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const fields = ['name', 'age', 'heightCm', 'weightKg', 'primaryFocus', 'intensityLevel', 'healthScore'];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  const updated = await user.save();
  res.json(serializeUser(updated));
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
