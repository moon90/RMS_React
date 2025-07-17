import React, { useEffect, useState } from 'react';
import FormCard from '../../components/FormCard.jsx';

const MenuAdd = ({ isEdit = false, menuData = null, menuOptions = [], onClose, showTitle= true}) => {
  const [formData, setFormData] = useState({
    menuName: '',
    parentID: '',
    menuPath: '',
    menuIcon: '',
    displayOrder: 0
  });

  useEffect(() => {
    if (isEdit && menuData) {
      setFormData({
        menuName: menuData.menuName || '',
        parentID: menuData.parentID ?? '',
        menuPath: menuData.menuPath || '',
        menuIcon: menuData.menuIcon || '',
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      MenuID: isEdit ? menuData.id : 0,
      MenuName: formData.menuName,
      ParentID: formData.parentID === '' ? null : Number(formData.parentID),
      MenuPath: formData.menuPath,
      MenuIcon: formData.menuIcon,
      DisplayOrder: formData.displayOrder
    };

    console.log('Submitted Menu:', payload);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      menuName: '',
      parentID: '',
      menuPath: '',
      menuIcon: '',
      displayOrder: 0
    });
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {/* {!isEdit && (
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Menu</h2>
        )} */}
        {showTitle && !isEdit && (
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Menu</h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
              <input
                type="text"
                name="menuName"
                value={formData.menuName}
                onChange={handleInputChange}
                required
                placeholder="Enter menu name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Menu</label>
              <select
                name="parentID"
                value={formData.parentID}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">None</option>
                {menuOptions.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.menuName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Menu Path</label>
              <input
                type="text"
                name="menuPath"
                value={formData.menuPath}
                onChange={handleInputChange}
                required
                placeholder="/dashboard"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Menu Icon</label>
              <input
                type="text"
                name="menuIcon"
                value={formData.menuIcon}
                onChange={handleInputChange}
                placeholder="fa-solid fa-home"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              {isEdit ? 'Update Menu' : 'Create Menu'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default MenuAdd;
