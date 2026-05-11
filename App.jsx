import React, { useState, useEffect, useRef } from 'react';
import { db } from './db';
import Papa from 'papaparse';
import { 
  Users, ScanLine, Settings, Plus, Search, FileUp, 
  Download, Upload, Trash2, Bell, UserCircle, MapPin, 
  Phone, CheckCircle2, X, Edit2, Save, ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('clienti');
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [prefilledAddress, setPrefilledAddress] = useState("");

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
            onAdd={() => { setPrefilledAddress(""); setShowAddForm(true); }} 
            onSelect={(c) => setSelectedCustomer(c)}
          />
        )}
        {activeTab === 'scanner' && (
          <ScannerSection 
            customers={customers} 
            onOpenDetail={(c) => setSelectedCustomer(c)}
            onAddNew={(addr) => { setPrefilledAddress(addr); setShowAddForm(true); }}
          />
        )}
        {activeTab === 'sistema' && <SistemaSection customers={customers} refresh={fetchCustomers} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-6 pb-8 shadow-lg z-30">
        <NavButton active={activeTab === 'clienti'} onClick={() => setActiveTab('clienti')} icon={<Users />} label="CLIENTI" />
        <NavButton active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} icon={<ScanLine />} label="SCANNER" />
        <NavButton active={activeTab === 'sistema'} onClick={() => setActiveTab('sistema')} icon={<Settings />} label="SISTEMA" />
      </nav>

      {showAddForm && (
        <AddCustomerModal 
          initialAddress={prefilledAddress} 
          onClose={() => setShowAddForm(false)} 
        />
      )}
      
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

function ClientiSection({ customers, totalCount, searchTerm, setSearchTerm, onAdd, onSelect }) {
  const shouldShowList = searchTerm.length > 0 || totalCount < 5;
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Anagrafica</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca cliente o via..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#FFD700] font-medium" 
          />
        </div>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase mb-1 italic">Archivio</p>
        <h2 className="text-5xl font-black text-left">{totalCount}</h2>
      </div>

      <div className="space-y-3">
        {shouldShowList ? (
          customers.map(c => (
            <div 
              key={c.id} 
              onClick={() => onSelect(c)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="min-w-0 text-left">
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
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-10 italic">Cerca un cliente per visualizzarlo</p>
          </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 border-4 border-white">
        <Plus size={30} />
      </button>
    </div>
  );
}

function ScannerSection({ customers, onOpenDetail, onAddNew }) {
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
    if (!selectedFile) return;
    setIsScanning(true);

    try {
      const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.mjs';

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let allFoundAddresses = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Estraiamo il testo ignorando i codici lunghi che non sono indirizzi
        content.items.forEach(item => {
            const text = item.str.trim();
            // Salta i codici pacco (testo lungo senza spazi o con troppi numeri)
            if (text.length > 8 && !text.includes(" ")) return;

            // Identifica se è un indirizzo (Via, Viale, Corso...)
            const addressMatch = text.match(/(?:VIA|VIALE|CONTRADA|TRAVERSA|PIAZZA|CORSO|Viale|Via|Contrada|Traversa|Piazza|Corso)\s+[A-Za-z\s]+(?:\s*(?:N\.|N|NUMERO)?\s*[\d\/]+|[\s,]+SNC|[\s,]+TERRA)/gi);
            
            if (addressMatch) {
              addressMatch.forEach(addr => {
                const clean = addr.trim().toUpperCase().replace(/\s+/g, ' ');
                if (!allFoundAddresses.includes(clean)) {
                  allFoundAddresses.push(clean);
                }
              });
            }
        });
      }

      const results = allFoundAddresses.map(pdfAddr => {
        const match = customers.find(c => 
          pdfAddr.includes(c.address.toUpperCase().trim()) || 
          c.address.toUpperCase().trim().includes(pdfAddr)
        );
        return { pdfAddr, customer: match || null };
      });

      setScanResults(results);
    } catch (error) {
      alert("Errore scanner: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A] text-left">Scanner Consegne</h2>
      
      <div 
        onClick={() => fileInputRef.current.click()}
        className={`bg-white border-2 border-dashed ${selectedFile ? 'border-[#FFD700] bg-yellow-50' : 'border-slate-200'} rounded-[40px] p-8 text-center cursor-pointer shadow-sm`}
      >
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <FileUp size={40} className={`mx-auto mb-2 ${selectedFile ? 'text-[#FFD700]' : 'text-slate-300'}`} />
        <p className="font-bold text-[#0D1B2A] text-xs uppercase text-center italic">
          {selectedFile ? selectedFile.name : 'Carica PDF del Giro'}
        </p>
      </div>

      <button 
        onClick={handleStartScan}
        disabled={!selectedFile || isScanning}
        className="w-full py-5 bg-[#FFD700] text-[#0D1B2A] rounded-[24px] font-black uppercase shadow-lg active:scale-95 disabled:opacity-50"
      >
        {isScanning ? 'Analisi...' : 'Inizia Confronto'}
      </button>

      {scanResults.length > 0 && (
        <div className="space-y-4 pb-10">
          <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest text-left italic">Indirizzi Rilevati:</h3>
          <div className="grid gap-4">
            {scanResults.map((res, index) => (
              <div 
                key={index} 
                onClick={() => res.customer ? onOpenDetail(res.customer) : onAddNew(res.pdfAddr)}
                className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left active:scale-[0.98] transition-transform cursor-pointer"
              >
                <p className="font-black text-[#0D1B2A] text-sm uppercase mb-3 leading-tight">{res.pdfAddr}</p>
                
                {res.customer ? (
                  <div className="flex items-center gap-4 bg-yellow-50/50 p-4 rounded-2xl border-l-4 border-[#FFD700]">
                    <CheckCircle2 className="text-[#FFD700]" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 uppercase truncate">{res.customer.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic">Cliente trovato!</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border-l-4 border-slate-300">
                    <div className="flex items-center gap-3">
                      <X className="text-slate-300" size={20} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Non in archivio</p>
                    </div>
                    <div className="bg-[#FFD700] p-1 rounded-full text-white"><Plus size={14} /></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SistemaSection({ customers, refresh }) {
  const exportBackup = () => {
    if (customers.length === 0) return alert("Nessun dato da esportare.");
    const csv = Papa.unparse(customers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_clienti.csv`;
    link.click();
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
          alert(`Caricati ${cleanData.length} clienti!`);
          refresh();
        } catch (err) { alert("Errore caricamento CSV."); }
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A] text-left">Sistema</h2>
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Anagrafiche totali</p>
        <p className="text-5xl font-black text-[#0D1B2A]">{customers.length}</p>
      </div>

      <div className="grid gap-4">
        <button onClick={exportBackup} className="bg-[#FFD700] p-6 rounded-3xl text-[#0D1B2A] flex items-center justify-between shadow-lg font-black uppercase text-sm">
          <span>Esporta Backup</span>
          <Download size={24} />
        </button>

        <label className="bg-[#0D1B2A] p-6 rounded-3xl text-white flex items-center justify-between shadow-xl cursor-pointer font-black uppercase text-sm text-left">
          <span>Importa CSV</span>
          <Upload size={24} className="text-[#FFD700]" />
          <input type="file" accept=".csv" onChange={importBackup} className="hidden" />
        </label>
        
        <button onClick={() => { if(confirm("Cancellare tutto?")) db.customers.clear().then(refresh) }} className="text-red-400 text-[10px] font-bold uppercase mt-8 text-center w-full italic">
          Ripristina Database (Svuota)
        </button>
      </div>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...customer});

  const handleDelete = async () => {
    if(confirm(`Eliminare definitivamente ${customer.name}?`)) {
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
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl">
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
            <textarea value={editedData.instructions || ''} onChange={e => setEditedData({...editedData, instructions: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl h-24" placeholder="Note scarico" />
            <button onClick={handleUpdate} className="w-full bg-[#0D1B2A] text-white py-4 rounded-2xl font-black uppercase"><Save size={18} className="inline mr-2"/> Salva</button>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-3xl font-black text-[#0D1B2A] uppercase leading-tight">{customer.name}</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Dettaglio</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <MapPin size={20} className="text-slate-300" />
                <div><p className="text-[10px] font-bold text-slate-400 uppercase italic">Posizione</p><p className="font-bold">{customer.address}, {customer.city}</p></div>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-4">
                  <Phone size={20} className="text-slate-300" />
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase italic">Telefono</p><p className="font-bold">{customer.phone}</p></div>
                </div>
              )}
              {customer.instructions && (
                <div className="bg-yellow-50 p-5 rounded-3xl border border-yellow-100">
                  <p className="text-[10px] font-black text-[#FFD700] uppercase mb-1 italic">Note Consegna:</p>
                  <p className="text-sm font-medium">{customer.instructions}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => setIsEditing(true)} className="py-4 bg-slate-100 rounded-2xl text-[#0D1B2A] font-black text-xs uppercase italic">Modifica</button>
              <button onClick={handleDelete} className="py-4 bg-red-50 rounded-2xl text-red-500 font-black text-xs uppercase italic">Elimina</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddCustomerModal({ initialAddress, onClose }) {
  const [address, setAddress] = useState(initialAddress || "");
  
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
      <div className="max-w-md mx-auto text-left">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black text-[#0D1B2A]">Aggiungi</h2>
          <button onClick={onClose} className="bg-slate-100 p-3 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 pb-10">
          <input name="name" required className="w-full p-5 bg-slate-50 rounded-[25px] font-bold uppercase" placeholder="NOME/RAGIONE SOCIALE" />
          <input name="phone" className="w-full p-5 bg-slate-50 rounded-[25px]" placeholder="TELEFONO" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" required className="w-full p-5 bg-slate-50 rounded-[25px]" placeholder="CITTÀ" defaultValue="Bianco" />
            <input 
              name="address" 
              required 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full p-5 bg-slate-50 rounded-[25px]" 
              placeholder="VIA E CIVICO" 
            />
          </div>
          <textarea name="instructions" className="w-full p-5 bg-slate-50 rounded-[25px] h-32" placeholder="NOTE DI CONSEGNA..."></textarea>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-[30px] font-black uppercase shadow-lg">Salva Cliente</button>
        </form>
      </div>
    </div>
  );
}
