import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useConfirmation } from "../../src/contexts/useConfirmation";
import OrderConfirmed from "./orderConfirmation";
import BookingConfirmed from "./bookingConfirmation";
import FeedbackConfirmed from "./feedbackConfirmation";

export default function ConfirmationModal() {
  const { type, setType } = useConfirmation();
  const location = useLocation();

  useEffect(() => {
    if (type !== "none") {
      setType("none");
    }
  }, [location.pathname, setType]);

  if (type === "none") return null;

  let Content: React.ReactNode = null;
  if (type === "order") Content = <OrderConfirmed />;
  if (type === "booking") Content = <BookingConfirmed />;
  if (type === "feedback") Content = <FeedbackConfirmed />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setType("none")} />
      <div className="relative z-10 max-w-3xl w-full p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {Content}
        </div>
      </div>
    </div>
  );
}
