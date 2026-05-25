import React, { useState, useEffect, useCallback } from 'react';
import { createProduct, updateProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllSuppliers } from '../../services/supplierService';
import { getAllManufacturers } from '../../services/manufacturerService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaBoxOpen, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTag,
  FaIndustry,
  FaTruck,
  FaMoneyBillWave,
  FaBarcode,
  FaImage,
  FaCalendarAlt
} from 'react-icons/fa';

const ProductAdd = ({ isEdit = false, productData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    productName: '',
    productBarcode: '',
    productPrice: '',
    costPrice: '',
    categoryID: '',
    supplierID: '',
    manufacturerID: '',
    expireDate: '',
    status: true,
    thumbnailImage: '',
    thumbnailFile: null,
    productImage: '',
    productImageFile: null
  });
  
  const [dependencies, setDependencies] = useState({
    categories: [],
    suppliers: [],
    manufacturers: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('PRODUCT_CREATE');
  const canUpdate = hasPermission('PRODUCT_UPDATE');

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

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    if (isEdit && productData) {
      setFormData({
        id: productData.id,
        productName: productData.productName || '',
        productBarcode: productData.productBarcode || '',
        productPrice: productData.productPrice || '',
        costPrice: productData.costPrice || '',
        categoryID: productData.categoryID || '',
        supplierID: productData.supplierID || '',
        manufacturerID: productData.manufacturerID || '',
        expireDate: productData.expireDate ? productData.expireDate.split('T')[0] : '',
        status: productData.status ?? true,
        thumbnailImage: productData.thumbnailImage || '',
        thumbnailFile: null,
        productImage: productData.productImage || '',
        productImageFile: null
      });
    }
  }, [isEdit, productData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && productData) {
      setFormData({
        id: productData.id,
        productName: productData.productName || '',
        productBarcode: productData.productBarcode || '',
        productPrice: productData.productPrice || '',
        costPrice: productData.costPrice || '',
        categoryID: productData.categoryID || '',
        supplierID: productData.supplierID || '',
        manufacturerID: productData.manufacturerID || '',
        expireDate: productData.expireDate ? productData.expireDate.split('T')[0] : '',
        status: productData.status ?? true,
        thumbnailImage: productData.thumbnailImage || '',
        thumbnailFile: null,
        productImage: productData.productImage || '',
        productImageFile: null
      });
    } else {
      setFormData({
        productName: '',
        productBarcode: '',
        productPrice: '',
        costPrice: '',
        categoryID: '',
        supplierID: '',
        manufacturerID: '',
        expireDate: '',
        status: true,
        thumbnailImage: '',
        thumbnailFile: null,
        productImage: '',
        productImageFile: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.productPrice || formData.productPrice <= 0) newErrors.productPrice = 'Valid price is required';
    if (!formData.categoryID) newErrors.categoryID = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Validation Error: Please check required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      if (isEdit) fd.append('Id', formData.id);
      fd.append('ProductName', formData.productName);
      if (formData.productBarcode) fd.append('ProductBarcode', formData.productBarcode);
      fd.append('ProductPrice', formData.productPrice);
      if (formData.costPrice) fd.append('CostPrice', formData.costPrice);
      fd.append('Status', formData.status);
      if (formData.categoryID) fd.append('CategoryID', formData.categoryID);
      if (formData.supplierID) fd.append('SupplierID', formData.supplierID);
      if (formData.manufacturerID) fd.append('ManufacturerID', formData.manufacturerID);
      if (formData.expireDate) {
        try {
          fd.append('ExpireDate', new Date(formData.expireDate).toISOString());
        } catch (e) {
          console.error("Invalid date:", formData.expireDate);
        }
      }
      
      if (formData.thumbnailFile) {
        fd.append('thumbnailImageFile', formData.thumbnailFile);
      } else if (formData.thumbnailImage) {
        fd.append('ThumbnailImage', formData.thumbnailImage);
      }

      if (formData.productImageFile) {
        fd.append('productImageFile', formData.productImageFile);
      } else if (formData.productImage) {
        fd.append('ProductImage', formData.productImage);
      }

      let response = isEdit ? await updateProduct(formData.id, fd) : await createProduct(fd);

      if (response.data && response.data.isSuccess) {
        toast.success(isEdit ? 'Product updated.' : 'Product created.');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        toast.error(response.data?.message || 'Error saving product.');
      }
    } catch (error) {
      toast.error('Critical failure during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-1 max-w-5xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
              <FaBoxOpen className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Product' : 'Add Product'}
              </h2>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT SECTION: MAIN FIELDS (Col span 8) */}
            <div className="md:col-span-8 space-y-6">
              {/* Product Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Product Name</label>
                  <div className="relative">
                    <FaBoxOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm" placeholder="e.g. Burger" required />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Barcode</label>
                  <div className="relative">
                    <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" name="productBarcode" value={formData.productBarcode} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm" placeholder="Barcode" />
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Price</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="number" step="0.01" name="productPrice" value={formData.productPrice} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm" placeholder="0.00" required />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Cost</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm" placeholder="0.00" />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Expiry</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="date" name="expireDate" value={formData.expireDate} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm" />
                  </div>
                </div>
              </div>

              {/* Taxonomy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Category</label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <select name="categoryID" value={formData.categoryID} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm appearance-none" required>
                      <option value="">Unassigned</option>
                      {dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Supplier</label>
                  <div className="relative">
                    <FaTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <select name="supplierID" value={formData.supplierID} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm appearance-none">
                      <option value="">Unassigned</option>
                      {dependencies.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">Manufacturer</label>
                  <div className="relative">
                    <FaIndustry className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <select name="manufacturerID" value={formData.manufacturerID} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 text-sm appearance-none">
                      <option value="">Unassigned</option>
                      {dependencies.manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Toggle (Compact) */}
              <div className="flex items-center gap-4 p-1 bg-gray-50 rounded-xl border-2 border-transparent transition-all max-w-xs">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, status: true }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${formData.status ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-gray-400'}`}>
                  <FaCheckCircle /> Available
                </button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, status: false }))} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${!formData.status ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-gray-400'}`}>
                  <FaTimesCircle /> Delisted
                </button>
              </div>
            </div>

            {/* RIGHT SECTION: MEDIA (Col span 4) */}
            <div className="md:col-span-4 flex flex-col gap-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Visual Assets</label>
               
               {/* Thumbnail Image */}
               <div className="space-y-2">
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 italic">Thumbnail (Card View)</p>
                 <div 
                    className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden min-h-[140px] ${
                      formData.thumbnailImage ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                    }`}
                    onClick={() => document.getElementById('thumbUpload').click()}
                  >
                    <input id="thumbUpload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, thumbnailFile: file }));
                        const reader = new FileReader();
                        reader.onloadend = () => setFormData(prev => ({ ...prev, thumbnailImage: reader.result }));
                        reader.readAsDataURL(file);
                      }
                    }} />
                    {formData.thumbnailImage ? (
                      <img src={formData.thumbnailImage} alt="Thumbnail Preview" className="w-full h-24 object-cover rounded-lg shadow-sm border border-white" />
                    ) : (
                      <div className="text-center">
                        <FaImage className="text-gray-200 mx-auto mb-2" size={24} />
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight text-center">Drag Thumbnail</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Product Image */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1 italic">High-Res Image (Detail View)</p>
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden min-h-[140px] ${
                      formData.productImage ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                    }`}
                    onClick={() => document.getElementById('productImageUpload').click()}
                  >
                    <input id="productImageUpload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, productImageFile: file }));
                        const reader = new FileReader();
                        reader.onloadend = () => setFormData(prev => ({ ...prev, productImage: reader.result }));
                        reader.readAsDataURL(file);
                      }
                    }} />
                    {formData.productImage ? (
                      <img src={formData.productImage} alt="Main Preview" className="w-full h-24 object-cover rounded-lg shadow-sm border border-white" />
                    ) : (
                      <div className="text-center">
                        <FaImage className="text-gray-200 mx-auto mb-2" size={24} />
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight text-center">Drag Full-size Image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <div className="relative">
                    <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200 text-xs" />
                    <input type="text" name="thumbnailImage" value={formData.thumbnailImage?.startsWith('data:') ? '' : formData.thumbnailImage} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 bg-gray-50 border-2 border-transparent rounded-lg outline-none text-[9px] font-bold text-gray-500 focus:bg-white focus:border-blue-100" placeholder="PASTE IMAGE URL..." />
                  </div>
                </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
            <button type="button" onClick={() => { handleReset(); if(onClose) onClose(); }} className="px-6 py-3 bg-gray-50 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all flex items-center gap-2">
              <FaUndo /> Reset
            </button>
            <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50">
              <FaSave /> {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default ProductAdd;
