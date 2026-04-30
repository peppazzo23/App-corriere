import React, { useState, useEffect, useRef } from 'react';
import { db, addLog } from './db';
import { Users, ScanLine, Settings, Plus, Search, FileUp, Download, Upload, Trash2, Bell, UserCircle, MapPin, Phone, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('clienti');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCustomers = async () => {
    const data = await db.customers.toArray();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [showAddForm]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-slate-900">
      <header className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚚</span>
          <h1 className="font-black text-xl tracking-tighter text-[#0D1B2A]">GIUSEPPE</h1>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Bell size={20} />
          <UserCircle size={28} className="text-[#0D1B2A]" />
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'clienti' && (
          <ClientiSection 
            customers={filteredCustomers} 
            totalCount={customers.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAdd={() => setShowAddForm(true)} 
          />
        )}
        {activeTab === 'scanner' && <ScannerSection customers={customers} />}
        {activeTab === 'sistema' && <SistemaSection customers={customers} refresh={fetchCustomers} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-6 pb-8 shadow-lg z-30">
        <NavButton active={activeTab === 'clienti'} onClick={() => setActiveTab('clienti')} icon={<Users />} label="CLIENTI" />
        <NavButton active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} icon={<ScanLine />} label="SCANNER" />
        <NavButton active={activeTab === 'sistema'} onClick={() => setActiveTab('sistema')} icon={<Settings />} label="SISTEMA" />
      </nav>

      {showAddForm && <AddCustomerModal onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#FFD700]' : 'text-slate-400'}`}>
      <div className={`p-2 rounded-xl ${active ? 'bg-[#FFD700] text-white shadow-md' : ''}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function ClientiSection({ customers, totalCount, searchTerm, setSearchTerm, onAdd }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Gestione Clienti</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome o via..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FFD700]" 
          />
        </div>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase mb-1">Account in Archivio</p>
        <h2 className="text-5xl font-black">{totalCount}</h2>
      </div>

      <div className="space-y-3">
        {customers.length > 0 ? (
          customers.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-black text-[#0D1B2A] uppercase">{c.name}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <MapPin size={12} className="text-[#FFD700]" />
                {c.address}, {c.city}
              </div>
              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Phone size={12} className="text-[#FFD700]" />
                  {c.phone}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="font-bold text-[#0D1B2A]">Nessun cliente</h3>
            <button onClick={onAdd} className="mt-4 text-[#FFD700] font-bold text-sm uppercase">+ Aggiungi Ora</button>
          </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 active:scale-95 transition-transform">
        <Plus size={30} />
      </button>
    </div>
  );
}

function ScannerSection({ customers }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setResults([]); // Reset risultati precedenti
    } else {
      alert("Per favore seleziona un file PDF valido.");
    }
  };

  const handleStartScan = () => {
    if (!selectedFile) {
      alert("Seleziona prima un file PDF.");
      return;
    }
    setIsScanning(true);
    
    // Simulazione intelligenza artificiale che legge il PDF e confronta con DB locale
    setTimeout(() => {
      // Qui simuliamo il ritrovamento di 2 indirizzi che corrispondono al database
      const found = customers.slice(0, 2); 
      setResults(found);
      setIsScanning(false);
      addLog(`Scansione effettuata: ${selectedFile.name}`);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Scanner Consegne</h2>
      
      <input 
        type="file" 
        accept=".pdf" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
      />
      
      <div 
        onClick={() => fileInputRef.current.click()}
        className={`bg-white border-2 border-dashed ${selectedFile ? 'border-[#FFD700] bg-yellow-50' : 'border-slate-200'} rounded-3xl p-8 text-center flex flex-col items-center gap-4 cursor-pointer transition-all`}
      >
        {selectedFile ? (
          <>
            <FileText size={40} className="text-[#FFD700]" />
            <div>
              <h3 className="font-bold text-[#0D1B2A]">{selectedFile.name}</h3>
              <p className="text-[10px] text-slate-500 uppercase mt-1">File pronto per l'analisi</p>
            </div>
          </>
        ) : (
          <>
            <FileUp size={40} className="text-slate-300" />
            <h3 className="font-bold">Sfoglia Lista PDF</h3>
            <p className="text-xs text-slate-400">Tocca per caricare il documento</p>
          </>
        )}
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#FFD700]">Intelligence</h3>
        </div>
        <h2 className="text-2xl font-black mb-2">Analisi Percorso</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Il sistema confronterà gli indirizzi nel PDF con il tuo database locale.
        </p>
        <button 
          onClick={handleStartScan}
          disabled={!selectedFile || isScanning}
          className={`w-full py-4 rounded-xl font-black text-sm uppercase shadow-lg transition-all ${isScanning ? 'bg-slate-700 text-slate-400' : 'bg-[#FFD700] text-[#0D1B2A] active:scale-95'}`}
        >
          {isScanning ? 'Elaborazione in corso...' : 'Inizia Confronto'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Corrispondenze Rilevate</h3>
          {results.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-2xl border-l-4 border-[#FFD700] shadow-sm flex items-start gap-3">
              <CheckCircle2 className="text-[#FFD700] mt-1" size={18} />
              <div>
                <p className="font-black text-[#0D1B2A] text-sm uppercase">{r.name}</p>
                <p className="text-xs text-slate-500">{r.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SistemaSection({ customers, refresh }) {
  const exportBackup = () => {
    if (customers.length === 0) return alert("Nessun dato da esportare.");
    const dataStr = JSON.stringify(customers);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `giuseppe_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (res) => {
      try {
        const data = JSON.parse(res.target.result);
        await db.customers.bulkAdd(data);
        alert("Backup ripristinato!");
        refresh();
      } catch (err) { alert("File non valido."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Sistema</h2>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stato Database</p>
        <p className="text-4xl font-black text-[#0D1B2A]">{customers.length} <span className="text-sm font-normal text-slate-400">Record</span></p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button onClick={exportBackup} className="bg-[#FFD700] p-6 rounded-3xl text-[#0D1B2A] flex items-center justify-between shadow-lg shadow-yellow-100 active:scale-95 transition-transform">
          <div className="text-left">
            <h3 className="font-black uppercase text-sm">Esporta Backup</h3>
            <p className="text-[10px] opacity-70 font-bold">Scarica file .JSON</p>
          </div>
          <Download size={24} />
        </button>

        <label className="bg-[#0D1B2A] p-6 rounded-3xl text-white flex items-center justify-between shadow-xl active:scale-95 transition-transform cursor-pointer">
          <div className="text-left">
            <h3 className="font-black uppercase text-sm">Importa Backup</h3>
            <p className="text-[10px] text-slate-400 font-bold">Carica file .JSON</p>
          </div>
          <Upload size={24} className="text-[#FFD700]" />
          <input type="file" accept=".json" onChange={importBackup} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function AddCustomerModal({ onClose }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await db.customers.add({
      name: fd.get('name'),
      phone: fd.get('phone'),
      city: fd.get('city'),
      address: fd.get('address'),
      instructions: fd.get('instructions')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-6 pt-12">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="bg-yellow-100 text-[#FFD700] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">Anagrafica</span>
            <h2 className="text-4xl font-black text-[#0D1B2A] mt-2">Nuovo Cliente</h2>
          </div>
          <button onClick={onClose} className="text-slate-300 font-bold text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ragione Sociale</label>
            <input name="name" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Nome Azienda..." />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Telefono</label>
            <input name="phone" className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="+39..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Città</label>
              <input name="city" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Milano" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Indirizzo</label>
              <input name="address" required className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Via..." />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Note Scarico</label>
            <textarea name="instructions" className="w-full p-4 bg-slate-100 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Orari, citofono..."></textarea>
          </div>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-3xl font-black text-sm uppercase mt-6 shadow-xl shadow-yellow-100 active:scale-95 transition-transform">Salva Cliente</button>
        </form>
      </div>
    </div>
  );
}
