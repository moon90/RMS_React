import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import ProductIngredientAdd from './ProductIngredientAdd.jsx';
import { toast } from 'react-toastify';
import { getAllProductIngredients, deleteProductIngredient, toggleProductIngredientStatus } from '../../services/productIngredientService';
import { hasPermission } from '../../utils/permissionUtils';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { 
  FaFlask, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBoxOpen, 
  FaLeaf, 
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaBalanceScale,
  FaWeightHanging,
  FaCogs
} from 'react-icons/fa';

export default function ProductIngredientList() {
  const [rawData, setRawData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('PRODUCT_INGREDIENT_CREATE');
  const canUpdate = hasPermission('PRODUCT_INGREDIENT_UPDATE');
  const canDelete = hasPermission('PRODUCT_INGREDIENT_DELETE');

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: 1, // We fetch more to allow client-side grouping for "Dynamic" feel
        pageSize: 1000, 
        searchQuery: searchTerm,
      };
      const response = await getAllProductIngredients(params);
      if (response.data.isSuccess) {
        setRawData(response.data.data.items || []);
        setTotalRecords(response.data.data.totalRecords || 0);
      } else {
        toast.error('Failed to fetch formula List');
        setRawData([]);
      }
    } catch (error) {
      toast.error('Critical failure: Formula List unreachable.');
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Grouping logic for Dynamic Product-Centric View
  const groupedData = useMemo(() => {
    const groups = {};
    rawData.forEach(item => {
      const pId = item.productID;
      if (!groups[pId]) {
        groups[pId] = {
          productID: pId,
          productName: item.productName,
          ingredients: [],
          status: item.status
        };
      }
      groups[pId].ingredients.push(item);
    });
    return Object.values(groups);
  }, [rawData]);

  const toggleProduct = (pId) => {
    setExpandedProducts(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    toast(({ closeToast }) => (
      <div className="p-1 text-left">
        <p className="text-sm font-black text-gray-800 mb-3">Delete this ingredient?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteProductIngredient(id);
                if (response.data.isSuccess) {
                  toast.success('Ingredient deleted');
                  fetchItems();
                }
              } catch (err) {
                toast.error('Delete failed');
              }
              closeToast();
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
          >
            Confirm
          </button>
          <button onClick={closeToast} className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canUpdate) return;
    try {
      const response = await toggleProductIngredientStatus(id, !currentStatus);
      if (response.data.isSuccess) {
        toast.success(`Status updated`);
        fetchItems();
      }
    } catch (error) {}
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-2xl shadow-xl shadow-purple-200">
              <FaFlask className="text-white" />
            </div>
            Product Ingredients
          </h1>
          <p className="text-gray-400 mt-2 font-bold italic text-sm">Manage ingredients and formulas for each product</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-[2rem] font-black shadow-2xl shadow-purple-500/20 hover:bg-purple-700 hover:-translate-y-1 transition-all active:scale-95 text-[12px] uppercase tracking-widest"
          >
            <FaPlus /> Add Ingredient
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="mb-10 group relative max-w-2xl">
        <input
          type="text"
          placeholder="Search by product or ingredient..."
          className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] focus:border-purple-500 focus:ring-8 focus:ring-purple-500/5 outline-none transition-all shadow-xl group-hover:shadow-2xl font-bold text-gray-700"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-6 text-gray-300 group-focus-within:text-purple-500 transition-colors text-xl" />
      </div>

      {/* PRODUCT-CENTRIC LIST */}
      <div className="space-y-6">
        {isLoading && groupedData.length === 0 ? (
          <div className="py-20 text-center"><div className="w-16 h-16 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin mx-auto"></div><p className="mt-6 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Loading Ingredients...</p></div>
        ) : groupedData.length > 0 ? (
          groupedData.map((group) => (
            <div key={group.productID} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div 
                className="p-8 flex items-center justify-between cursor-pointer group/header select-none"
                onClick={() => toggleProduct(group.productID)}
              >
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl transition-all duration-500 ${expandedProducts[group.productID] ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-50 text-gray-400 group-hover/header:bg-purple-50 group-hover/header:text-purple-500'}`}>
                    <FaBoxOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                      {group.productName}
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-[10px] uppercase font-black tracking-widest border border-gray-200 group-hover/header:border-purple-200 group-hover/header:bg-purple-50 group-hover/header:text-purple-500 transition-all">
                        {group.ingredients.length} Components
                      </span>
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Product ID: {group.productID}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${expandedProducts[group.productID] ? 'bg-purple-50 border-purple-200 text-purple-600 rotate-180' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                    <FaChevronDown />
                  </div>
                </div>
              </div>

              {expandedProducts[group.productID] && (
                <div className="p-8 pt-0 animate-slide-down">
                  <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white/50">
                          <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Ingredient</th>
                          <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                          <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.ingredients.map((ing) => (
                          <tr key={ing.productIngredientID} className="hover:bg-white transition-colors group/row">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <FaLeaf className="text-green-300 group-hover/row:text-green-500 transition-colors" />
                                <div className="flex flex-col">
                                  <span className="font-black text-gray-700 text-sm tracking-tight">{ing.ingredientName}</span>
                                  <span className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{ing.remarks || 'No remarks'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <FaWeightHanging className="text-gray-300 text-xs" />
                                  <span className="text-sm font-black text-gray-700">{ing.quantity}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-5">{ing.unitShortName || ing.unitName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <button 
                                onClick={() => handleToggleStatus(ing.productIngredientID, ing.status)}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                                  ing.status ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                }`}
                              >
                                {ing.status ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                {canUpdate && (
                                  <button 
                                    onClick={() => { setSelectedItem(ing); setIsModalOpen(true); }}
                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-blue-500 hover:shadow-lg transition-all hover:scale-110"
                                  ><FaEdit size={14} /></button>
                                )}
                                {canDelete && (
                                  <button 
                                    onClick={() => handleDelete(ing.productIngredientID)}
                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-red-400 hover:shadow-lg transition-all hover:scale-110"
                                  ><FaTrashAlt size={14} /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={() => { setSelectedItem({ productID: group.productID }); setIsModalOpen(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-100 text-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-50 hover:border-purple-200 transition-all"
                    >
                      <FaPlus /> Add Ingredient to {group.productName}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <FaFlask size={64} className="text-gray-100 mx-auto mb-6" />
            <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No Ingredients Found</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-fade-in">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-white/20">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-2xl shadow-lg">
                    <FaCogs className="text-white text-xl" />
                  </div>
                  {selectedItem?.productIngredientID ? 'Edit Ingredient' : 'Add Ingredient'}
                </h3>
                <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest pl-1">Product: {selectedItem?.productName || 'All Products'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-2xl text-gray-300 hover:text-red-500 transition-all hover:rotate-90 border border-gray-50"><FaTimesCircle size={32}/></button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar bg-white">
              <ProductIngredientAdd 
                isEdit={!!selectedItem?.productIngredientID} 
                data={selectedItem} 
                onSave={() => { setIsModalOpen(false); fetchItems(); }} 
                onClose={() => setIsModalOpen(false)} 
                showTitle={false} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
