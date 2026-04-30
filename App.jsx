import React, { useState, useEffect, useRef } from 'react';
import { db, addLog } from './db';
import { 
  Users, ScanLine, Settings, Plus, Search, FileUp, 
  Download, Upload, Trash2, Bell, UserCircle, MapPin, 
  Phone, FileText, CheckCircle2, X, Edit2, Save 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('clienti');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    const data = await db.customers.toArray();
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [showAddForm, selectedCustomer]);

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
            onSelect={(c) => setSelectedCustomer(c)}
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
      
      {selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
          onRefresh={fetchCustomers}
        />
      )}
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

// --- SEZIONE CLIENTI CON RICERCA DINAMICA ---
function ClientiSection({ customers, totalCount, searchTerm, setSearchTerm, onAdd, onSelect }) {
  // Mostriamo la lista solo se c'è una ricerca attiva o se i clienti sono pochi
  const shouldShowList = searchTerm.length > 0 || totalCount < 5;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Anagrafica</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome o via..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#FFD700] transition-all font-medium" 
          />
        </div>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase mb-1">Account in Archivio</p>
        <h2 className="text-5xl font-black">{totalCount}</h2>
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <Users size={120} />
        </div>
      </div>

      <div className="space-y-3">
        {shouldShowList ? (
          customers.length > 0 ? (
            customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => onSelect(c)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="min-w-0">
                  <h4 className="font-black text-[#0D1B2A] uppercase truncate">{c.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <MapPin size={12} className="text-[#FFD700] shrink-0" />
                    <span className="truncate">{c.address}, {c.city}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-slate-300">
                    <Plus size={16} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
               <p className="text-slate-400 text-sm font-bold uppercase">Nessuna corrispondenza</p>
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Search size={30} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-10">
              Usa la barra sopra per cercare un cliente specifico
            </p>
          </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 active:scale-95 transition-transform border-4 border-white">
        <Plus size={30} />
      </button>
    </div>
  );
}

// --- MODALE DETTAGLIO, MODIFICA ED ELIMINAZIONE ---
function CustomerDetailModal({ customer, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...customer});

  const handleDelete = async () => {
    if(confirm(`Sei sicuro di voler eliminare ${customer.name}?`)) {
      await db.customers.delete(customer.id);
      addLog(`Eliminato cliente: ${customer.name}`);
      onRefresh();
      onClose();
    }
  };

  const handleUpdate = async () => {
    await db.customers.update(customer.id, editedData);
    addLog(`Aggiornato cliente: ${editedData.name}`);
    setIsEditing(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-2xl">
            <UserCircle size={24} className="text-[#FFD700]" />
          </div>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input 
              value={editedData.name} 
              onChange={e => setEditedData({...editedData, name: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFD700] font-bold uppercase"
              placeholder="Ragione Sociale"
            />
            <input 
              value={editedData.address} 
              onChange={e => setEditedData({...editedData, address: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="Indirizzo"
            />
             <input 
              value={editedData.city} 
              onChange={e => setEditedData({...editedData, city: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="Città"
            />
            <textarea 
              value={editedData.instructions} 
              onChange={e => setEditedData({...editedData, instructions: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="Note scarico"
            />
            <button onClick={handleUpdate} className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2">
              <Save size={18} /> Salva Modifiche
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#0D1B2A] uppercase leading-tight">{customer.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Dettaglio Anagrafica</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-xl text-slate-500"><MapPin size={20} /></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Località</p>
                  <p className="font-bold text-[#0D1B2A]">{customer.address}, {customer.city}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-xl text-slate-500"><Phone size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Contatto</p>
                    <p className="font-bold text-[#0D1B2A]">{customer.phone}</p>
                  </div>
                </div>
              )}

              {customer.instructions && (
                <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100">
                  <p className="text-[10px] font-black text-[#FFD700] uppercase mb-2 italic">Istruzioni Scarico:</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{customer.instructions}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 pb-4">
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 py-4 bg-slate-100 rounded-2xl text-[#0D1B2A] font-black text-xs uppercase">
                <Edit2 size={16} /> Modifica
              </button>
              <button onClick={handleDelete} className="flex items-center justify-center gap-2 py-4 bg-red-50 rounded-2xl text-red-500 font-black text-xs uppercase">
                <Trash2 size={16} /> Elimina
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SCANNER SECTION ---
function ScannerSection({ customers }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setResults([]); 
    }
  };

  const handleStartScan = () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setTimeout(() => {
      setResults([...customers]); 
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Scanner</h2>
      <div 
        onClick={() => fileInputRef.current.click()}
        className={`bg-white border-2 border-dashed ${selectedFile ? 'border-[#FFD700]' : 'border-slate-200'} rounded-[40px] p-10 text-center cursor-pointer`}
      >
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {selectedFile ? <p className="font-bold uppercase text-xs">{selectedFile.name}</p> : <FileUp className="mx-auto text-slate-300" size={40} />}
      </div>
      <button 
        onClick={handleStartScan}
        className="w-full py-5 bg-[#0D1B2A] text-white rounded-[25px] font-black uppercase shadow-xl active:scale-95 transition-all"
      >
        {isScanning ? 'Analisi...' : 'Avvia Confronto'}
      </button>
      
      {results.length > 0 && (
        <div className="grid gap-3 mt-6">
          {results.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-3xl border-l-8 border-[#FFD700] shadow-sm flex items-center gap-4">
              <CheckCircle2 className="text-[#FFD700]" />
              <div>
                <p className="font-black text-xs uppercase">{r.name}</p>
                <p className="text-[10px] text-slate-400">{r.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SISTEMA SECTION ---
function SistemaSection({ customers, refresh }) {
  const exportBackup = () => {
    const dataStr = JSON.stringify(customers);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `backup_giuseppe.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Sistema</h2>
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[3px] mb-2">Stato Database</p>
        <p className="text-5xl font-black text-[#0D1B2A]">{customers.length}</p>
        <p className="text-xs font-bold text-slate-400 uppercase mt-1">Clienti Totali</p>
      </div>
      <button onClick={exportBackup} className="w-full bg-[#FFD700] p-6 rounded-[30px] font-black uppercase text-sm flex items-center justify-between">
        Esporta Dati <Download />
      </button>
    </div>
  );
}

// --- AGGIUNTA CLIENTE ---
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
    <div className="fixed inset-0 bg-white z-[100] p-6 pt-12">
       <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-[#0D1B2A]">Nuovo</h2>
          <button onClick={onClose} className="bg-slate-100 p-3 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" required className="w-full p-5 bg-slate-50 rounded-[25px] outline-none font-bold" placeholder="NOME AZIENDA" />
          <input name="city" required className="w-full p-5 bg-slate-50 rounded-[25px] outline-none" placeholder="CITTÀ" />
          <input name="address" required className="w-full p-5 bg-slate-50 rounded-[25px] outline-none" placeholder="VIA / INDIRIZZO" />
          <textarea name="instructions" className="w-full p-5 bg-slate-50 rounded-[25px] h-32 outline-none" placeholder="NOTE SCARICO..."></textarea>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-[30px] font-black uppercase shadow-lg shadow-yellow-100">Salva in Archivio</button>
        </form>
       </div>
    </div>
  );
}
