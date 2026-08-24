import itemModel from "../model/item.model.js";
import reviewModel from "../model/review.model.js";
import cloudinary from "../config/cloudinary.js";

export const getAllItems = async (req, res) => {
  try {
    // logic of get all items route
    const items = await itemModel.find();
    return res.status(200).json({ data: items });
  } catch (error) {
    console.error("Delete items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const postItems = async (req, res) => {
  try {
    // Debug: log what's being received
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.files length:", req.files?.length);

    // logic of post items route
    const { name, description, price, category, type, tags } = req.body;

    // Validate basic fields
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({ message: "Invalid description" });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (typeof category !== "string" || !["starter", "main-course", "dessert", "drink"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const requiresDietType = ["starter", "main-course"].includes(category);
    if (requiresDietType) {
      if (typeof type !== "string" || !["veg", "non-veg"].includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
      }
    }

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      console.error("No files received. req.files:", req.files);
      return res.status(400).json({ message: "Images are required" });
    }

    // Parse and validate tags
    let parsedTags = tags;

    if (typeof tags === "string") {
      parsedTags = tags.split(",").map(tag => tag.trim());
    }

    if (!Array.isArray(parsedTags) || parsedTags.length === 0) {
      return res.status(400).json({ message: "Tags must be a non-empty array" });
    }

    // Upload images to Cloudinary
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);

      uploadedImages.push({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Create and save new item to database
    const newItemData = {
      name,
      description,
      price,
      category,
      images: uploadedImages,
      tags: parsedTags,
    };

    if (requiresDietType) {
      newItemData.type = type;
    }

    const newItem = new itemModel(newItemData);
    await newItem.save();

    return res.status(201).json({ message: "Item created successfully", data: newItem });
  } catch (error) {
    console.error("Post items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateItems = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      type,
      tags,
      isAvailable,
    } = req.body;

    const updateData = {};

    const existingItem = await itemModel.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const effectiveCategory = category !== undefined ? category : existingItem.category;
    if (category !== undefined && !["starter", "main-course", "dessert", "drink"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const requiresDietType = ["starter", "main-course"].includes(effectiveCategory);
    if (requiresDietType) {
      if (type !== undefined) {
        if (typeof type !== "string" || !["veg", "non-veg"].includes(type)) {
          return res.status(400).json({ message: "Invalid type" });
        }
        updateData.type = type;
      } else if (category !== undefined && !existingItem.type) {
        return res.status(400).json({ message: "Invalid type" });
      }
    } else {
      updateData.$unset = { ...(updateData.$unset || {}), type: "" };
    }

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    // tags handling
    if (tags !== undefined) {
      if (typeof tags === "string") {
        updateData.tags = tags.split(",").map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        updateData.tags = tags;
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);

        uploadedImages.push({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }

      updateData.images = uploadedImages;
    }

    const updatedItem = await itemModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      data: updatedItem,
    });

  } catch (error) {
    console.error("Update item error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteItems = async (req, res) => {
  try {
    // logic of delete items route
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const deletedItem = await itemModel.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    await reviewModel.deleteMany({ item: id });

    const deleteImages = deletedItem.images.map(image => cloudinary.uploader.destroy(image.public_id));

    await Promise.all(deleteImages);

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};