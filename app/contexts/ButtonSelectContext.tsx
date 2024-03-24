import React, { createContext, useContext, useState } from "react";

interface ButtonSelectContextType {
  selectedButton: number | null;
  setSelectedButton: (index: number | null) => void;
}

const ButtonSelectContext = createContext<ButtonSelectContextType | undefined>(
  undefined,
);

export const ButtonSelectProvider: React.FC = ({ children }) => {
  const [selectedButton, setSelectedButton] = useState<number | null>(null);

  return (
    <ButtonSelectContext.Provider value={{ selectedButton, setSelectedButton }}>
      {children}
    </ButtonSelectContext.Provider>
  );
};

// Custom hook to use the context
export const useButtonSelect = () => {
  const context = useContext(ButtonSelectContext);
  if (context === undefined) {
    throw new Error(
      "useButtonSelect must be used within a ButtonSelectProvider",
    );
  }
  return context;
};
