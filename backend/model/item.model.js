import mongoose from "mongoose";

const itemModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: ["starter", "main-course", "dessert", "drink"],
    },
    type: {
      type: String,
      enum: ["veg", "non-veg"],
      required: function () {
        return this.category === "starter" || this.category === "main-course";
      },
    },
    images: {
      type: [
        {
          secure_url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },

    tags: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (tags) => Array.isArray(tags) && tags.length > 0,
        message: "At least one tag is required",
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Items", itemModel);