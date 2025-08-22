"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

type Who = "user" | "seller";
type Thread = {
  _id: string;
  user_id?: { _id?: string; name?: string; avatar?: string; email?: string } | null;
  shop_id?: { _id?: string; name?: string; avatar?: string } | null;
  lastMessage?: { text?: string; at?: string; from?: Who } | null;
  updatedAt?: string;
};
type Msg = {
  _id: string;
  sender: Who; // BE có thể trả "user"/"seller"
  text?: string;
  attachments?: Array<{ url?: string; name?: string; type?: string }>;
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

function getFallbackUserId(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const u = JSON.parse(raw);
    return u?._id || u?.id || "";
  } catch {
    return "";
  }
}

export default function Messages({ currentUserId }: { currentUserId?: string }) {
  // ====== state ======
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  // ====== helpers ======
  const selected = useMemo(
    () => threads.find((t) => t._id === selectedId) || null,
    [threads, selectedId]
  );

  // ====== fetch: thread list for seller ======
  useEffect(() => {
    (async () => {
      setLoadingList(true);
      setError("");
      try {
        const uid = currentUserId || getFallbackUserId();
        if (!uid) throw new Error("Không tìm thấy userId. Hãy truyền currentUserId hoặc lưu user vào localStorage.");

        const url = `${API_BASE}/api/messeger/threads/me/seller?seller_user_id=${encodeURIComponent(
          uid
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Lỗi lấy danh sách hội thoại: ${res.status} - ${txt}`);
        }
        const data = await res.json();
        // Chuẩn hóa: BE có thể trả {status, result} hoặc mảng trực tiếp
        const list: Thread[] = Array.isArray(data) ? data : (data.result || data.threads || []);
        setThreads(list || []);
        // auto select thread đầu tiên
        if ((list || []).length && !selectedId) {
          setSelectedId(list[0]._id);
        }
      } catch (e: any) {
        setError(e?.message || "Không tải được danh sách hội thoại.");
      } finally {
        setLoadingList(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ====== fetch: messages of selected thread ======
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      setLoadingMsgs(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/${selectedId}/messages?page=1&limit=200`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Lỗi lấy tin nhắn: ${res.status} - ${txt}`);
        }
        const data = await res.json();
        const list: Msg[] = Array.isArray(data) ? data : (data.result || data.messages || []);
        setMessages(list || []);
      } catch (e: any) {
        setError(e?.message || "Không tải được tin nhắn.");
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [selectedId]);

  // ====== send message ======
  const handleSend = async () => {
    if (!text.trim() || !selectedId || sending) return;
    setSending(true);
    setError("");
    const content = text;
    setText("");

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimistic: Msg = {
      _id: tempId,
      sender: "seller",
      text: content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      // thử gửi JSON
      let res = await fetch(`${API_BASE}/api/messeger/threads/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ who: "seller", text: content }),
      });

      // nếu BE không nhận JSON (415/400), fallback multipart
      if (!res.ok && res.status !== 200) {
        const fd = new FormData();
        fd.append("who", "seller");
        fd.append("text", content);
        res = await fetch(`${API_BASE}/api/messeger/threads/${selectedId}/messages`, {
          method: "POST",
          body: fd,
        });
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Gửi tin nhắn thất bại: ${res.status} - ${txt}`);
      }

      const data = await res.json();
      // Chuẩn hóa message trả về (nếu có)
      const saved: Msg =
        (data?.message || data?.result || data) as Msg;

      setMessages((prev) => {
        // thay optimistic bằng saved nếu có _id thật
        if (saved && saved._id) {
          return prev.map((m) => (m._id === tempId ? saved : m));
        }
        return prev;
      });

      // cập nhật lastMessage ở danh sách thread
      setThreads((prev) =>
        prev.map((t) =>
          t._id === selectedId
            ? {
              ...t,
              lastMessage: { text: content, at: new Date().toISOString(), from: "seller" },
              updatedAt: new Date().toISOString(),
            }
            : t
        )
      );
    } catch (e: any) {
      // revert optimistic nếu lỗi
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError(e?.message || "Gửi tin nhắn thất bại.");
      setText(content); // trả lại text cho người dùng sửa/ gửi lại
    } finally {
      setSending(false);
    }
  };

  // ====== render ======
  const filteredThreads = useMemo(
    () =>
      threads.filter((c) => {
        const name =
          c?.user_id?.name ||
          c?.shop_id?.name ||
          "Cuộc hội thoại";
        return name.toLowerCase().includes(search.toLowerCase());
      }),
    [threads, search]
  );

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.chatWrapper}>
          {/* Sidebar danh sách hội thoại */}
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
              {loadingList && <div className={styles.loadingItem}>Đang tải hội thoại…</div>}
              {!loadingList && filteredThreads.length === 0 && (
                <div className={styles.empty}>Không có hội thoại</div>
              )}

              {filteredThreads.map((c) => {
                const name = c?.user_id?.name || c?.shop_id?.name || "Cuộc hội thoại";
                const avatar = c?.user_id?.avatar || c?.shop_id?.avatar || "";
                const time =
                  c?.lastMessage?.at
                    ? new Date(c.lastMessage.at).toLocaleString()
                    : c?.updatedAt
                      ? new Date(c.updatedAt).toLocaleString()
                      : "";
                const last = c?.lastMessage?.text || "";

                return (
                  <button
                    key={c._id}
                    className={`${styles.convItem} ${selectedId === c._id ? styles.active : ""}`}
                    onClick={() => setSelectedId(c._id)}
                  >
                    <div className={styles.avatar}>
                      {avatar ? <img src={avatar} alt={name} /> : <span>M</span>}
                    </div>
                    <div className={styles.convMain}>
                      <div className={styles.convTop}>
                        <span className={styles.convName}>{name}</span>
                        <span className={styles.convTime}>{time}</span>
                      </div>
                      <div className={styles.convLast}>{last}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Pane chat */}
          <section className={styles.chatPane}>
            <header className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.headerAvatar}>
                  {selected?.user_id?.avatar || selected?.shop_id?.avatar ? (
                    <img
                      src={selected?.user_id?.avatar || selected?.shop_id?.avatar || ""}
                      alt={selected?.user_id?.name || selected?.shop_id?.name || "Chat"}
                    />
                  ) : (
                    <span>M</span>
                  )}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.headerName}>
                    {selected?.user_id?.name || selected?.shop_id?.name || "Chat"}
                  </div>
                  <div className={styles.headerStatus}>—</div>
                </div>
              </div>
            </header>

            <div className={styles.chatBody}>
              {loadingMsgs && <div className={styles.loadingItem}>Đang tải tin nhắn…</div>}
              {!loadingMsgs &&
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`${styles.msgRow} ${m.sender === "seller" ? styles.right : styles.left}`}
                  >
                    <div className={styles.msgBubble}>
                      <div className={styles.msgMeta}>
                        <b>{m.sender === "seller" ? "Bạn" : "Khách"}</b>{" "}
                        <span>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}
                        </span>
                      </div>
                      {m.text && <div className={styles.msgText}>{m.text}</div>}
                    </div>
                  </div>
                ))}

              {!loadingMsgs && messages.length === 0 && (
                <div className={styles.empty}>Chưa có tin nhắn</div>
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
              <button className={styles.sendBtn} onClick={handleSend} disabled={!text.trim() || sending || !selectedId}>
                <Send size={20} />
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
