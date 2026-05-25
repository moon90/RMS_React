import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import menuService from '../../services/menuService.js';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaProjectDiagram, 
  FaSave, 
  FaUndo, 
  FaCompass,
  FaLink,
  FaIcons,
  FaCubes,
  FaLayerGroup,
  FaSortAmountDown
} from 'react-icons/fa';

const MenuAdd = ({ isEdit = false, menuData = null, menuOptions = [], onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    menuName: '',
    parentID: '',
    menuPath: '',
    menuIcon: '',
    controllerName: '',
    actionName: '',
    moduleName: '',
    displayOrder: 0
  });
  const [errors, setErrors] = useState({});

  const canCreateMenu = hasPermission('MENU_CREATE');
  const canUpdateMenu = hasPermission('MENU_UPDATE');

  useEffect(() => {
    if (isEdit && menuData) {
      setFormData({
        menuID: menuData.menuID || menuData.id,
        menuName: menuData.menuName || '',
        parentID: menuData.parentID ?? '',
        menuPath: menuData.menuPath || '',
        menuIcon: menuData.menuIcon || '',
        controllerName: menuData.controllerName || '',
        actionName: menuData.actionName || '',
        moduleName: menuData.moduleName || '',
        displayOrder: menuData.displayOrder || 0
      });
    }
  }, [isEdit, menuData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && menuData) {
      setFormData({
        menuID: menuData.menuID || menuData.id,
        menuName: menuData.menuName || '',
        parentID: menuData.parentID ?? '',
        menuPath: menuData.menuPath || '',
        menuIcon: menuData.menuIcon || '',
        controllerName: menuData.controllerName || '',
        actionName: menuData.actionName || '',
        moduleName: menuData.moduleName || '',
        displayOrder: menuData.displayOrder || 0
      });
    } else {
      setFormData({
        menuName: '',
        parentID: '',
        menuPath: '',
        menuIcon: '',
        controllerName: '',
        actionName: '',
        moduleName: '',
        displayOrder: 0
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (isEdit && !canUpdateMenu) {
      toast.error('Identity Authorization: Update denied.');
      return;
    }
    if (!isEdit && !canCreateMenu) {
      toast.error('Identity Authorization: Creation denied.');
      return;
    }

    const payload = {
      MenuID: isEdit ? (formData.menuID) : 0,
      MenuName: formData.menuName,
      ParentID: formData.parentID === '' ? null : Number(formData.parentID),
      MenuPath: formData.menuPath,
      MenuIcon: formData.menuIcon,
      ControllerName: formData.controllerName,
      ActionName: formData.actionName,
      ModuleName: formData.moduleName,
      DisplayOrder: formData.displayOrder
    };

    try {
      let response;
      if (isEdit) {
        response = await menuService.updateMenu(payload.MenuID, payload);
      } else {
        response = await menuService.createMenu(payload);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Menu updated.' : 'Menu saved.');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        const errorResponse = response.data;
        if (errorResponse && errorResponse.details && errorResponse.details.length > 0) {
          const apiErrors = {};
          errorResponse.details.forEach(err => {
            apiErrors[err.propertyName.toLowerCase()] = err.errorMessage;
          });
          setErrors(apiErrors);
          toast.error('Constraint violation: Hierarchy rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Navigation registry unreachable.');
      console.error('Menu operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaProjectDiagram className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Menu' : 'Add Menu'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">System Navigation Management</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Menu Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Menu Name
              </label>
              <div className="relative">
                <FaCompass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="menuName"
                  value={formData.menuName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.menuname ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Orders"
                  required
                />
              </div>
            </div>

            {/* Parent Menu */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Parent Menu
              </label>
              <div className="relative">
                <FaProjectDiagram className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  name="parentID"
                  value={formData.parentID}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="">None (Root)</option>
                  {menuOptions.map(menu => (
                    <option key={menu.menuID || menu.id} value={menu.menuID || menu.id}>
                      {menu.menuName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Menu Path */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Path
              </label>
              <div className="relative">
                <FaLink className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="menuPath"
                  value={formData.menuPath}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.menupath ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="/orders"
                  required
                />
              </div>
            </div>

            {/* Menu Icon */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Icon Name
              </label>
              <div className="relative">
                <FaIcons className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="menuIcon"
                  value={formData.menuIcon}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  placeholder="FaBox"
                />
              </div>
            </div>

            {/* Controller Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Controller
              </label>
              <div className="relative">
                <FaCubes className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="controllerName"
                  value={formData.controllerName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.controllername ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="Orders"
                  required
                />
              </div>
            </div>

            {/* Action Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Action
              </label>
              <div className="relative">
                <FaSave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="actionName"
                  value={formData.actionName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.actionname ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="Index"
                  required
                />
              </div>
            </div>

            {/* Module Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Module Name
              </label>
              <div className="relative">
                <FaLayerGroup className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="moduleName"
                  value={formData.moduleName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.modulename ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="Sales"
                  required
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Display Order
              </label>
              <div className="relative">
                <FaSortAmountDown className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { handleReset(); if(onClose) onClose(); }}
              className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-2"
            >
              <FaUndo /> Reset
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <FaSave /> {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default MenuAdd;
