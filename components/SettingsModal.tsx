import React, { useRef, useState } from 'react';
import { X, Download, Upload, Database, AlertCircle, Check, Globe } from 'lucide-react';
import { CollectionItem, Language } from '../types';
import { translations } from '../utils/i18n';

interface SettingsModalProps {
  onClose: () => void;
  collection: CollectionItem[];
  onImport: (data: CollectionItem[]) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, collection, onImport, language, onLanguageChange }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleExport = () => {
    const dataStr = JSON.stringify(collection, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `glassflix_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImport(json);
          setImportStatus('success');
          setStatusMsg(`Successfully imported ${json.length} items.`);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        setImportStatus('error');
        setStatusMsg("Failed to parse JSON file. Please ensure it is a valid GlassFlix backup.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Database size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.settings}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Language Section */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                        <Globe size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{t.language}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {t.languageSub}
                        </p>
                        <div className="flex gap-2 bg-black/20 p-1 rounded-lg inline-flex">
                            <button 
                                onClick={() => onLanguageChange('en')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    language === 'en' 
                                    ? 'bg-purple-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {t.english}
                            </button>
                            <button 
                                onClick={() => onLanguageChange('fr')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    language === 'fr' 
                                    ? 'bg-purple-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {t.french}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{t.export}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {t.exportSub}
                        </p>
                        <button 
                            onClick={handleExport}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <Download size={16} /> {t.downloadBackup}
                        </button>
                    </div>
                </div>
            </div>

            {/* Import Section */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                        <Upload size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{t.import}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {t.importSub}
                        </p>
                        
                        <input 
                            type="file" 
                            accept=".json" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            <Upload size={16} /> {t.selectFile}
                        </button>

                        {importStatus !== 'idle' && (
                            <div className={`mt-4 p-3 rounded-lg border text-sm flex items-center gap-2 ${
                                importStatus === 'success' 
                                ? 'bg-green-500/10 border-green-500/20 text-green-200' 
                                : 'bg-red-500/10 border-red-500/20 text-red-200'
                            }`}>
                                {importStatus === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {statusMsg}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 bg-black/20 text-center text-xs text-gray-500 border-t border-white/5">
            GlassFlix v1.0 • Data is stored locally in your browser.
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;