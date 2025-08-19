"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

export default function Messages() {
    const [search, setSearch] = useState("");
    const [conversations] = useState([
        { id: "1", name: "Marketo", lastMsg: "a", time: "2025-08-18 11:38:45", avatar: "/logo.png" },
        { id: "2", name: "adminshop t...", lastMsg: "a", time: "2025-08-17 11:07:04", avatar: "" },
        { id: "3", name: "Nhật", lastMsg: "a", time: "2025-08-17 10:44:04", avatar: "" },
        { id: "4", name: "nhan1", lastMsg: "code 1", time: "2025-08-15 22:13:27", avatar: "" },
        { id: "5", name: "Cửa hàng đi...", lastMsg: "[Image]", time: "2025-08-15 13:11:59", avatar: "" },
        { id: "6", name: "Phạm Phước...", lastMsg: "cc", time: "2025-08-07 22:00:37", avatar: "" },
        { id: "7", name: "hahasd", lastMsg: "khac", time: "2025-08-07 21:46:12", avatar: "" },
        { id: "8", name: "thanh tú", lastMsg: "1234", time: "2025-07-23 01:10:35", avatar: "" },
    ]);
    const [selectedId, setSelectedId] = useState("1");
    const selected = conversations.find((c) => c.id === selectedId);

    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />

                {/* BẮT ĐẦU: Layout chat giống hình */}
                <div className={styles.chatWrapper}>
                    {/* LEFT: danh sách hội thoại */}
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
                                    c.name.toLowerCase().includes(search.trim().toLowerCase())
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

                    {/* RIGHT: khu vực chat */}
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
                                    <div className={styles.headerName}>{selected?.name || "Marketo"}</div>
                                    <div className={styles.headerStatus}>Offline</div>
                                </div>
                            </div>
                        </header>

                        <div className={styles.chatBody}>
                            <span className={styles.emptyMsg}>Chưa có tin nhắn nào</span>
                        </div>

                        <div className={styles.chatInputBar}>
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                className={styles.chatInput}
                            />
                            <button className={styles.sendBtn} aria-label="Gửi">
                                <Send size={20} />
                            </button>
                        </div>
                    </section>
                </div>
                {/* KẾT THÚC: Layout chat */}
            </section>
        </main>
    );
}
