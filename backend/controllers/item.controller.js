import itemModel from "../model/item.model.js";

export const postItems = async (req, res) => {
  try {
    // logic of post items route
    const { name, description, price, category, images, tags } = req.body;

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

export const updateItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, tags, isAvailable } = req.body;

    if (name === undefined &&
      description === undefined &&
      price === undefined &&
      category === undefined &&
      images === undefined &&
      tags === undefined &&
      isAvailable === undefined) {
      return res.status(400).json({
        message: "At least one field is required to update"
      });
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(400).json({
          message: "Invalid price"
        });
      }
    }

    const updatedItem = await itemModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        images,
        tags
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    return res.status(200).json({
      message: "Item updated successfully",
      data: updatedItem
    });

  } catch (error) {
    console.error("Update item error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
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
    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete items error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};