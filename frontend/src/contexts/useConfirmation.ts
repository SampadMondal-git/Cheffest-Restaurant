import { useContext } from "react";
import { ConfirmationContext } from "./confirmation-context";

export const useConfirmation = () => {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) throw new Error("useConfirmation must be used within ConfirmationProvider");
  return ctx;
};
