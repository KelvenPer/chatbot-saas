type Tab = "contacts" | "conversations" | "campaigns" | "templates";
export function Navbar({ tab, setTab }: { tab: Tab; setTab: (t: Tab)=>void }) {
  const btn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding:"8px 12px",
        borderRadius:8,
        background: tab===t ? "#2d6cdf" : "#333",
        color:"#fff",
        border:"none",
        marginRight:8
      }}
    >{label}</button>
  );
  return (
    <nav style={{padding:12, background:"#111", position:"sticky", top:0}}>
      {btn("contacts","Contatos")}
      {btn("conversations","Conversas")}
      {btn("campaigns","Campanhas")}
      {btn("templates","Templates")}
    </nav>
  );
}
