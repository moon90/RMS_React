import React, { useState } from 'react';
import MenuAdd from './MenuAdd';

const MenuList = () => {
  const [menus, setMenus] = useState([
    {
      id: 1,
      name: 'Dashboard',
      parentId: null,
      path: '/dashboard',
      icon: 'fa-home',
      order: 1
    },
    {
      id: 2,
      name: 'Users',
      parentId: null,
      path: '/users',
      icon: 'fa-users',
      order: 2
    },
    {
      id: 3,
      name: 'Settings',
      parentId: null,
      path: '/settings',
      icon: 'fa-cog',
      order: 3
    },
    {
      id: 4,
      name: 'User List',
      parentId: 2,
      path: '/users/list',
      icon: 'fa-list',
      order: 1
    }
  ]);

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (id) => {
    const item = menus.find(m => m.id === id);
    setSelectedMenu(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      setMenus(prev => prev.filter(m => m.id !== id));
    }
  };

  const filteredMenus = menus.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = sortedMenus.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Menu List</h2>
        <button
          onClick={() => {
            setSelectedMenu(null);
            setIsEditModalOpen(true);
          }}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add Menu
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search menus..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              {['name', 'path', 'icon', 'order'].map(field => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  <div className="flex items-center capitalize">
                    {field}
                    {sortField === field && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Parent</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((menu, idx) => (
              <tr key={menu.id}>
                <td className="px-4 py-4 text-sm text-gray-700">{indexOfFirst + idx + 1}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{menu.name}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{menu.path}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{menu.icon}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{menu.order}</td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {menu.parentId
                    ? menus.find(m => m.id === menu.parentId)?.name || '(Deleted)'
                    : '—'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(menu.id)}
                      className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      aria-label="Edit menu"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="p-1 border border-gray-300 rounded-md hover:bg-red-100"
                      aria-label="Delete menu"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <span className="text-sm text-gray-700 mb-2 md:mb-0">
          Showing <strong>{indexOfFirst + 1}</strong> to <strong>{Math.min(indexOfLast, filteredMenus.length)}</strong> of <strong>{filteredMenus.length}</strong> entries
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm">Items per page:</label>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center mt-2 md:mt-0 gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 text-sm rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 text-sm rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 p-6 relative">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedMenu ? 'Edit Menu' : 'Add Menu'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
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
