import React from 'react';
import { FiSearch, FiPlus, FiFilter, FiChevronRight, FiX, FiMinus } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyUtils';

const ProductPanel = React.memo(({ 
    products, 
    selectedProductIndex, 
    handleProductAddToCart, 
    categories, 
    setSelectedCategory, 
    searchTerm, 
    setSearchTerm, 
    handleSearchKeyDown, 
    hasMoreProducts, 
    setCurrentPage,
    currencyCode,
    currencySymbol
}) => (
    <div className="animate-fade-in">
        {/* Search and Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative group flex-1">
                <FiSearch className="absolute top-1/2 left-6 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors text-xl" />
                <input
                    id="search-input"
                    type="text"
                    placeholder="Scan Barcode or Search..."
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm font-bold text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>
            <div className="relative group min-w-[200px]">
                <FiFilter className="absolute top-1/2 left-6 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <select
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none pl-14 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer shadow-sm"
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id || category.categoryID} value={category.id || category.categoryID} className="text-gray-900 bg-white">
                            {category.categoryName}
                        </option>
                    ))}
                </select>
                <FiChevronRight className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-300 pointer-events-none rotate-90" />
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product, index) => (
                <div
                    key={product.id}
                    className={`group relative bg-white rounded-[2rem] p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border-2 ${selectedProductIndex === index ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-transparent'}`}
                    onClick={() => handleProductAddToCart(product, index)}
                >
                    <div className="relative mb-3 sm:mb-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-blue-100 transition-colors">
                            <img
                                src={product.productImage || '/images/placeholder.png'}
                                alt={product.productName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                            />
                        </div>
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                                {formatCurrency(product.productPrice, currencyCode, currencySymbol)}
                            </span>
                        </div>
                        <div className={`absolute top-2 left-2 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border ${product.stockQuantity <= 0 ? 'bg-red-500/90 text-white border-red-400' : product.stockQuantity < 10 ? 'bg-amber-500/90 text-white border-amber-400' : 'bg-white/95 text-slate-600 border-slate-100'}`}>
                            <span className="text-[8px] font-black uppercase tracking-tighter">
                                {product.stockQuantity <= 0 ? 'Out of Stock' : `Stock: ${product.stockQuantity}`}
                            </span>
                        </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 truncate mb-1 text-left uppercase tracking-tight">{product.productName}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic text-left">{product.categoryName || 'General'}</p>

                    {/* Visual Feedback on selection (Keyboard Arrow Keys Navigation) */}
                    {selectedProductIndex === index && (
                        <div className={`absolute inset-0 rounded-[2rem] flex items-center justify-center pointer-events-none ${product.stockQuantity <= 0 ? 'bg-rose-500/10' : 'bg-blue-500/5'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform scale-110 ${product.stockQuantity <= 0 ? 'bg-rose-400 animate-shake' : 'bg-blue-600 animate-bounce'}`}>
                                {product.stockQuantity <= 0 ? (
                                    <FiMinus size={24} />
                                ) : (
                                    <FiPlus size={24} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {hasMoreProducts && (
            <div className="mt-12 text-center pb-12">
                <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="group relative px-10 py-4 bg-white border-2 border-slate-100 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-2xl transition-all active:scale-95"
                >
                    Load More
                </button>
            </div>
        )}
    </div>
));

ProductPanel.displayName = 'ProductPanel';

export default ProductPanel;
