import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import MenuAdd from './MenuAdd';
import { toast } from 'react-toastify';
import { getAllMenus, deleteMenu } from '../../services/menuService.js';
import { hasPermission } from '../../utils/permissionUtils';
import ProfessionalPagination from '../../components/ProfessionalPagination';

const MenuList = () => {
  const [menus, setMenus] = useState([]);
  const [totalMenus, setTotalMenus] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('MenuName'); // Changed to match backend DTO
  const [sortDirection, setSortDirection] = useState('asc');

  const canCreateMenu = hasPermission('MENU_CREATE');
  const canUpdateMenu = hasPermission('MENU_UPDATE');
  const canDeleteMenu = hasPermission('MENU_DELETE');

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await getAllMenus(params);
      console.log('getAllMenus response:', response);
      // Directly access data from response.data (which is PagedResult)
      setMenus(response.data.items);
      setTotalMenus(response.data.totalRecords || 0);
    } catch (err) {
      toast.error('An error occurred while fetching menus.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSort = (field) => {
    if (loading) return;
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setItemsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleEdit = (menu) => {
    if (!canUpdateMenu) {
      toast.error('You do not have permission to edit menus.');
      return;
    }
    setSelectedMenu(menu);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!canDeleteMenu) {
      toast.error('You do not have permission to delete menus.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this menu?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteMenu(id);
                  if (response.isSuccess) {
                    toast.success('Menu deleted successfully');
                  } else {
                    toast.error(response.message || 'Failed to delete menu');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the menu.');
                  }
                  console.error(error);
                } finally {
                  fetchMenus();
                  closeToast();
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    fetchMenus();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Menu List</h2>
        {canCreateMenu && (
          <button
            onClick={() => {
              setSelectedMenu(null);
              setIsEditModalOpen(true);
            }}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add Menu
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search menus..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={loading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {loading ? (
        <p>Loading menus...</p>
      ) : menus.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('MenuName')}
                >
                  <div className="flex items-center">
                    Menu Name
                    {sortField === 'MenuName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('MenuPath')}
                >
                  <div className="flex items-center">
                    Menu Path
                    {sortField === 'MenuPath' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('MenuIcon')}
                >
                  <div className="flex items-center">
                    Menu Icon
                    {sortField === 'MenuIcon' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ControllerName')}
                >
                  <div className="flex items-center">
                    Controller Name
                    {sortField === 'ControllerName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ActionName')}
                >
                  <div className="flex items-center">
                    Action Name
                    {sortField === 'ActionName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ModuleName')}
                >
                  <div className="flex items-center">
                    Module Name
                    {sortField === 'ModuleName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!loading && 'cursor-pointer'}`}
                  onClick={() => handleSort('DisplayOrder')}
                >
                  <div className="flex items-center">
                    Display Order
                    {sortField === 'DisplayOrder' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menus.map((menu, idx) => (
                <tr key={menu.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.menuName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.menuPath}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.menuIcon}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.controllerName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.actionName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.moduleName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{menu.displayOrder}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {menu.parentID
                      ? menus.find(m => m.id === menu.parentID)?.menuName || '(Deleted)'
                      : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canUpdateMenu && (
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit menu"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canDeleteMenu && (
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete menu"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4">No menus found.</p>
      )}

      {!loading && (
        <ProfessionalPagination
          count={totalMenus}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 p-6 relative animate-scale-in">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedMenu ? 'Edit Menu' : 'Add Menu'}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <MenuAdd
                isEdit={!!selectedMenu}
                menuData={selectedMenu}
                menuOptions={menus}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
                showTitle={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;