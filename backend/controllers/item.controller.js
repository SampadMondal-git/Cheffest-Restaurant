import itemModel from "../model/item.model.js";

export const postItems = async (req, res) => {
  try {
    // logic of post items route
    const { name, description, price, category, images, tags  } = req.body;

    if (!name || !description || !price || !category || !images || !tags) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newItem = new itemModel({
      name,
      description,
      price,
      category,
      images,
      tags,
    });

    await newItem.save();

    return res.status(201).json({ message: "Item created successfully", data: newItem });
  } catch (error) {
    console.error("Post items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};