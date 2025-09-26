import { useState } from "react";
import Contacts from "./pages/Contacts";
import Conversations from "./pages/Conversations";

export default function App() {
  const [tab, setTab] = useState<"contacts"|"conversations">("contacts");
  return (
    <div>
      <nav style={{display:"flex", gap:8, padding:8}}>
        <button onClick={()=>setTab("contacts")}>Contatos</button>
        <button onClick={()=>setTab("conversations")}>Conversas</button>
      </nav>
      {tab === "contacts" ? <Contacts/> : <Conversations/>}
    </div>
  );
}
