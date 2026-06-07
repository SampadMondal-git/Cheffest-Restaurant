import orderModel from "../model/order.model.js";

const generateOrderNumber = async () => {
  try {

    const today = new Date().toISOString().slice(0,10).replace(/-/g,"");

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const count = await orderModel.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    const sequence = String(count + 1).padStart(3,"0");

    return `OD-${today}-${sequence}`;

  } catch (error) {
    console.error("generateOrderNumber error:", error);
    throw new Error("Unable to generate order number");
  }
};

export default generateOrderNumber;