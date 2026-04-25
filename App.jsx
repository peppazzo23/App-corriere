import React, { useState, useEffect } from 'react';
import { db, addLog } from './db';
import { Users, ScanLine, Settings, Plus, Search, FileUp, AlertTriangle, Bell, UserCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('clienti');
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await db.customers.toArray();
      setCustomers(data);
    };
    fetchCustomers();
  }, [showAddForm]);

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
        {activeTab === 'clienti' && <ClientiSection customers={customers} onAdd={() => setShowAddForm(true)} />}
        {activeTab === 'scanner' && <ScannerSection />}
        {activeTab === 'sistema' && <SistemaSection customers={customers} />}
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
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function ClientiSection({ customers, onAdd }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Gestione Clienti</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cerca tra i tuoi clienti..." className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl text-sm outline-none" />
        </div>
        <div className="flex gap-2">
          <span className="bg-[#FFD700] text-white px-4 py-2 rounded-full text-xs font-bold">Tutti i Clienti</span>
          <span className="bg-slate-100 text-slate-400 px-4 py-2 rounded-full text-xs font-bold">Attivi</span>
        </div>
      </div>

      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase mb-1">Account Attivi</p>
        <h2 className="text-5xl font-black">{customers.length} <span className="text-sm text-slate-500 font-normal">--</span></h2>
        <p className="text-slate-500 text-xs mt-2">Nessun dato recente</p>
      </div>

      <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">👤</div>
        <h3 className="font-bold text-lg text-[#0D1B2A]">Nessun cliente trovato</h3>
        <p className="text-slate-500 text-xs px-10 mb-6">Inizia aggiungendo il tuo primo cliente alla piattaforma.</p>
        <button onClick={onAdd} className="bg-[#FFD700] px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mx-auto shadow-lg shadow-yellow-100">
          <Plus size={20} /> AGGIUNGI CLIENTE
        </button>
      </div>
    </div>
  );
}

function ScannerSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Scanner Consegne</h2>
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center gap-4">
        <FileUp size={40} className="text-[#0D1B2A]" />
        <h3 className="font-bold">Seleziona Lista Consegne PDF</h3>
        <p className="text-xs text-slate-400">Massimo 15MB.</p>
        <button className="bg-[#FFD700] px-6 py-3 rounded-xl font-bold text-sm shadow-md">SFOGLIA DOCUMENTI</button>
      </div>
      <div className="bg-[#0D1B2A] rounded-3xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 italic text-[#FFD700]">Intelligence</h3>
        <h2 className="text-2xl font-black mb-2">Ottimizzazione Percorso</h2>
        <button className="w-full bg-[#FFD700] text-[#0D1B2A] py-4 rounded-xl font-black text-sm uppercase mt-4">Inizia Percorso</button>
      </div>
    </div>
  );
}

function SistemaSection({ customers }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-[#0D1B2A]">Gestione Dati & Backup</h2>
      <div className="bg-white p-6 rounded-3xl shadow-sm border">
        <h3 className="text-[10px] font-bold text-[#FFD700] uppercase mb-4 tracking-widest">Integrità Sistema</h3>
        <div className="flex justify-between border-b pb-4 mb-4">
          <span className="text-sm font-bold uppercase">Database Locale</span>
          <span className="text-slate-400">📦</span>
        </div>
        <p className="text-4xl font-black">0 KB</p>
        <div className="flex justify-between mt-6">
           <button className="bg-[#0D1B2A] text-white px-4 py-3 rounded-xl text-[10px] font-bold uppercase">Analisi Approfondita</button>
           <button className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-[10px] font-bold uppercase">Ottimizza Indici</button>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[#FFD700] to-[#E6C200] p-8 rounded-3xl text-center text-[#0D1B2A]">
        <h3 className="font-black text-lg uppercase mb-4">Esporta Backup</h3>
        <button className="bg-white w-full py-4 rounded-xl font-black text-sm uppercase shadow-lg">Genera & Scarica</button>
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
      city: fd.get('city'), address: fd.get('address')
    });
    addLog(`Aggiunto: ${fd.get('name')}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-6">
       <div className="max-w-md mx-auto">
        <span className="bg-yellow-100 text-[#FFD700] px-3 py-1 rounded text-[10px] font-bold uppercase">Anagrafica Gestionale</span>
        <h2 className="text-4xl font-black text-[#0D1B2A] mt-2 mb-6">Inserimento Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Cliente</label>
            <input name="name" required className="w-full p-4 bg-slate-100 rounded-xl" placeholder="Inserisci nome azienda..." />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Città</label>
            <input name="city" required className="w-full p-4 bg-slate-100 rounded-xl" placeholder="Es. Milano" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Indirizzo</label>
            <input name="address" required className="w-full p-4 bg-slate-100 rounded-xl" placeholder="Via/Piazza..." />
          </div>
          <button type="submit" className="w-full bg-[#FFD700] py-5 rounded-2xl font-black text-sm uppercase mt-6 shadow-xl shadow-yellow-100">Salva Cliente</button>
          <button type="button" onClick={onClose} className="w-full py-4 text-slate-400 font-bold">ANNULLA</button>
        </form>
       </div>
    </div>
  );
}
