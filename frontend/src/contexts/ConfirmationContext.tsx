import React, { useState } from "react";
import { ConfirmationContext } from "./confirmation-context";

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [type, setType] = useState<"none" | "order" | "booking" | "feedback">("none");

  return (
    <ConfirmationContext.Provider value={{ type, setType }}>
      {children}
    </ConfirmationContext.Provider>
  );
};
