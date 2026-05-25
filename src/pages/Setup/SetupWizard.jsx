import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import systemService from '../../services/systemService';
import { toast } from 'react-toastify';
import { 
  FaBuilding, 
  FaUserShield, 
  FaCogs, 
  FaArrowRight, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaUtensils, 
  FaGlobe, 
  FaLock, 
  FaRocket,
  FaPercentage,
  FaPalette,
  FaDatabase
} from 'react-icons/fa';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbChecking, setIsDbChecking] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationCode: 'HQ-01',
    address: '',
    currencyCode: 'USD',
    currencySymbol: '$',
    adminUserName: 'admin',
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
    logoBase64: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#DA291C',
    defaultTaxRate: 15,
    serviceChargeRate: 5
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await systemService.getStatus();
        if (response.data.data.isInitialized) {
          toast.info("System is already configured.");
          navigate('/login');
        }
      } catch (err) {
        console.error("Initialization check failed");
      }
    };
    checkStatus();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const testDb = async () => {
    setIsDbChecking(true);
    setDbStatus(null);
    try {
      const res = await systemService.testConnection();
      if (res.data.isSuccess) {
        setDbStatus({ success: true, message: res.data.message });
        toast.success(res.data.message);
      }
    } catch (err) {
      setDbStatus({ success: false, message: err.response?.data?.message || "Connection Failed" });
      toast.error("Database unavailable.");
    } finally {
      setIsDbChecking(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await systemService.initialize(formData);
      if (response.data.isSuccess) {
        if (formData.seedDemo) {
            toast.info("Deploying Demo Ecosystem... please wait.");
            await systemService.seedDemoData();
        }
        toast.success("System initialized! Welcome to RMS.");
        navigate('/login');
      } else {
        toast.error(response.data.message || "Setup failed.");
      }
    } catch (err) {
      toast.error("Critical error during setup.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-16">
      {[1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-lg ${step >= i ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-100 text-slate-400'}`}>
            {step > i ? <FaCheckCircle /> : i}
          </div>
          {i < 4 && <div className={`w-12 h-1 bg-slate-100 rounded-full overflow-hidden`}>
             <div className={`h-full bg-indigo-600 transition-all duration-700 ${step > i ? 'w-full' : 'w-0'}`}></div>
          </div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl mb-6">
            <FaUtensils className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">RMS. Setup Wizard</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs italic">Powering your restaurant's digital transformation</p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-[3rem] shadow-2xl p-10 lg:p-16 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* STEP 1: ORGANIZATION & DB */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">The Empire</h3>
                        <p className="text-slate-400 font-bold text-sm">Verify your database and define headquarters.</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={testDb}
                        disabled={isDbChecking}
                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${dbStatus?.success ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                    >
                        <FaDatabase className={isDbChecking ? 'animate-bounce' : ''} />
                        {isDbChecking ? 'Checking Link...' : dbStatus?.success ? 'Neural Link Ready' : 'Test DB Connection'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Company Name</label>
                    <div className="relative">
                      <FaBuilding className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                      <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} placeholder="e.g. Gourmet Group HQ" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner" required />
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Base Currency</label>
                    <div className="relative">
                      <FaGlobe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-all" />
                      <select name="currencyCode" value={formData.currencyCode} onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner appearance-none">
                         <option value="USD">USD ($)</option>
                         <option value="EUR">EUR (€)</option>
                         <option value="GBP">GBP (£)</option>
                         <option value="BDT">BDT (৳)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="group">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Global Headquarters Address</label>
                   <textarea name="address" value={formData.address} onChange={handleChange} placeholder="The physical heart of your operations..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner min-h-[100px]" />
                </div>
              </div>
            )}

            {/* STEP 2: BRANDING */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Identity & Aesthetics <FaPalette className="text-indigo-600 opacity-20" />
                    </h3>
                    <p className="text-slate-400 font-bold text-sm">Upload your logo and choose system colors.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="md:col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center md:text-left">Official Logo</label>
                        <div className="relative group w-40 h-40 mx-auto md:mx-0">
                            <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden group-hover:border-indigo-400 transition-colors shadow-inner">
                                {formData.logoBase64 ? (
                                    <img src={formData.logoBase64} alt="Preview" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <FaBuilding className="text-slate-200 text-4xl" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase">Upload PNG</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Branding Tone</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 focus-within:border-indigo-600 transition-all shadow-inner">
                                    <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                                    <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="bg-transparent font-black text-sm text-slate-700 outline-none uppercase w-full" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Accent Secondary</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 focus-within:border-indigo-600 transition-all shadow-inner">
                                    <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                                    <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="bg-transparent font-black text-sm text-slate-700 outline-none uppercase w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                             <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">System-Wide Impact: These colors will define your buttons, data charts, and terminal highlights across all global nodes.</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADMIN */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">The Master Key</h3>
                    <p className="text-slate-400 font-bold text-sm">Create the root administrator account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Admin Full Name</label>
                    <input type="text" name="adminFullName" value={formData.adminFullName} onChange={handleChange} placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner" required />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Admin Email</label>
                    <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@rms.com" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Master Username</label>
                    <input type="text" name="adminUserName" value={formData.adminUserName} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner" required />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-600">Secure Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="••••••••" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 shadow-inner" required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PREFERENCES */}
            {step === 4 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">The Engine</h3>
                    <p className="text-slate-400 font-bold text-sm">Fine-tune global financial settings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group bg-indigo-50/50 p-8 rounded-[2rem] border-2 border-indigo-100/50 shadow-inner">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><FaPercentage /></div>
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Default Tax (VAT/GST)</h4>
                    </div>
                    <input type="number" name="defaultTaxRate" value={formData.defaultTaxRate} onChange={handleChange} className="w-full text-4xl font-black text-indigo-600 bg-transparent outline-none border-none text-center md:text-left" />
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Percentage applied to all orders</p>
                  </div>

                  <div className="group bg-orange-50/50 p-8 rounded-[2rem] border-2 border-orange-100/50 shadow-inner">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-500 rounded-xl text-white shadow-lg"><FaRocket /></div>
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Service Charge</h4>
                    </div>
                    <input type="number" name="serviceChargeRate" value={formData.serviceChargeRate} onChange={handleChange} className="w-full text-4xl font-black text-orange-500 bg-transparent outline-none border-none text-center md:text-left" />
                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Automatic Dine-In gratuity</p>
                  </div>
                </div>

                <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6 shadow-xl shadow-emerald-500/5">
                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                        <FaCheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-800 uppercase tracking-widest">Configuration Validation Ready</p>
                        <p className="text-xs text-emerald-600/70 font-bold mt-1 leading-relaxed">System architecture is validated. Clicking 'Initialize' will apply your branding, setup your headquarters, and secure the master node.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-6 bg-indigo-50/30 rounded-3xl border-2 border-dashed border-indigo-100/50">
                    <input 
                        type="checkbox" 
                        id="seedDemo" 
                        className="w-5 h-5 rounded-lg border-2 border-indigo-200 text-indigo-600 focus:ring-indigo-500" 
                        onChange={(e) => setFormData({...formData, seedDemo: e.target.checked})}
                    />
                    <label htmlFor="seedDemo" className="flex-1">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Deploy Demo Ecosystem</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Includes mock branches, staff performance, and 30-day sales history.</span>
                    </label>
                </div>
              </div>
            )}

            {/* NAVIGATION */}
            <div className="flex items-center justify-between pt-10 border-t border-slate-100">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">
                  <FaArrowLeft /> Back
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button type="button" onClick={nextStep} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
                  Next Step <FaArrowRight />
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all disabled:opacity-50">
                  {isLoading ? 'Synchronizing Node Cluster...' : <><FaCogs /> Initialize System</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
