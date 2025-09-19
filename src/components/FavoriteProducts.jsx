
import React from 'react';

const FavoriteProducts = ({ products, onAddToCart }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Sale</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => onAddToCart(product)}
            className="flex-shrink-0 w-32 bg-white rounded-lg shadow-md p-3 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img 
              src={product.productImage || '/images/placeholder.png'} 
              alt={product.productName} 
              className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
            />
            <p className="text-sm font-semibold text-gray-800 truncate">{product.productName}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FavoriteProducts;
