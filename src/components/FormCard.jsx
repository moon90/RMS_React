// components/FormCard.jsx
import React from 'react';
export default function FormCard({ children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {children}
    </div>
  );
}
