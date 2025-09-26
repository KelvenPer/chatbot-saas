import { useState } from "react";
import { Navbar } from "./components/Navbar";
import ContactsPage from "./components/ContactsPage";
import ConversationsPage from "./components/ConversationsPage";

type Tab = "contacts" | "conversations" | "campaigns" | "templates";


export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#e5e5e5', padding: 16 }}>
      <h1>Admin Web • Online</h1>
      <p>Se você está vendo isto, o React está renderizando 👍</p>
    </div>
  );
}

