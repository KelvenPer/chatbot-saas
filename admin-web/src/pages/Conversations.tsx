import { useEffect, useState } from "react";
import { api } from "../api";

export default function Conversations() {
  const [convs, setConvs] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [convId, setConvId] = useState<number|undefined>();

  useEffect(() => {
    api.get("/conversations", { params: { tenant_id: 1 } })
      .then(r => setConvs(r.data));
  }, []);

  useEffect(() => {
    if (!convId) return;
    api.get(`/conversations/${convId}/messages`).then(r => setMsgs(r.data));

    // SSE stream
    const ev = new EventSource(`${import.meta.env.VITE_API_URL}/events/stream`);
    ev.addEventListener("message:new", (e:any) => {
      const payload = JSON.parse(e.data);
      if (payload.conversation_id === convId) {
        setMsgs(m => [...m, payload]);
      }
    });
    return () => ev.close();
  }, [convId]);

  const send = async () => {
    if(!convId || !text) return;
    await api.post("/messages/send", { conversation_id: convId, body: text });
    setText("");
  };

  return (
    <div className="flex gap-4 p-4">
      <aside>
        <h2>Conversas</h2>
        <ul>
          {convs.map(c => (
            <li key={c.id}>
              <button onClick={() => setConvId(c.id)}>{c.id} — {c.channel}</button>
            </li>
          ))}
        </ul>
      </aside>
      <main>
        <div style={{height: 300, overflow: "auto", border: "1px solid #eee", padding: 8}}>
          {msgs.map((m, i) => (
            <div key={i} style={{textAlign: m.direction === "out" ? "right" : "left"}}>
              <small>{m.direction}</small>
              <div>{m.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Digite..." />
          <button onClick={send}>Enviar</button>
        </div>
      </main>
    </div>
  );
}
