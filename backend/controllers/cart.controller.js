import cartModel from "../model/cart.model.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await cartModel.findOne({ user: userId });
    
    if (!cart) {
      cart = { items: [] };
    }
    
    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    let cart = await cartModel.findOne({ user: userId });

    if (items.length === 0) {
      if (cart) await cartModel.deleteOne({ user: userId });
      return res.status(200).json({ data: { items: [] } });
    }

    if (!cart) {
      cart = new cartModel({ user: userId, items });
    } else {
      cart.items = items;
    }

    await cart.save();
    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    await cartModel.deleteOne({ user: userId });

    res.status(200).json({ data: { items: [] } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
