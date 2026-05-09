import React, { useState, useEffect, useRef } from 'react';
import { db, addLog } from './db';
import Papa from 'papaparse'; // Libreria per i CSV
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
}, [showAddForm, selectedCustomer, activeTab]);
const filteredCustomers = customers.filter(c =>
c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
c.address.toLowerCase().includes(searchTerm.toLowerCase())
);
return (
<div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-slate-900">
<header className="bg-white p-4 flex justify-between items-center shadow-sm
sticky top-0 z-10 border-b">
<div className="flex items-center gap-2">
<span className="text-xl">🚚</span>
<h1 className="font-black text-xl tracking-tighter text-
[#0D1B2A]">GIUSEPPE</h1>
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
{activeTab === 'sistema' && <SistemaSection customers={customers}
refresh={fetchCustomers} />}
</main>
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-
around py-3 px-6 pb-8 shadow-lg z-30"><NavButton active={activeTab === 'clienti'} onClick={() =>
setActiveTab('clienti')} icon={<Users />} label="CLIENTI" />
<NavButton active={activeTab === 'scanner'} onClick={() =>
setActiveTab('scanner')} icon={<ScanLine />} label="SCANNER" />
<NavButton active={activeTab === 'sistema'} onClick={() =>
setActiveTab('sistema')} icon={<Settings />} label="SISTEMA" />
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
<button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ?
'text-[#FFD700]' : 'text-slate-400'}`}>
<div className={`p-2 rounded-xl ${active ? 'bg-[#FFD700] text-white shadow-md' :
''}`}>
{React.cloneElement(icon, { size: 22 })}
</div>
<span className="text-[10px] font-bold uppercase tracking-tighter">{label}</
span>
</button>
);
}
// --- SEZIONE CLIENTI ---
function ClientiSection({ customers, totalCount, searchTerm, setSearchTerm, onAdd,
onSelect }) {
const shouldShowList = searchTerm.length > 0 || totalCount < 5;
return (
<div className="space-y-6">
<div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest
mb-4">Anagrafica</h2>
<div className="relative">
<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
size={18} />
<input
type="text"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
placeholder="Cerca per nome o via..."
className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-sm
outline-none focus:ring-2 focus:ring-[#FFD700] font-medium"
/>
</div>
</div>
<div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl relative
overflow-hidden">
<p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase
mb-1">Account in Archivio</p>
<h2 className="text-5xl font-black">{totalCount}</h2>
</div>
<div className="space-y-3">
{shouldShowList ? (
customers.map(c => (<div
key={c.id}
onClick={() => onSelect(c)}
className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100
flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
>
<div className="min-w-0">
<h4 className="font-black text-[#0D1B2A] uppercase truncate">{c.name}
</h4>
<div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
<MapPin size={12} className="text-[#FFD700] shrink-0" />
<span className="truncate">{c.address}, {c.city}</span>
</div>
</div>
<div className="bg-slate-50 p-2 rounded-xl text-slate-300"><Plus
size={16} /></div>
</div>
))
) : (
<div className="text-center py-12 bg-white rounded-3xl border-2 border-
dashed border-slate-200">
<Search size={30} className="mx-auto text-slate-200 mb-2" />
<p className="text-slate-400 text-[10px] font-bold uppercase tracking-
widest px-10">Cerca un cliente per visualizzarlo</p>
</div>
)}
</div>
<button onClick={onAdd} className="fixed bottom-28 right-6 bg-[#FFD700] w-14
h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-20 border-4
border-white">
<Plus size={30} />
</button>
</div>
);
}
// --- SEZIONE SCANNER (LOGICA CORRETTA) ---
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
if (!selectedFile || customers.length === 0) return;
setIsScanning(true);
const reader = new FileReader();
reader.onload = async (event) => {
const content = event.target.result;
// Trasformiamo il contenuto in stringa per la ricerca
const textToSearch = content.toString().toLowerCase();
// LOGICA DI CORREZIONE: Filtriamo i clienti invece di mostrarli tutti
const matches = customers.filter(customer => {
const name = customer.name.toLowerCase();
// Cerchiamo se il nome del cliente è contenuto nel testo del file
return textToSearch.includes(name);});
// Simuliamo un breve caricamento per l'effetto "Intelligence"
setTimeout(() => {
setResults(matches);
setIsScanning(false);
addLog(`Scansione completa: ${selectedFile.name}. Trovate ${matches.length}
corrispondenze.`);
if (matches.length === 0) {
alert("Nessuna corrispondenza trovata nel file PDF selezionato.");
}
}, 1500);
};
// Leggiamo il file come stringa binaria per cercare i nomi
reader.readAsBinaryString(selectedFile);
};
return (
<div className="space-y-6">
<h2 className="text-3xl font-black text-[#0D1B2A]">Scanner Consegne</h2>
<div
onClick={() => fileInputRef.current.click()}
className={`bg-white border-2 border-dashed ${selectedFile ? 'border-[#FFD700]
bg-yellow-50' : 'border-slate-200'} rounded-[40px] p-8 text-center cursor-pointer
transition-all shadow-sm`}
>
<input type="file" accept=".pdf" ref={fileInputRef}
onChange={handleFileChange} className="hidden" />
{selectedFile ? (
<>
<FileText size={40} className="mx-auto text-[#FFD700] mb-2" />
<p className="font-bold text-[#0D1B2A] text-xs uppercase truncate
px-4">{selectedFile.name}</p>
</>
) : (
<>
<FileUp size={40} className="mx-auto text-slate-300 mb-2" />
<h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-
widest">Sfoglia PDF</h3>
</>
)}
</div>
<div className="bg-[#0D1B2A] rounded-3xl p-6 text-white shadow-xl relative
overflow-hidden">
<div className="flex items-center gap-2 mb-4">
<div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
<h3 className="text-xs font-bold uppercase tracking-widest text-
[#FFD700]">Intelligence</h3>
</div>
<h2 className="text-2xl font-black mb-2 leading-tight">Analisi Incrociata</h2>
<p className="text-xs text-slate-400 mb-6 leading-relaxed">Confronto
automatico con l'intero database locale.</p>
<button
onClick={handleStartScan}
disabled={!selectedFile || isScanning}
className={`w-full py-4 rounded-xl font-black text-sm uppercase shadow-lg
transition-all ${isScanning ? 'bg-slate-700 text-slate-400' : 'bg-[#FFD700] text-
[#0D1B2A] active:scale-95'}`}
>
{isScanning ? 'Elaborazione...' : 'Confronta intero Archivio'}
</button>
</div>
{results.length > 0 && (
<div className="space-y-4 pb-10">
<div className="flex justify-between items-center px-1"><h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-
widest">Risultati Corrispondenza ({results.length})</h3>
<button onClick={() => setResults([])} className="text-red-400 text-[10px]
font-bold uppercase">Pulisci</button>
</div>
<div className="grid gap-3">
{results.map(r => (
<div key={r.id} className="bg-white p-4 rounded-2xl border-l-4 border-
[#FFD700] shadow-sm flex items-start gap-3 animate-in fade-in">
<CheckCircle2 className="text-[#FFD700] mt-1 shrink-0" size={18} />
<div className="flex-1 min-w-0">
<p className="font-black text-[#0D1B2A] text-sm uppercase
truncate">{r.name}</p>
<p className="text-[11px] text-slate-500 font-medium">{r.address},
{r.city}</p>
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
// Converte l'array di oggetti in stringa CSV
const csv = Papa.unparse(customers);
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
const url = URL.createObjectURL(blob);
link.setAttribute('href', url);
link.setAttribute('download', `backup_clienti_${new
Date().toISOString().slice(0,10)}.csv`);
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
alert(`Importati ${cleanData.length} clienti con successo!`);
refresh();
} catch (err) {
alert("Errore nell'importazione. Verifica le colonne.");
}
}
});
};
return (
<div className="space-y-6">
<h2 className="text-3xl font-black text-[#0D1B2A]">Sistema</h2>
<div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest
mb-2">Database Locale</p>
<p className="text-5xl font-black text-[#0D1B2A]">{customers.length} <span
className="text-sm font-normal text-slate-400">Record</span></p>
</div>
<div className="grid grid-cols-1 gap-4">
<button onClick={exportBackup} className="bg-[#FFD700] p-6 rounded-3xl text-
[#0D1B2A] flex items-center justify-between shadow-lg active:scale-95 transition-
transform font-black uppercase text-sm">
<div>
<p>Esporta CSV</p>
<p className="text-[10px] opacity-60 font-bold normal-case">Salva per
Excel/Fogli</p>
</div>
<Download size={24} />
</button>
<label className="bg-[#0D1B2A] p-6 rounded-3xl text-white flex items-center
justify-between shadow-xl active:scale-95 transition-transform cursor-pointer">
<div className="text-left font-black uppercase text-sm">
<p>Importa CSV</p>
<p className="text-[10px] text-slate-400 font-bold normal-case">Carica il
tuo file .csv</p>
</div>
<Upload size={24} className="text-[#FFD700]" />
<input type="file" accept=".csv" onChange={importBackup}
className="hidden" />
</label>
<button onClick={() => { if(confirm("Cancellare TUTTI i dati?"))
db.customers.clear().then(refresh) }} className="text-red-400 text-[10px] font-bold
uppercase mt-4 text-center">
Elimina tutti i dati definitivamente
</button>
</div>
</div>
);
}
// --- MODALE DETTAGLIO ---
function CustomerDetailModal({ customer, onClose, onRefresh }) {
const [isEditing, setIsEditing] = useState(false);
const [editedData, setEditedData] = useState({...customer});
const handleDelete = async () => {
if(confirm(`Eliminare ${customer.name}?`)) {
await db.customers.delete(customer.id);
onRefresh();
onClose();
}
};
const handleUpdate = async () => {
await db.customers.update(customer.id, editedData);
setIsEditing(false);
onRefresh();
onClose();
};
return (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end
justify-center">
<div className="bg-white w-full max-w-md rounded-t-[40px] p-8 shadow-2xl
animate-in slide-in-from-bottom duration-300">
<div className="flex justify-between items-center mb-6">
<div className="bg-yellow-50 p-3 rounded-2xl text-[#FFD700]"><UserCircle
size={24} /></div>
<button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20} /></button>
</div>
{isEditing ? (
<div className="space-y-4">
<input value={editedData.name} onChange={e =>
setEditedData({...editedData, name: e.target.value})} className="w-full p-4 bg-
slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700] font-bold
uppercase" placeholder="Nome" />
<input value={editedData.phone || ''} onChange={e =>
setEditedData({...editedData, phone: e.target.value})} className="w-full p-4 bg-
slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
placeholder="Telefono" />
<div className="grid grid-cols-2 gap-2">
<input value={editedData.city} onChange={e =>
setEditedData({...editedData, city: e.target.value})} className="w-full p-4 bg-
slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
placeholder="Città" />
<input value={editedData.address} onChange={e =>
setEditedData({...editedData, address: e.target.value})} className="w-full p-4 bg-
slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
placeholder="Indirizzo" />
</div>
<textarea value={editedData.instructions || ''} onChange={e =>
setEditedData({...editedData, instructions: e.target.value})} className="w-full p-4
bg-slate-50 rounded-2xl h-24 outline-none" placeholder="Note scarico" />
<button onClick={handleUpdate} className="w-full bg-[#0D1B2A] text-white
py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2"><Save
size={18} /> Salva</button>
</div>
) : (
<div className="space-y-6">
<div>
<h2 className="text-3xl font-black text-[#0D1B2A] uppercase leading-
tight">{customer.name}</h2>
<p className="text-slate-400 font-bold text-[10px] uppercase tracking-
widest">Dettaglio Cliente</p>
</div>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="bg-slate-100 p-3 rounded-xl text-slate-500"><MapPin
size={20} /></div>
<div><p className="text-[10px] font-bold text-slate-400
uppercase">Località</p><p className="font-bold text-[#0D1B2A]">{customer.address},
{customer.city}</p></div>
</div>
{customer.phone && (
<div className="flex items-center gap-4">
<div className="bg-slate-100 p-3 rounded-xl text-slate-500"><Phone
size={20} /></div>
<div><p className="text-[10px] font-bold text-slate-400
uppercase">Telefono</p><p className="font-bold text-[#0D1B2A]">{customer.phone}</p></
div>
</div>
)}
{customer.instructions && (
<div className="bg-yellow-50 p-5 rounded-3xl border border-
yellow-100">
<p className="text-[10px] font-black text-[#FFD700] uppercase mb-1
italic">Note Scarico:</p>
<p className="text-sm text-slate-700 leading-relaxed font-
medium">{customer.instructions}</p>
</div>
)}
</div>
&div className="grid grid-cols-2 gap-3 pt-4">
<button onClick={() => setIsEditing(true)} className="flex items-center
justify-center gap-2 py-4 bg-slate-100 rounded-2xl text-[#0D1B2A] font-black text-xs
uppercase"><Edit2 size={16} /> Modifica</button><button onClick={handleDelete} className="flex items-center justify-
center gap-2 py-4 bg-red-50 rounded-2xl text-red-500 font-black text-xs
uppercase"><Trash2 size={16} /> Elimina</button>
</div>
</div>
)}
</div>
</div>
);
}
// --- MODALE AGGIUNTA ---
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
<div className="fixed inset-0 bg-white z-[100] p-6 pt-12 overflow-y-auto">
<div className="max-w-md mx-auto">
<div className="flex justify-between items-center mb-8">
<h2 className="text-4xl font-black text-[#0D1B2A]">Nuovo</h2>
<button onClick={onClose} className="bg-slate-100 p-3 rounded-full"><X /></
button>
</div>
<form onSubmit={handleSubmit} className="space-y-4 pb-10">
<input name="name" required className="w-full p-5 bg-slate-50 rounded-[25px]
outline-none font-bold uppercase" placeholder="RAGIONE SOCIALE" />
<input name="phone" className="w-full p-5 bg-slate-50 rounded-[25px]
outline-none" placeholder="TELEFONO" />
<div className="grid grid-cols-2 gap-3">
<input name="city" required className="w-full p-5 bg-slate-50 rounded-
[25px] outline-none" placeholder="CITTÀ" />
<input name="address" required className="w-full p-5 bg-slate-50 rounded-
[25px] outline-none" placeholder="INDIRIZZO" />
</div>
<textarea name="instructions" className="w-full p-5 bg-slate-50 rounded-
[25px] h-32 outline-none" placeholder="NOTE SCARICO..."></textarea>
<button type="submit" className="w-full bg-[#FFD700] py-5 rounded-[30px]
font-black uppercase shadow-lg shadow-yellow-100">Salva Cliente</button>
</form>
</div>
</div>
);
}
