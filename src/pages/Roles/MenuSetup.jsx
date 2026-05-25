import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import menuService from '../../services/menuService';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import {
  FaLayerGroup, FaPlus, FaEdit, FaTrash, FaSearch, FaSave,
  FaTimes, FaSort, FaSortUp, FaSortDown, FaLink, FaCode,
  FaSitemap, FaHashtag, FaFolder, FaChevronRight
} from 'react-icons/fa';

// ── helpers ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  menuName: '', menuPath: '', menuIcon: 'FaCircle',
  controllerName: '', actionName: '', moduleName: '',
  parentID: '', displayOrder: 0,
};

const SortIcon = ({ col, sortCol, sortDir }) => {
  if (col !== sortCol) return <FaSort className="ml-1 text-gray-300 inline" />;
  return sortDir === 'asc'
    ? <FaSortUp className="ml-1 text-indigo-500 inline" />
    : <FaSortDown className="ml-1 text-indigo-500 inline" />;
};

// ── main component ────────────────────────────────────────────────────────────
export default function MenuSetup() {
  const [menus, setMenus]           = useState([]);
  const [allMenus, setAllMenus]     = useState([]); // for parent dropdown
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMenu, setEditMenu]     = useState(null); // null = add, obj = edit
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // pagination & filters
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalMenus, setTotalMenus]     = useState(0);
  const [searchTerm, setSearchTerm]     = useState('');
  const [sortCol, setSortCol]           = useState('DisplayOrder');
  const [sortDir, setSortDir]           = useState('asc');

  // ── fetch paged menus ──────────────────────────────────────────────────────
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await menuService.getAllMenus({
        pageNumber: currentPage, pageSize: itemsPerPage,
        searchQuery: searchTerm, sortColumn: sortCol, sortDirection: sortDir,
      });
      const data = res.data;
      if (data?.isSuccess) {
        setMenus(data.data?.items || []);
        setTotalMenus(data.data?.totalRecords || 0);
      } else {
        toast.error(data?.message || 'Failed to load menus.');
      }
    } catch (err) {
      toast.error('Failed to load menus.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortCol, sortDir]);

  // fetch all menus (for parent dropdown — no pagination)
  const fetchAllMenus = useCallback(async () => {
    try {
      const res = await menuService.getAllMenus({ pageNumber: 1, pageSize: 1000 });
      const data = res.data;
      if (data?.isSuccess) setAllMenus(data.data?.items || []);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);
  useEffect(() => { fetchAllMenus(); }, [fetchAllMenus]);

  // ── debounced search ───────────────────────────────────────────────────────
  const debouncedSearch = useCallback(
    debounce(v => { setSearchTerm(v); setCurrentPage(1); }, 350), []
  );

  // ── sorting ────────────────────────────────────────────────────────────────
  const handleSort = col => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setCurrentPage(1);
  };

  // ── modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditMenu(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = menu => {
    setEditMenu(menu);
    setForm({
      menuName:       menu.menuName       ?? '',
      menuPath:       menu.menuPath       ?? '',
      menuIcon:       menu.menuIcon       ?? 'FaCircle',
      controllerName: menu.controllerName ?? '',
      actionName:     menu.actionName     ?? '',
      moduleName:     menu.moduleName     ?? '',
      parentID:       menu.parentID != null ? String(menu.parentID) : '',
      displayOrder:   menu.displayOrder   ?? 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditMenu(null); };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ── save (create / update) ─────────────────────────────────────────────────
  const handleSave = async e => {
    e.preventDefault();
    if (!form.menuName.trim()) { toast.error('Menu Name is required.'); return; }
    if (!form.menuPath.trim()) { toast.error('Menu Path is required.'); return; }

    setSaving(true);
    try {
      const payload = {
        MenuName:       form.menuName.trim(),
        MenuPath:       form.menuPath.trim(),
        MenuIcon:       form.menuIcon.trim() || 'FaCircle',
        ControllerName: form.controllerName.trim() || form.menuName.trim(),
        ActionName:     form.actionName.trim() || 'Index',
        ModuleName:     form.moduleName.trim() || 'General',
        ParentID:       form.parentID !== '' ? Number(form.parentID) : null,
        DisplayOrder:   Number(form.displayOrder) || 0,
      };

      if (editMenu) {
        const res = await menuService.updateMenu(editMenu.menuID, { ...payload, MenuID: editMenu.menuID });
        if (res.data?.isSuccess) {
          toast.success('Menu updated successfully.');
          closeModal();
          fetchMenus();
          fetchAllMenus();
        } else {
          toast.error(res.data?.message || 'Failed to update menu.');
        }
      } else {
        const res = await menuService.createMenu(payload);
        if (res.data?.isSuccess) {
          toast.success('Menu created successfully.');
          closeModal();
          fetchMenus();
          fetchAllMenus();
        } else {
          toast.error(res.data?.message || 'Failed to create menu.');
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await menuService.deleteMenu(deleteTarget.menuID);
      if (res.data?.isSuccess) {
        toast.success('Menu deleted.');
        setDeleteTarget(null);
        fetchMenus();
        fetchAllMenus();
      } else {
        toast.error(res.data?.message || 'Failed to delete menu.');
      }
    } catch (err) {
      toast.error('Failed to delete menu.');
    }
  };

  // parent name lookup
  const getParentName = (parentID) => {
    if (!parentID) return '—';
    const p = allMenus.find(m => m.menuID === parentID);
    return p ? p.menuName : `#${parentID}`;
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl">
      {/* ── header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaLayerGroup className="text-indigo-600" /> Menu Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Configure system navigation menu items and their routing</p>
        </div>
        <button
          id="btn-add-menu"
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <FaPlus /> Add Menu
        </button>
      </div>

      {/* ── search bar ── */}
      <div className="mb-6">
        <div className="relative group max-w-md">
          <input
            id="menu-search"
            type="text"
            placeholder="Search menus by name, module, path..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            onChange={e => debouncedSearch(e.target.value)}
          />
          <FaSearch className="absolute top-4 left-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
      </div>

      {/* ── table ── */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {[
                  { label: 'Menu Name',   col: 'MenuName' },
                  { label: 'Module',      col: 'ModuleName' },
                  { label: 'Path',        col: 'MenuPath' },
                  { label: 'Parent',      col: null },
                  { label: 'Order',       col: 'DisplayOrder' },
                  { label: 'Controller',  col: 'ControllerName' },
                  { label: 'Action',      col: 'ActionName' },
                  { label: 'Actions',     col: null },
                ].map(({ label, col }) => (
                  <th
                    key={label}
                    className={`px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap ${col ? 'cursor-pointer hover:text-indigo-600 select-none' : ''}`}
                    onClick={col ? () => handleSort(col) : undefined}
                  >
                    {label}
                    {col && <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : menus.length > 0 ? (
                menus.map(menu => (
                  <tr key={menu.menuID} className="group hover:bg-gray-50/60 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 text-sm flex-shrink-0">
                          <FaSitemap size={12} />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{menu.menuName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100">
                        {menu.moduleName || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                        <FaLink size={10} className="text-gray-300" />
                        {menu.menuPath || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {getParentName(menu.parentID)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-xs font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        {menu.displayOrder}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-400">{menu.controllerName || '—'}</td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-400">{menu.actionName || '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`btn-edit-menu-${menu.menuID}`}
                          onClick={() => openEdit(menu)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          id={`btn-delete-menu-${menu.menuID}`}
                          onClick={() => setDeleteTarget(menu)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-gray-400 font-bold italic">
                    No menus found. Click "Add Menu" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="p-5 bg-gray-50/30 border-t border-gray-100">
          <ProfessionalPagination
            count={totalMenus}
            page={currentPage}
            rowsPerPage={itemsPerPage}
            onPageChange={p => setCurrentPage(p)}
            onRowsPerPageChange={r => { setItemsPerPage(r); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* modal header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  {editMenu ? <FaEdit className="text-indigo-500" /> : <FaPlus className="text-indigo-500" />}
                  {editMenu ? 'Edit Menu' : 'Add New Menu'}
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                  {editMenu ? `Editing: ${editMenu.menuName}` : 'Create a new navigation menu item'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* modal form */}
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Menu Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Menu Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaSitemap className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      id="menu-name-input"
                      type="text"
                      name="menuName"
                      value={form.menuName}
                      onChange={handleFormChange}
                      placeholder="e.g. Dashboard, Products, Reports"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Module Name */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaFolder className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="text"
                      name="moduleName"
                      value={form.moduleName}
                      onChange={handleFormChange}
                      placeholder="e.g. Inventory, Sales, HR"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Menu Path */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Menu Path <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLink className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="text"
                      name="menuPath"
                      value={form.menuPath}
                      onChange={handleFormChange}
                      placeholder="e.g. /dashboard, /inventory/products"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Menu Icon */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Menu Icon
                  </label>
                  <div className="relative">
                    <FaHashtag className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="text"
                      name="menuIcon"
                      value={form.menuIcon}
                      onChange={handleFormChange}
                      placeholder="e.g. FaDashboard, FaBox"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Display Order
                  </label>
                  <div className="relative">
                    <FaHashtag className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="number"
                      name="displayOrder"
                      value={form.displayOrder}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Controller Name */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Controller Name
                  </label>
                  <div className="relative">
                    <FaCode className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="text"
                      name="controllerName"
                      value={form.controllerName}
                      onChange={handleFormChange}
                      placeholder="e.g. Products, Orders"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Action Name */}
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Action Name
                  </label>
                  <div className="relative">
                    <FaChevronRight className="absolute left-4 top-4 text-gray-300" size={14} />
                    <input
                      type="text"
                      name="actionName"
                      value={form.actionName}
                      onChange={handleFormChange}
                      placeholder="e.g. Index, List, Create"
                      className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Parent Menu */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Parent Menu (optional)
                  </label>
                  <select
                    name="parentID"
                    value={form.parentID}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium bg-white"
                  >
                    <option value="">— No Parent (Top Level) —</option>
                    {allMenus
                      .filter(m => !editMenu || m.menuID !== editMenu.menuID)
                      .map(m => (
                        <option key={m.menuID} value={m.menuID}>{m.menuName}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {/* footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-menu"
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaSave size={14} />
                  )}
                  {saving ? 'Saving...' : editMenu ? 'Update Menu' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Menu?</h3>
            <p className="text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="text-indigo-700 font-black text-lg mb-6">"{deleteTarget.menuName}"</p>
            <p className="text-xs text-red-400 font-medium mb-6">
              This will also remove all role-menu assignments for this menu.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-6 py-3 text-gray-500 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                id={`btn-confirm-delete-${deleteTarget.menuID}`}
                onClick={handleDeleteConfirm}
                className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}