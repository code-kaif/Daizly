import { useContext } from "react";
import { DeviceContext } from "../App";

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceContext Provider");
  }
  return context;
};
