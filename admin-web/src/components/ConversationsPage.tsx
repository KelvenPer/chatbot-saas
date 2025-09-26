import { useEffect, useMemo, useState } from "react";
import { fetchConversations, fetchMessages, mockIncoming, openSSE, sendMessage } from "../services/conversations";
import type { Conversation, Message } from "../types";

export default function ConversationsPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchConvs();
  }, []);

  async function fetchConvs() {
    const list = await fetchConversations(1);
    setConvs(list);
    if (list.length && !selected) {
      setSelected(list[0]);
    }
  }

  // Carrega mensagens ao selecionar conversa
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id).then(setMsgs);
  }, [selected?.id]);

  // SSE: recebe novas mensagens em tempo real
  useEffect(() => {
    const off = openSSE((msg) => {
      if (selected && msg.conversation_id === selected.id) {
        setMsgs((m) => [...m, msg]);
      }
    });
    return off;
  }, [selected?.id]);

  const send = async () => {
    if (!selected || !text.trim()) return;
    const m = await sendMessage(selected.id, text.trim());
    setMsgs((prev) => [...prev, m]);
    setText("");
  };

  const simulateIn = async () => {
    if (!selected) return;
    await mockIncoming(selected.id, "Olá! (simulado)");
  };

  const sortedConvs = useMemo(
    () => convs.sort((a,b) => (b.last_message_at ? Date.parse(b.last_message_at) : 0) - (a.last_message_at ? Date.parse(a.last_message_at) : 0)),
    [convs]
  );

  return (
    <div style={{display:"grid", gridTemplateColumns:"280px 1fr", height:"calc(100vh - 60px)"}}>
      {/* Sidebar conversas */}
      <aside style={{borderRight:"1px solid #333", overflow:"auto"}}>
        <div style={{padding:12, fontWeight:600}}>Conversas</div>
        <ul style={{listStyle:"none", padding:0, margin:0}}>
          {sortedConvs.map((c) => (
            <li key={c.id}>
              <button
                onClick={()=>setSelected(c)}
                style={{
                  width:"100%", textAlign:"left", padding:12, border:"none",
                  background: selected?.id===c.id ? "#222" : "transparent", color:"#ddd", cursor:"pointer"
                }}
              >
                #{c.id} · {c.channel} · {c.state}
                <div style={{fontSize:12, opacity:.7}}>
                  {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "-"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Janela do chat */}
      <main style={{display:"grid", gridTemplateRows:"auto 1fr auto"}}>
        <div style={{padding:12, borderBottom:"1px solid #333", fontWeight:600}}>
          {selected ? `Conversa #${selected.id}` : "Selecione uma conversa"}
        </div>

        <div style={{padding:12, overflow:"auto", background:"#0f0f0f"}}>
          {msgs.map((m) => (
            <div key={m.id} style={{display:"flex", justifyContent: m.direction==="out" ? "flex-end":"flex-start", marginBottom:8}}>
              <div style={{maxWidth:"70%", background: m.direction==="out" ? "#2d6cdf" : "#222", padding:"8px 10px", borderRadius:10, color:"#fff"}}>
                <div style={{fontSize:12, opacity:.8}}>{m.direction}</div>
                <div>{m.body}</div>
                <div style={{fontSize:11, opacity:.6, textAlign:"right"}}>{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:"flex", gap:8, padding:12, borderTop:"1px solid #333"}}>
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Digite uma mensagem…"
            style={{flex:1, background:"#222", color:"#ddd", border:"1px solid #444", padding:"8px 10px", borderRadius:6}}
          />
          <button onClick={send}>Enviar</button>
          <button onClick={simulateIn} title="Simular recebimento">Simular In</button>
        </div>
      </main>
    </div>
  );
}
