import { useEffect, useState } from "react";
import { createContact, fetchContacts } from "../services/contacts";
import type { Contact } from "../types";

export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchContacts(1, q);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", email:"", channel:"whatsapp" });

  async function onCreate() {
    if (!form.phone) return;
    const c = await createContact({ tenant_id: 1, ...form });
    setItems((prev) => [c, ...prev]);
    setShowForm(false);
    setForm({ name:"", phone:"", email:"", channel:"whatsapp" });
  }

  return (
    <div style={{padding:16}}>
      <h1 style={{marginBottom:12}}>Contatos</h1>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <input
          placeholder="Buscar..."
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          style={{background:"#222", color:"#ddd", border:"1px solid #444", padding:"6px 8px", borderRadius:6}}
        />
        <button onClick={()=>setShowForm(true)} style={{padding:"6px 10px"}}>+ Novo</button>
      </div>

      {showForm && (
        <div style={{background:"#1b1b1b", padding:12, marginTop:12, borderRadius:8}}>
          <h3>Novo contato</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            <input placeholder="Nome" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
            <input placeholder="Telefone +55..." value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))}/>
            <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
            <select value={form.channel} onChange={e=>setForm(f=>({...f, channel:e.target.value}))}>
              <option value="whatsapp">whatsapp</option>
              <option value="telegram">telegram</option>
              <option value="sms">sms</option>
              <option value="email">email</option>
            </select>
          </div>
          <div style={{marginTop:8}}>
            <button onClick={onCreate}>Salvar</button>
            <button onClick={()=>setShowForm(false)} style={{marginLeft:8}}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{marginTop:16}}>
        {loading ? <p>Carregando...</p> : (
          <ul style={{listStyle:"none", padding:0, display:"grid", gap:8}}>
            {items.map(c=>(
              <li key={c.id} style={{background:"#1b1b1b", padding:12, borderRadius:8, display:"flex", justifyContent:"space-between"}}>
                <div>
                  <strong>{c.name || "Sem nome"}</strong><br/>
                  <small>{c.phone} · {c.email || "-"}</small>
                </div>
                <span style={{background:"#2d6cdf", padding:"2px 8px", borderRadius:999, height:22}}>{c.channel}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
