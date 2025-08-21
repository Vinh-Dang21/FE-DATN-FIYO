"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

export default function Messages() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("global");
  const [text, setText] = useState("");

  // dữ liệu hội thoại mẫu
  const [conversations, setConversations] = useState([
    { id: "global", name: "Fiyo", lastMsg: "Xin chào!", time: "Hôm nay", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: "room1", name: "Khách A", lastMsg: "Tôi cần tư vấn", time: "Hôm qua", avatar: "https://i.pravatar.cc/150?img=2" },
  ]);

  // dữ liệu tin nhắn mẫu
  const [messages, setMessages] = useState([
    { id: 1, sender: "Fiyo", text: "Chào bạn, mình có thể giúp gì?", time: "10:00" },
    { id: 2, sender: "Khách", text: "Shop nghe bài Trình chưa", time: "10:01" },
    { id: 3, sender: "Admin", text: "Chưa nha:))", time: "10:02" },
  ]);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "Admin",
      text: text,
      time: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, newMsg]);
    setText("");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, lastMsg: text, time: "Vừa xong" } : c
      )
    );
  };

  const selected =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.chatWrapper}>
          {/* LEFT */}
          <aside className={styles.chatSidebar}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.convList}>
              {conversations
                .filter((c) =>
                  c.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((c) => (
                  <button
                    key={c.id}
                    className={`${styles.convItem} ${selectedId === c.id ? styles.active : ""
                      }`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className={styles.avatar}>
                      {c.avatar ? <img src={c.avatar} alt={c.name} /> : <span>M</span>}
                    </div>
                    <div className={styles.convMain}>
                      <div className={styles.convTop}>
                        <span className={styles.convName}>{c.name}</span>
                        <span className={styles.convTime}>{c.time}</span>
                      </div>
                      <div className={styles.convLast}>{c.lastMsg}</div>
                    </div>
                  </button>
                ))}
            </div>
          </aside>

          {/* RIGHT */}
          <section className={styles.chatPane}>
            <header className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.headerAvatar}>
                  {selected?.avatar ? (
                    <img src={selected.avatar} alt={selected?.name} />
                  ) : (
                    <span>M</span>
                  )}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.headerName}>{selected?.name}</div>
                  <div className={styles.headerStatus}>Offline</div>
                </div>
              </div>
            </header>

            <div className={styles.chatBody}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.msgRow} ${m.sender === "Admin" ? styles.right : styles.left
                    }`}
                >
                  <div className={styles.msgBubble}>
                    <div className={styles.msgMeta}>
                      <b>{m.sender}</b> <span>{m.time}</span>
                    </div>
                    <div className={styles.msgText}>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.chatInputBar}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className={styles.chatInput}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className={styles.sendBtn} onClick={handleSend}>
                <Send size={20} />
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
