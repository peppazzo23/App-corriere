import React, { useState, useEffect, useRef } from 'react';
import { db, addLog } from './db';
import Papa from 'papaparse';
import { 
  Users, ScanLine, Settings, Plus, Search, FileUp, 
  Download, Upload, Trash2, Bell, UserCircle, MapPin, 
  Phone, CheckCircle2, X, Edit2, Save, ChevronRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurazione Worker PDF.js via CDN (essenziale per far funzionare la libreria su browser/mobile)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  }, [showAddForm, selectedCustomer, activeTab]);

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

// --- SEZIONE CLIENTI ---
function ClientiSection({ customers, totalCount, searchTerm, setSearchTerm, onAdd, onSelect }) {
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
            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#FFD700] font-medium" 
          />
        </div>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase mb-1">Account in Archivio</p>
        <h2 className="text-5xl font-black">{totalCount}</h2>
      </div>

      <div className="space-y-3">
        {shouldShowList ? (
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
              <div className="bg-slate-50 p-2 rounded-xl text-slate-300"><ChevronRight size={16} /></div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Search size={30} className="mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-10">Cerca un cliente per visualizzarlo</p>
          </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 border-4 border-white">
        <Plus size={30} />
      </button>
    </div>
  );
}

// --- SEZIONE SCANNER (VERSIONE OTTIMIZZATA CON PDF.JS) ---
function ScannerSection({ customers }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setScanResults([]);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile || customers.length === 0) return;
    setIsScanning(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Estraiamo il testo da ogni pagina
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Uniamo le stringhe della pagina
        const strings = content.items.map(item => item.str);
        fullText += strings.join(" ") + "\n";
      }

      const upperText = fullText.toUpperCase();
      const foundMatches = [];

      // Confronto: cerchiamo ogni cliente del DB all'interno del testo del PDF
      customers.forEach(customer => {
        const addr = customer.address.toUpperCase().trim();
        if (addr && upperText.includes(addr)) {
          // Troviamo la riga specifica nel PDF che contiene l'indirizzo per mostrarla in grassetto
          const lines = upperText.split(/\n| {3,}/);
          const pdfLine = lines.find(l => l.includes(addr)) || addr;
          
          foundMatches.push({
            pdfStreet: pdfLine.trim(),
            customer: customer
          });
        }
      });

      // Rimuoviamo duplicati
      const uniqueMatches = Array.from(new Set(foundMatches.map(a => JSON.stringify(a))))
        .map(e => JSON.parse(e));

      setScanResults(uniqueMatches);
      if (uniqueMatches.length === 0) alert("Nessuna via corrispondente trovata.");
      
    } catch (error) {
      console.error("Errore PDF:", error);
      alert("Errore durante la lettura del PDF. Assicurati che sia un file valido.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Scanner Consegne</h2>
      
      <div 
        onClick={() => fileInputRef.current.click()}
        className={`bg-white border-2 border-dashed ${selectedFile ? 'border-[#FFD700] bg-yellow-50' : 'border-slate-200'} rounded-[40px] p-8 text-center cursor-pointer shadow-sm`}
      >
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <FileUp size={40} className={`mx-auto mb-2 ${selectedFile ? 'text-[#FFD700]' : 'text-slate-300'}`} />
        <p className="font-bold text-[#0D1B2A] text-xs uppercase">
          {selectedFile ? selectedFile.name : 'Seleziona Lista Consegne PDF'}
        </p>
      </div>

      <button 
        onClick={handleStartScan}
        disabled={!selectedFile || isScanning}
        className="w-full py-5 bg-[#FFD700] text-[#0D1B2A] rounded-[24px] font-black uppercase shadow-lg shadow-yellow-100 active:scale-95 disabled:opacity-50 transition-all"
      >
        {isScanning ? 'Analisi in corso...' : 'Inizia Confronto'}
      </button>

      {scanResults.length > 0 && (
        <div className="space-y-4 pb-10">
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest italic">Corrispondenze rilevate:</h3>
          <div className="grid gap-4">
            {scanResults.map((res, index) => (
              <div key={index} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <p className="font-black text-[#0D1B2A] text-sm uppercase mb-3 leading-tight">
                  {res.pdfStreet}
                </p>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border-l-4 border-[#FFD700]">
                  <CheckCircle2 className="text-[#FFD700]" size={20} />
                  <div>
                    <p className="text-xs font-black text-slate-700 uppercase">{res.customer.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{res.customer.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SEZIONE SISTEMA ---
function SistemaSection({ customers, refresh }) {
  const exportBackup = () => {
    if (customers.length === 0) return alert("Nessun dato da esportare.");
    const csv = Papa.unparse(customers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `archivio_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const cleanData = results.data.map(({id, ...rest}) => rest);
          await db.customers.bulkAdd(cleanData);
          alert(`Importati ${cleanData.length} clienti!`);
          refresh();
        } catch (err) {
          alert("Errore importazione. Verifica il formato CSV.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Sistema</h2>
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stato Archivio</p>
        <p className="text-5xl font-black text-[#0D1B2A]">{customers.length}</p>
        <p className="text-xs text-slate-400 mt-1 font-bold uppercase">Clienti Salvati</p>
      </div>

      <div className="grid gap-4">
        <button onClick={exportBackup} className="bg-[#FFD700] p-6 rounded-3xl text-[#0D1B2A] flex items-center justify-between shadow-lg font-black uppercase text-sm">
          <span>Esporta Backup</span>
          <Download size={24} />
        </button>

        <label className="bg-[#0D1B2A] p-6 rounded-3xl text-white flex items-center justify-between shadow-xl cursor-pointer font-black uppercase text-sm">
          <span>Importa CSV</span>
          <Upload size={24} className="text-[#FFD700]" />
          <input type="file" accept=".csv" onChange={importBackup} className="hidden" />
        </label>
        
        <button onClick={() => { if(confirm("Cancellare TUTTI i dati?")) db.customers.clear().then(refresh) }} className="text-red-400 text-[10px] font-bold uppercase mt-8 text-center">
          Elimina database definitivamente
        </button>
      </div>
    </div>
  );
}

// --- MODALI (DETTAGLIO E AGGIUNTA) ---
function CustomerDetailModal({ customer, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...customer});

  const handleDelete = async () => {
    if(confirm(`Eliminare ${customer.name}?`)) {
      await db.customers.delete(customer.id);
      onRefresh(); onClose();
    }
  };

  const handleUpdate = async () => {
    await db.customers.update(customer.id, editedData);
    setIsEditing(false); onRefresh(); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-yellow-50 p-3 rounded-2xl text-[#FFD700]"><UserCircle size={24} /></div>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input value={editedData.name} onChange={e => setEditedData({...editedData, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold uppercase" />
            <input value={editedData.phone || ''} onChange={e => setEditedData({...editedData, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl" placeholder="Telefono" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editedData.city} onChange={e => setEditedData({...editedData, city: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl" placeholder="Città" />
              <input value={editedData.address} onChange={e => setEditedData({...editedData, address: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl" placeholder="Indirizzo" />
            </div>
            <textarea value={editedData.instructions || ''} onChange={e => setEditedData({...editedData, instructions: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl h-24" placeholder="Note" />
            <button onClick={handleUpdate} className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl font-black uppercase"><Save size={18} className="inline mr-2"/> Salva</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black text-[#0D1B2A] uppercase leading-tight">{customer.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Scheda Cliente</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <MapPin size={20} className="text-slate-300" />
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Indirizzo</p><p className="font-bold">{customer.address}, {customer.city}</p></div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-4">
                  <Phone size={20} className="text-slate-300" />
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase">Contatto</p><p className="font-bold">{customer.phone}</p></div>
                </div>
              )}
              {customer.instructions && (
                <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100">
                  <p className="text-[10px] font-black text-[#FFD700] uppercase mb-1">Note Scarico:</p>
                  <p className="text-sm font-medium">{customer.instructions}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => setIsEditing(true)} className="py-4 bg-slate-100 rounded-2xl text-[#0D1B2A] font-black text-xs uppercase"><Edit2 size={16} className="inline mr-2"/> Modifica</button>
              <button onClick={handleDelete} className="py-4 bg-red-50 rounded-2xl text-red-500 font-black text-xs uppercase"><Trash2 size={16} className="inline mr-2"/> Elimina</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddCustomerModal({ onClose }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await db.customers.add({
      name: fd.get('name'), phone: fd.get('phone'),
      city: fd.get('city'), address: fd.get('address'),
      instructions: fd.get('instructions')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] p-6 pt-12 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black text-[#0D1B2A]">Nuovo</h2>
          <button onClick={onClose} className="bg-slate-100 p-3 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 pb-10">
          <input name="name" required className="w-full p-5 bg-slate-50 rounded-[25px] font-bold uppercase" placeholder="RAGIONE SOCIALE" />
          <input name="phone" className="w-full p-5 bg-slate-50 rounded-[25px]" placeholder="TELEFONO" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" required className="w-full p-5 bg-slate-50 rounded-[25px]" placeholder="CITTÀ" />
            <input name="address" required className="w-full p-5 bg-slate-50 rounded-[25px]" placeholder="INDIRIZZO (VIA/PIAZZA)" />
          </div>
          <textarea name="instructions" className="w-full p-5 bg-slate-50 rounded-[25px] h-32" placeholder="NOTE SCARICO..."></textarea>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-[30px] font-black uppercase shadow-lg">Salva Cliente</button>
        </form>
      </div>
    </div>
  );
}
