import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLanguage, FaChevronDown } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-600 transition-all active:scale-95 hover:bg-slate-100"
      >
        <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
          <FaLanguage size={14} />
        </div>
        <div className="flex flex-col items-start hidden lg:flex">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-60">Language</span>
          <span className="text-sm font-bold tracking-tight leading-none uppercase">{currentLanguage.code}</span>
        </div>
        <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-48 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Language</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 text-sm font-bold transition-colors ${currentLanguage.code === lang.code ? 'text-indigo-600' : 'text-slate-600'}`}
            >
              <div className="flex items-center gap-3">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {currentLanguage.code === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
