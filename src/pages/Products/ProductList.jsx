import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { getAllProducts, deleteProduct, toggleProductStatus } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllSuppliers } from '../../services/supplierService';
import { getAllManufacturers } from '../../services/manufacturerService';
import ProductAdd from './ProductAdd';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import CustomConfirmAlert from '../../components/CustomConfirmAlert';
import useSignalR from '../../useSignalR';
import config from '../../config';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaBoxOpen,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaIndustry,
  FaTruck,
  FaImage,
  FaMoneyBillWave,
  FaCubes
} from 'react-icons/fa';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [sortField, setSortField] = useState('ProductName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({ status: '', categoryID: '', supplierID: '', manufacturerID: '' });
  const [dependencies, setDependencies] = useState({ categories: [], suppliers: [], manufacturers: [] });
  const [isLoading, setIsLoading] = useState(false);

  const { connection, isConnected } = useSignalR(config.SIGNALR_HUB_URL);

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("InventoryUpdate", (data) => {
        console.log("ProductList: Received Real-time Update:", data);
        const productId = data.productId || data.ProductId;
        const newQuantity = data.newQuantity !== undefined ? data.newQuantity : data.NewQuantity;
        
        if (productId !== undefined && newQuantity !== undefined) {
          setProducts(prev => prev.map(p => {
            if (Number(p.id) === Number(productId)) {
              return { ...p, stockQuantity: Number(newQuantity) };
            }
            return p;
          }));
        }
      });

      return () => {
        connection.off("InventoryUpdate");
      };
    }
  }, [isConnected, connection]);

  useEffect(() => {
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setSearchInput(urlSearch);
      setCurrentPage(1);
    }
  }, [urlSearch]);


  const canCreate = hasPermission('PRODUCT_CREATE');
  const canUpdate = hasPermission('PRODUCT_UPDATE');
  const canDelete = hasPermission('PRODUCT_DELETE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [cats, sups, mans] = await Promise.all([
        getAllCategories({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllManufacturers({ pageNumber: 1, pageSize: 1000, status: true })
      ]);

      const normalize = (res, idKey, nameKey) => {
        if (!res.data || !res.data.isSuccess) return [];
        const items = res.data.data?.items || res.data.data || [];
        return items.map(i => ({
          id: i[idKey] || i.id || i.Id,
          name: i[nameKey] || i.name || i.Name
        }));
      };

      setDependencies({
        categories: normalize(cats, 'categoryID', 'categoryName'),
        suppliers: normalize(sups, 'supplierID', 'supplierName'),
        manufacturers: normalize(mans, 'manufacturerID', 'manufacturerName')
      });
    } catch (error) {
      console.error('Dependency sync failure:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: filters.status === 'active' ? true : filters.status === 'inactive' ? false : null,
        categoryId: filters.categoryID || null,
        supplierId: filters.supplierID || null,
        manufacturerId: filters.manufacturerID || null,
      };
      const response = await getAllProducts(params);
      if (response.data && response.data.isSuccess) {
        const rawData = response.data.data || {};
        setProducts(rawData.items || []);
        setTotalProducts(rawData.totalRecords || 0);
      } else {
        toast.error('Failed to synchronize product inventory.');
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      toast.error('Critical failure: Inventory registry unreachable.');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (isLoading) return;
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleStatus = async (product) => {
    if (!canUpdate) return;
    try {
      const response = await toggleProductStatus(product.id, !product.status);
      if (response.data.isSuccess) {
        toast.success(`Product '${product.productName}' status updated.`);
        fetchProducts();
      }
    } catch (error) {
      toast.error('Status synchronization failed.');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-tighter">Purge this product permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteProduct(id);
                if (response.data.isSuccess) {
                  toast.success('Product purged from registry.');
                  fetchProducts();
                } else {
                  toast.error(response.data.message || 'Purge rejected by system');
                }
              } catch (err) {
                toast.error('Cannot purge: Active stock or dependencies found');
              }
              closeToast();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false, position: "top-right" });
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter text-left">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
              <FaBoxOpen className="text-white" />
            </div>
            Catalog Master
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic text-left">Manage finished products, pricing strategies, and global catalog visibility</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedProduct(null); setIsEditModalOpen(true); }}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-500/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <FaPlus /> Initialize Product
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group flex-1 w-full text-left">
            <input
              type="text"
              placeholder="Scan catalog by name, barcode or SKU..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-slate-700"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute top-5 left-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          
          <div className="flex gap-2 items-center px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400">
            {totalProducts} Records Found
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 md:flex-none min-w-[140px]">
                <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                    name="status" 
                    className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-black text-[9px] uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm appearance-none"
                    onChange={handleFilterChange}
                    value={filters.status}
                >
                    <option value="">Status: ALL</option>
                    <option value="active" className="text-gray-900 bg-white">Active Only</option>
                    <option value="inactive" className="text-gray-900 bg-white">Archived</option>
                </select>
            </div>

            <div className="relative flex-1 md:flex-none min-w-[160px]">
                <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                    name="categoryID" 
                    className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-black text-[9px] uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm appearance-none"
                    onChange={handleFilterChange}
                    value={filters.categoryID}
                >
                    <option value="">Category: ALL</option>
                    {dependencies.categories.map(c => <option key={c.id} value={c.id} className="text-gray-900 bg-white">{c.name}</option>)}
                </select>
            </div>

            <div className="relative flex-1 md:flex-none min-w-[180px]">
                <FaIndustry className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                    name="manufacturerID" 
                    className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-black text-[9px] uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm appearance-none"
                    onChange={handleFilterChange}
                    value={filters.manufacturerID}
                >
                    <option value="">Manufacturer: ALL</option>
                    {dependencies.manufacturers.map(m => <option key={m.id} value={m.id} className="text-gray-900 bg-white">{m.name}</option>)}
                </select>
            </div>

            <div className="relative flex-1 md:flex-none min-w-[180px]">
                <FaTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                    name="supplierID" 
                    className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none font-black text-[9px] uppercase tracking-widest text-slate-600 cursor-pointer shadow-sm appearance-none"
                    onChange={handleFilterChange}
                    value={filters.supplierID}
                >
                    <option value="">Supplier: ALL</option>
                    {dependencies.suppliers.map(s => <option key={s.id} value={s.id} className="text-gray-900 bg-white">{s.name}</option>)}
                </select>
            </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('ProductName')}>Product Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing & Stock</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Inventory...</p></td></tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all shadow-sm">
                            {product.thumbnailImage ? (
                              <img src={product.thumbnailImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><FaImage size={24}/></div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-sm tracking-tight uppercase">{product.productName}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">BARCODE: {product.productBarcode || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest"><FaTag className="text-blue-200" /> {product.categoryName}</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><FaIndustry className="text-gray-200" /> {product.manufacturerName}</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><FaTruck className="text-gray-200" /> {product.supplierName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-blue-600 tracking-tighter">৳{product.productPrice.toLocaleString()}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${product.stockQuantity < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                          Inventory: {product.stockQuantity || 0} units
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${
                          product.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {product.status ? <FaCheckCircle /> : <FaTimesCircle />}
                        {product.status ? 'Listed' : 'Delisted'}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        {canUpdate && (
                          <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(product.id)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaBoxOpen size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Products in Catalog</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION SECTION */}
      <div className="mt-8">
        <ProfessionalPagination
          count={totalProducts}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* MODAL SYSTEM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <FaBoxOpen className="text-blue-600" />
                  {selectedProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {selectedProduct ? `ID: ${selectedProduct.id}` : 'Global Inventory Registry'}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90"><FaTimesCircle size={28}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <ProductAdd 
                isEdit={!!selectedProduct} 
                productData={selectedProduct} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={() => { fetchProducts(); setIsEditModalOpen(false); }}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
