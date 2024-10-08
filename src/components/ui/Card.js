import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="border-b pb-3 mb-4">
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">
    {children}
  </h2>
);

export const CardContent = ({ children }) => (
  <div>
    {children}
  </div>
);

export default Card;
