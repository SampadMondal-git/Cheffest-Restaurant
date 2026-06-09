import { createContext } from "react";

type ConfirmationType = "none" | "order" | "booking" | "feedback";

type ConfirmationContextValue = {
  type: ConfirmationType;
  setType: (t: ConfirmationType) => void;
};

export const ConfirmationContext = createContext<ConfirmationContextValue | undefined>(undefined);
