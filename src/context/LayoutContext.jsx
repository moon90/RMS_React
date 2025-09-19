// src/context/LayoutContext.jsx
import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LayoutContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
