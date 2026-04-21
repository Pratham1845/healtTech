const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userInput: {
      type: String,
      required: true,
      trim: true
    },
    botReply: {
      type: String,
      required: true,
      trim: true
    },
    healthData: {
      postureScore: {
        type: Number,
        default: null
      },
      activityLevel: {
        type: String,
        default: 'Unknown'
      },
      mood: {
        type: String,
        default: 'Unknown'
      }
    },
    status: {
      type: String,
      enum: ['success', 'fallback'],
      default: 'success'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
