import { useEffect, useState } from "react";
import { api } from "../api";

export default function Contacts() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/contacts", { params: { tenant_id: 1, search: q } })
      .then(r => setItems(r.data));
  }, [q]);

  return (
    <div className="p-4">
      <h1>Contatos</h1>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." />
      <ul>
        {items.map(c => (
          <li key={c.id}>{c.name} — {c.phone}</li>
        ))}
      </ul>
    </div>
  );
}
