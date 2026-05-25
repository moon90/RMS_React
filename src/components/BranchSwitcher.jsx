import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import branchService from '../services/branchService';
import { FaBuilding, FaChevronDown, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BranchSwitcher = () => {
  const { selectedBranch, switchBranch } = useAuth();
  const [branches, setBranches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getAllBranches();
        if (response.data.isSuccess) {
          setBranches(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load branches");
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (branch) => {
    switchBranch(branch);
    setIsOpen(false);
    // Reload dashboard or stats if needed, or rely on Context to trigger updates
    window.location.reload(); // Hard reload for simplicity to clear all cached states
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
          selectedBranch 
          ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
          : 'bg-slate-50 border-slate-100 text-slate-600'
        }`}
      >
        <div className={`p-1.5 rounded-lg ${selectedBranch ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {selectedBranch ? <FaBuilding size={12} /> : <FaGlobe size={12} />}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-60">Location</span>
          <span className="text-sm font-bold tracking-tight leading-none">
            {selectedBranch ? selectedBranch.branchName : 'Global View'}
          </span>
        </div>
        <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 w-64 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Node</p>
          </div>
          
          <button
            onClick={() => handleSwitch(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm font-bold transition-colors ${!selectedBranch ? 'text-indigo-600' : 'text-slate-600'}`}
          >
            <FaGlobe className="opacity-50" />
            Global Dashboard
          </button>

          {branches.map(branch => (
            <button
              key={branch.branchID}
              onClick={() => handleSwitch(branch)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-sm font-bold transition-colors ${selectedBranch?.branchID === branch.branchID ? 'text-indigo-600' : 'text-slate-600'}`}
            >
              <FaMapMarkerAlt className="opacity-50" />
              {branch.branchName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSwitcher;
