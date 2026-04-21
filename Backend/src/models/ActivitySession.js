const mongoose = require('mongoose');

const exerciseBreakdownSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    reps: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const activitySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: ['workout', 'emotion', 'manual'],
      default: 'manual'
    },
    sessionStartedAt: {
      type: Date,
      default: Date.now
    },
    sessionEndedAt: {
      type: Date,
      default: Date.now
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    activeSeconds: {
      type: Number,
      default: 0
    },
    totalReps: {
      type: Number,
      default: 0
    },
    correctReps: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    fitnessScore: {
      type: Number,
      default: 0
    },
    healthScore: {
      type: Number,
      default: 0
    },
    postureScore: {
      type: Number,
      default: null
    },
    mood: {
      type: String,
      default: 'Neutral'
    },
    activityLevel: {
      type: String,
      default: 'Low'
    },
    sleep: {
      hours: {
        type: Number,
        default: null
      },
      quality: {
        type: Number,
        default: null
      },
      score: {
        type: Number,
        default: null
      }
    },
    emotion: {
      dominant: {
        type: String,
        default: null
      },
      confidence: {
        type: Number,
        default: null
      },
      counts: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    exerciseBreakdown: {
      type: [exerciseBreakdownSchema],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ActivitySession', activitySessionSchema);
