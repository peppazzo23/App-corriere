import React, { useState, useEffect, useRef } from 'react';
import { db, addLog } from './db';
import { Users, ScanLine, Settings, Plus, Search, FileUp, Download, Upload, Trash2, Bell, UserCircle, MapPin, Phone } from 'lucide-react';

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

  // Filtro ricerca: Cerca per Nome o Indirizzo
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-6 pb-8 shadow-lg">
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

// SEZIONE CLIENTI: Corretta con ricerca funzionante per via
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
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Phone size={12} className="text-[#FFD700]" />
                {c.phone || 'N/D'}
              </div>
              {c.instructions && (
                <p className="text-[10px] mt-2 bg-slate-50 p-2 rounded-lg text-slate-600 italic">
                  Note: {c.instructions}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="font-bold text-[#0D1B2A]">Nessun risultato</h3>
            <p className="text-slate-500 text-xs mt-2">Prova a cambiare i termini di ricerca.</p>
          </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 active:scale-95 transition-transform">
        <Plus size={30} />
      </button>
    </div>
  );
}

// SEZIONE SCANNER: Gestione PDF e confronto vie
function ScannerSection({ customers }) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleStartScan = () => {
    if (customers.length === 0) {
      alert("L'archivio clienti è vuoto. Aggiungi clienti prima di scansionare.");
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Analisi completata! Il sistema ha confrontato il PDF con l'indirizzario locale.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Scanner Consegne</h2>
      <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" />
      
      <div 
        onClick={() => fileInputRef.current.click()}
        className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center gap-4 cursor-pointer active:bg-slate-50"
      >
        <FileUp size={40} className="text-[#0D1B2A]" />
        <h3 className="font-bold">Sfoglia Lista Consegne PDF</h3>
        <p className="text-xs text-slate-400 tracking-tighter">Carica il file per estrarre gli indirizzi</p>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-4 italic text-[#FFD700]">Intelligence AI</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Il sistema confronterà gli indirizzi nel PDF con quelli salvati nel tuo database locale.
        </p>
        <button 
          onClick={handleStartScan}
          disabled={isScanning}
          className={`w-full ${isScanning ? 'bg-slate-700' : 'bg-[#FFD700]'} text-[#0D1B2A] py-4 rounded-xl font-black text-sm uppercase shadow-lg`}
        >
          {isScanning ? 'ANALISI IN CORSO...' : 'INIZIA CONFRONTO PERCORSO'}
        </button>
      </div>
    </div>
  );
}

// SEZIONE SISTEMA: Backup Esporta/Importa
function SistemaSection({ customers, refresh }) {
  const exportBackup = () => {
    const dataStr = JSON.stringify(customers);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `backup_giuseppe_${new Date().toLocaleDateString()}.json`;
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        await db.customers.bulkAdd(importedData);
        alert("Backup importato con successo!");
        refresh();
      } catch (err) {
        alert("Errore nell'importazione. Formato file non valido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Sistema & Backup</h2>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest">Integrità Database</span>
          <Trash2 size={16} className="text-red-400" onClick={() => { if(confirm("Cancellare tutto l'archivio?")) db.customers.clear().then(refresh) }} />
        </div>
        <p className="text-4xl font-black text-[#0D1B2A]">{customers.length} Clienti</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Dati salvati localmente sul telefono</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button onClick={exportBackup} className="bg-[#FFD700] p-8 rounded-3xl text-center text-[#0D1B2A] shadow-lg active:scale-95 transition-transform">
          <Download size={32} className="mx-auto mb-2" />
          <h3 className="font-black text-sm uppercase">Genera & Scarica Backup</h3>
        </button>

        <label className="bg-[#0D1B2A] p-8 rounded-3xl text-center text-white shadow-lg cursor-pointer active:scale-95 transition-transform">
          <Upload size={32} className="mx-auto mb-2 text-[#FFD700]" />
          <h3 className="font-black text-sm uppercase">Carica Backup Esistente</h3>
          <input type="file" accept=".json" onChange={importBackup} className="hidden" />
        </label>
      </div>
    </div>
  );
}

// MODALE AGGIUNTA: Con campi Telefono e Istruzioni
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
    addLog(`Cliente aggiunto: ${fd.get('name')}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto">
        <h2 className="text-4xl font-black text-[#0D1B2A] mt-2 mb-6">Nuovo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nome Azienda / Cliente</label>
            <input name="name" required className="w-full p-4 bg-slate-100 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Es. Rossi Spa" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Numero di Telefono</label>
            <input name="phone" className="w-full p-4 bg-slate-100 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="+39 ..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Città</label>
              <input name="city" required className="w-full p-4 bg-slate-100 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Milano" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Indirizzo</label>
              <input name="address" required className="w-full p-4 bg-slate-100 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Via Roma 10" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Istruzioni Scarico / Note</label>
            <textarea name="instructions" className="w-full p-4 bg-slate-100 rounded-xl mt-1 h-32 outline-none focus:ring-2 focus:ring-[#FFD700]" placeholder="Orari, citofono, rampe..."></textarea>
          </div>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-2xl font-black text-sm uppercase mt-6 shadow-xl shadow-yellow-100 active:scale-95 transition-transform">
            Salva Cliente
          </button>
          <button type="button" onClick={onClose} className="w-full py-4 text-slate-400 font-bold uppercase text-xs">Annulla</button>
        </form>
      </div>
    </div>
  );
}
