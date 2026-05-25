import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { systemSettingService } from '../services/systemSettingService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSetting, setIsAddingSetting] = useState(false);
  const [newSetting, setNewSetting] = useState({ settingKey: '', settingValue: '', settingGroup: 'General', settingType: 'String' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await systemSettingService.getAllSettings();
      console.log("System Settings API Response:", data);
      if (data.isSuccess || data.IsSuccess) {
        setSettings(data.data || data.Data || []);
      }
    } catch (error) {
      console.error("Settings Fetch Error:", error);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => prev.map(s => {
      const sKey = s.settingKey || s.SettingKey;
      return sKey === key ? { ...s, settingValue: value, SettingValue: value } : s;
    }));
  };

  const handleImageUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleSettingChange(key, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (key) => {
    handleSettingChange(key, '');
  };

  const handleSave = async () => {
    try {
      const updateDtos = settings.map(s => ({
        settingKey: s.settingKey || s.SettingKey,
        settingValue: s.settingValue ?? s.SettingValue ?? ''
      }));
      const data = await systemSettingService.updateSettingsBulk(updateDtos);
      if (data.isSuccess || data.IsSuccess) {
        toast.success("Settings saved successfully!");
        
        // Update Page Title
        const pageTitle = settings.find(s => (s.settingKey || s.SettingKey) === 'PageTitle');
        const titleValue = pageTitle?.settingValue || pageTitle?.SettingValue;
        if (titleValue) document.title = titleValue;

        // Update Favicon (Forced Update)
        const favicon = settings.find(s => (s.settingKey || s.SettingKey) === 'Favicon');
        const faviconValue = favicon?.settingValue || favicon?.SettingValue;
        if (faviconValue) {
          // Remove all existing favicon links
          const existingLinks = document.querySelectorAll("link[rel*='icon']");
          existingLinks.forEach(link => link.parentNode.removeChild(link));

          // Create a fresh new link
          const link = document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          // Add a timestamp if it's a URL to bust cache, otherwise use base64
          link.href = faviconValue.startsWith('data:') ? faviconValue : `${faviconValue}?t=${new Date().getTime()}`;
          document.head.appendChild(link);
          
          console.log("Favicon updated to:", link.href.substring(0, 50) + "...");
        }
        
        // Update App Logo (if any elements with id 'app-logo' exist)
        const logo = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantLogo');
        const logoValue = logo?.settingValue || logo?.SettingValue;
        if (logoValue) {
            const logoElements = document.querySelectorAll('#app-logo');
            logoElements.forEach(el => el.src = logoValue);
        }

        // Update App Name (if any elements with id 'app-name' exist)
        const nameSetting = settings.find(s => (s.settingKey || s.SettingKey) === 'RestaurantName');
        const nameValue = nameSetting?.settingValue || nameSetting?.SettingValue;
        if (nameValue) {
            const nameElements = document.querySelectorAll('#app-name');
            nameElements.forEach(el => el.innerText = nameValue);
        }
      }
    } catch (error) {
      toast.error("Failed to save settings.");
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.settingKey) {
      toast.error("Setting Key is required.");
      return;
    }
    try {
      const data = await systemSettingService.createSetting(newSetting);
      if (data.isSuccess || data.IsSuccess) {
        toast.success("New setting added!");
        setIsAddingSetting(false);
        setNewSetting({ settingKey: '', settingValue: '', settingGroup: 'General', settingType: 'String' });
        fetchSettings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add setting.");
    }
  };

  const handleDeleteSetting = (id, key) => {
    if (window.confirm(`Are you sure you want to delete the setting: ${key}?`)) {
      systemSettingService.deleteSetting(id).then(data => {
        if (data.isSuccess || data.IsSuccess) {
          toast.success("Setting deleted.");
          fetchSettings();
        }
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-600 font-semibold">Loading system settings...</div>;

  const getSetting = (key) => {
    const setting = settings.find(s => (s.settingKey || s.SettingKey) === key);
    return (setting?.settingValue ?? setting?.SettingValue) || '';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddingSetting(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-semibold"
          >
            + Add New Setting
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          {['general', 'localization', 'appearance', 'pos_settings', 'receipt', 'advanced'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.replace('_', ' ').charAt(0).toUpperCase() + tab.replace('_', ' ').slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('RestaurantName')} 
                    onChange={(e) => handleSettingChange('RestaurantName', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('PageTitle')} 
                    onChange={(e) => handleSettingChange('PageTitle', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Address</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    rows="2"
                    value={getSetting('RestaurantAddress')} 
                    onChange={(e) => handleSettingChange('RestaurantAddress', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('RestaurantPhone')} 
                    onChange={(e) => handleSettingChange('RestaurantPhone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('RestaurantEmail')} 
                    onChange={(e) => handleSettingChange('RestaurantEmail', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">VAT/TRN Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('VATNumber')} 
                    onChange={(e) => handleSettingChange('VATNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Localization</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('CurrencySymbol')} 
                    onChange={(e) => handleSettingChange('CurrencySymbol', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Zone</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    value={getSetting('TimeZone')}
                    onChange={(e) => handleSettingChange('TimeZone', e.target.value)}
                  >
                    <option value="Central European Time (CET)">Central European Time (CET)</option>
                    <option value="Eastern Standard Time (EST)">Eastern Standard Time (EST)</option>
                    <option value="Pacific Standard Time (PST)">Pacific Standard Time (PST)</option>
                    <option value="Gulf Standard Time (GST)">Gulf Standard Time (GST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Appearance & Branding</h2>
              
              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Restaurant Logo */}
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Restaurant Logo</label>
                    <div className="relative group overflow-hidden border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 hover:border-blue-300 transition-all p-6 text-center">
                      {getSetting('RestaurantLogo') ? (
                        <div className="relative inline-block">
                          <img 
                            src={getSetting('RestaurantLogo')} 
                            alt="Logo Preview" 
                            className="max-h-40 max-w-full object-contain rounded-xl shadow-lg bg-white p-2"
                          />
                          <button 
                            onClick={() => handleRemoveImage('RestaurantLogo')}
                            className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-10"
                            title="Remove Logo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center">
                          <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No logo uploaded yet</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold cursor-pointer hover:bg-blue-700 transition shadow-md">
                          Choose Logo
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => handleImageUpload('RestaurantLogo', e.target.files[0])}
                          />
                        </label>
                        <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Recommended: Square or Horizontal (PNG/JPG)</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Favicon (Tab Icon)</label>
                    <div className="relative group overflow-hidden border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 hover:border-blue-300 transition-all p-6 text-center">
                      {getSetting('Favicon') ? (
                        <div className="relative inline-block">
                          <img 
                            src={getSetting('Favicon')} 
                            alt="Favicon Preview" 
                            className="w-16 h-16 object-contain rounded-lg shadow-md bg-white p-2"
                          />
                          <button 
                            onClick={() => handleRemoveImage('Favicon')}
                            className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-10"
                            title="Remove Favicon"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center">
                          <div className="w-12 h-12 mb-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No icon uploaded</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold cursor-pointer hover:bg-blue-700 transition shadow-md">
                          Choose Icon
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => handleImageUpload('Favicon', e.target.files[0])}
                          />
                        </label>
                        <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Recommended: Square 32x32 (ICO/PNG)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Branding Color</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" 
                      value={getSetting('PrimaryColor') || '#1e40af'} 
                      onChange={(e) => handleSettingChange('PrimaryColor', e.target.value)}
                    />
                    <input 
                      type="text"
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      value={getSetting('PrimaryColor') || '#1e40af'}
                      onChange={(e) => handleSettingChange('PrimaryColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pos_settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">POS Workflow Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Tax Rate (%)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('DefaultTaxRate')} 
                    onChange={(e) => handleSettingChange('DefaultTaxRate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Service Charge (%)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    value={getSetting('ServiceChargeRate')} 
                    onChange={(e) => handleSettingChange('ServiceChargeRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <div>
                    <h3 className="font-semibold text-gray-800">Auto-Print KOT</h3>
                    <p className="text-sm text-gray-500">Automatically print tickets to kitchen on order</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500"
                    checked={getSetting('AutoPrintKOT') === 'true'}
                    onChange={(e) => handleSettingChange('AutoPrintKOT', e.target.checked.toString())}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <div>
                    <h3 className="font-semibold text-gray-800">Auto-Print Receipt</h3>
                    <p className="text-sm text-gray-500">Automatically print customer bill after payment</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500"
                    checked={getSetting('AutoPrintReceipt') === 'true'}
                    onChange={(e) => handleSettingChange('AutoPrintReceipt', e.target.checked.toString())}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Receipt Customization</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Header Note</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    rows="3"
                    placeholder="Welcome message..."
                    value={getSetting('ReceiptHeaderNote')} 
                    onChange={(e) => handleSettingChange('ReceiptHeaderNote', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Footer Note</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" 
                    rows="3"
                    placeholder="Thank you message..."
                    value={getSetting('ReceiptFooterNote')} 
                    onChange={(e) => handleSettingChange('ReceiptFooterNote', e.target.value)}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-blue-800 font-semibold mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Tip
                  </h3>
                  <p className="text-blue-700 text-sm">
                    These notes will appear at the top and bottom of every printed customer receipt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Advanced Settings</h2>
              <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                Warning: These settings are core system parameters. Editing them may affect application behavior.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left">Key</th>
                      <th className="px-4 py-2 text-left">Value</th>
                      <th className="px-4 py-2 text-left">Group</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {settings.map((s) => (
                      <tr key={s.id || s.Id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono">{s.settingKey || s.SettingKey}</td>
                        <td className="px-4 py-2 text-gray-600 truncate max-w-xs">{(s.settingValue ?? s.SettingValue) || '-'}</td>
                        <td className="px-4 py-2 text-xs font-medium text-blue-600">{s.settingGroup || s.SettingGroup}</td>
                        <td className="px-4 py-2 text-right">
                          <button 
                            onClick={() => handleDeleteSetting(s.id || s.Id, s.settingKey || s.SettingKey)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Setting"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-blue-600 text-white font-bold py-3 px-12 rounded-xl hover:bg-blue-700 shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      {/* Add Setting Modal */}
      {isAddingSetting && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Setting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Setting Key (e.g. ApiEndpoint)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newSetting.settingKey}
                  onChange={(e) => setNewSetting({...newSetting, settingKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Setting Value</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newSetting.settingValue}
                  onChange={(e) => setNewSetting({...newSetting, settingValue: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Group</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newSetting.settingGroup}
                    onChange={(e) => setNewSetting({...newSetting, settingGroup: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Appearance">Appearance</option>
                    <option value="POS">POS</option>
                    <option value="Localization">Localization</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newSetting.settingType}
                    onChange={(e) => setNewSetting({...newSetting, settingType: e.target.value})}
                  >
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Image">Image</option>
                    <option value="Color">Color</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsAddingSetting(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
              <button onClick={handleAddSetting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-bold transition">Add Setting</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
