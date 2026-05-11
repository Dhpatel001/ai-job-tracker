import mongoose from "mongoose";
import { JOB_STATUSES } from "../config/constants.js";

// MongoDB chosen because job description data is document-shaped —
// skills[], responsibilities[], and redFlags[] are nested arrays
// that would require junction tables in SQL but map naturally here.

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    // Raw job description text pasted by the user
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [20000, "Description too long — paste the relevant sections only"],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(JOB_STATUSES),
        message: "{VALUE} is not a valid status",
      },
      default: JOB_STATUSES.APPLIED,
    },

    // Fields populated by Gemini — empty until AI analysis runs
    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      default: null, // e.g. "3-5 years of backend experience"
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    redFlags: {
      type: [String],
      default: [], // e.g. "Unpaid trial period", "No salary range listed"
    },

    // Track when status changes happen
    statusHistory: [
      {
        status: { type: String, enum: Object.values(JOB_STATUSES) },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    notes: {
      type: String,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },

    jobUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Index on status — dashboard will filter by this constantly
JobSchema.index({ status: 1 });

// Index on createdAt — default sort order for job list
JobSchema.index({ createdAt: -1 });

// Auto-record the initial status and every later status change.
JobSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.statusHistory.length === 0) {
      this.statusHistory.push({ status: this.status });
    }
    return next();
  }

  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

export const Job = mongoose.model("Job", JobSchema);
