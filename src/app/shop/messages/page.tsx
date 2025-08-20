"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

export default function Messages() {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState("global"); // 1 phòng mặc định: global
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // ---- LOAD tin nhắn theo room (selectedId) ----
    const loadMessages = async (room: string) => {
        try {
            setLoading(true);
            setErr("");
            const res = await fetch(
                `https://fiyo.click/api/chatMessages?room=${encodeURIComponent(room)}&page=1&limit=50`,
                { cache: "no-store" }
            );
            if (!res.ok) throw new Error("Không lấy được dữ liệu");
            const data = await res.json();
            const items = Array.isArray(data?.items) ? data.items : [];
            setMessages(items);

            // Tạo danh sách hội thoại trái từ dữ liệu thật
            const last = items.length > 0 ? items[items.length - 1] : null;
            const conv = [
                {
                    id: "global",
                    name: "Marketo",
                    lastMsg: last?.text || "",
                    time: last?.createdAt ? new Date(last.createdAt).toLocaleString() : "",
                    avatar: "/logo.png",
                },
            ];
            setConversations(
                conv.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
            );
        } catch (e: any) {
            setErr(e?.message || "Lỗi tải dữ liệu");
            setMessages([]);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    // Lần đầu & khi đổi room
    useEffect(() => {
        loadMessages(selectedId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    // Poll 5s giống style Order
    useEffect(() => {
        const itv = setInterval(() => loadMessages(selectedId), 5000);
        return () => clearInterval(itv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, search]);

    // ---- GỬI TIN NHẮN (REST thuần) ----
    const handleSend = async () => {
        const t = text.trim();
        if (!t) return;
        try {
            setErr("");
            const res = await fetch(`https://fiyo.click/api/chatMessages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room: selectedId,
                    text: t,
                    sender: { name: "admin", role: "admin" }, // thay theo user thực tế nếu có
                }),
            });
            const data = await res.json();
            if (!res.ok || !data?.item?._id) throw new Error(data?.message || "Gửi tin thất bại");
            setText("");
            // nạp lại để thấy tin mới
            loadMessages(selectedId);
        } catch (e: any) {
            setErr(e?.message || "Gửi tin thất bại");
        }
    };

    const selected =
        conversations.find((c) => c.id === selectedId) ||
        { id: "global", name: "Fiyo", avatar: "/logo.png" };

    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />

                {/* BẮT ĐẦU: Layout chat giống hình */}
                <div className={styles.chatWrapper}>
                    {/* LEFT: danh sách hội thoại (từ dữ liệu thật) */}
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
                            {conversations.map((c) => (
                                <button
                                    key={c.id}
                                    className={`${styles.convItem} ${selectedId === c.id ? styles.active : ""}`}
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
                            {/* nếu rỗng vẫn render 1 item để giữ layout */}
                            {conversations.length === 0 && (
                                <button
                                    className={`${styles.convItem} ${styles.active}`}
                                    onClick={() => setSelectedId("global")}
                                >
                                    <div className={styles.avatar}><span>M</span></div>
                                    <div className={styles.convMain}>
                                        <div className={styles.convTop}>
                                            <span className={styles.convName}>Fiyo</span>
                                            <span className={styles.convTime}></span>
                                        </div>
                                        <div className={styles.convLast}></div>
                                    </div>
                                </button>
                            )}
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
                                    <div className={styles.headerName}>{selected?.name || "Fiyo"}</div>
                                    <div className={styles.headerStatus}>Offline</div>
                                </div>
                            </div>
                        </header>

                        <div className={styles.chatBody}>
                            {loading ? (
                                <span className={styles.emptyMsg}>Đang tải...</span>
                            ) : err ? (
                                <span className={styles.emptyMsg} style={{ color: "red" }}>{err}</span>
                            ) : Array.isArray(messages) && messages.length > 0 ? (
                                messages.map((m: any) => (
                                    <div key={m?._id} className={styles.msgRow}>
                                        <div className={styles.msgBubble}>
                                            <div className={styles.msgMeta}>
                                                <b>{m?.sender?.name ?? "guest"}</b>
                                                <span className={styles.msgTime}>
                                                    {m?.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                                                </span>
                                            </div>
                                            <div className={styles.msgText}>{m?.text ?? ""}</div>
                                            {!!m?.attachments?.length && (
                                                <div className={styles.msgAttach}>
                                                    {m.attachments.map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer">
                                                            file {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className={styles.emptyMsg}>Chưa có tin nhắn nào</span>
                            )}
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
                            <button className={styles.sendBtn} aria-label="Gửi" onClick={handleSend}>
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
