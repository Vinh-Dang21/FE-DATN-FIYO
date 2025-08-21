"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

type Thread = {
  _id: string;
  user_id?: { name?: string; avatar?: string; email?: string } | null;
  shop_id?: { name?: string; avatar?: string } | null;
  lastMessage?: { text?: string; at?: string; from?: "user" | "seller" } | null;
  updatedAt?: string;
};
type Msg = {
  _id: string;
  sender: "user" | "seller";
  text?: string;
  attachments?: Array<{ url?: string; name?: string; type?: string }>;
  createdAt?: string;
};

export default function Messages() {
  // ====== STATE ======
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ====== GỌI GIỐNG FILE ORDER (fetch thẳng domain) ======
  const BASE_API = "https://fiyo.click/api/messeger";

  // ====== CHỖ 1: sellerId (CHỦ SHOP) ======
  // 👉 THAY chuỗi dưới bằng shops.user_id (ID chủ shop) để chắc chắn ra dữ liệu
  const OWNER_ID = "PUT_OWNER_ID_OF_SHOP_HERE"; // VD: "68a466c6566d4a95019d201c_owner"
  const [sellerId, setSellerId] = useState<string>("");

  useEffect(() => {
    // ƯU TIÊN OWNER_ID nếu bạn đã điền đúng; nếu không, fallback từ localStorage.user
    if (OWNER_ID && OWNER_ID !== "PUT_OWNER_ID_OF_SHOP_HERE") {
      setSellerId(OWNER_ID);
      return;
    }
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const id = u?._id || u?.id || "";
        setSellerId(id || "");
      }
    } catch { }
  }, []);

  // ====== helpers ======
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dd = `0${d.getDate()}`.slice(-2);
    const mm = `0${d.getMonth() + 1}`.slice(-2);
    const yyyy = d.getFullYear();
    const hh = `0${d.getHours()}`.slice(-2);
    const mi = `0${d.getMinutes()}`.slice(-2);
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  };

  // ====== CHỖ 2: LẤY THREAD – chuẩn hoá parse mọi kiểu payload ======
  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_API}/threads/me/seller?seller_user_id=${sellerId}`
        );
        const raw = await res.text(); // đọc thô trước để debug/parse an toàn

        if (!res.ok) throw new Error(`Lỗi lấy thread (${res.status})`);

        let data: any = [];
        try {
          data = JSON.parse(raw);
        } catch {
          data = [];
        }

        const list: Thread[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.result)
            ? data.result
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setThreads(list || []);
        setSelectedId(list?.[0]?._id || "");
      } catch (e: any) {
        setErr(e?.message || "Lỗi lấy thread");
        setThreads([]);
        setSelectedId("");
      } finally {
        setLoading(false);
      }
    })();
  }, [sellerId]);

  // ====== LẤY MESSAGES KHI CHỌN THREAD ======
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      setHasMore(true);
      setPage(1);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_API}/threads/${selectedId}/messages?page=1&limit=20`
        );
        if (!res.ok) throw new Error("Lỗi tải tin nhắn");
        const first: Msg[] = await res.json();

        setMessages(Array.isArray(first) ? first : []);
        setPage(1);
        setHasMore(Array.isArray(first) && first.length === 20);

        // mark read phía seller
        await fetch(`${BASE_API}/threads/${selectedId}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "seller", user_id: sellerId || undefined }),
        });
      } catch (e: any) {
        setErr(e?.message || "Lỗi tải tin nhắn");
        setMessages([]);
        setPage(1);
        setHasMore(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId, sellerId]);

  // ====== TẢI THÊM ======
  const loadMore = async () => {
    if (!selectedId || !hasMore || loading) return;
    try {
      setLoading(true);
      const next = page + 1;
      const res = await fetch(
        `${BASE_API}/threads/${selectedId}/messages?page=${next}&limit=20`
      );
      if (!res.ok) throw new Error("Lỗi tải thêm tin nhắn");
      const older: Msg[] = await res.json();
      setMessages((prev) => [...older, ...prev]);
      setPage(next);
      setHasMore(Array.isArray(older) && older.length === 20);
    } catch (e: any) {
      setErr(e?.message || "Lỗi tải thêm tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  // ====== CHỖ 3: GỬI TIN (luôn gửi kèm user_id = sellerId) ======
  const handleSend = async () => {
    if (!text.trim()) return;
    if (!selectedId) {
      alert("Chưa có cuộc hội thoại — hãy chọn 1 thread ở cột trái trước.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BASE_API}/threads/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          sender: "seller",
          user_id: sellerId, // <- bắt buộc là OWNER_ID/chủ shop
        }),
      });
      if (!res.ok) throw new Error("Gửi tin nhắn thất bại");
      const created: Msg = await res.json();
      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Gửi tin nhắn thất bại");
    } finally {
      setLoading(false);
    }
  };

  const selectedThread =
    threads.find((t) => t?._id === selectedId) || threads[0];

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        <div className={styles.chatWrapper}>
          {/* SIDEBAR THREADS */}
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
              {threads.length === 0 ? (
                <div style={{ padding: 12, color: "#777" }}>
                  Chưa có cuộc hội thoại
                </div>
              ) : (
                threads
                  .filter((t) =>
                    String(t?.user_id?.name || "")
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((t) => (
                    <button
                      key={t?._id}
                      className={`${styles.convItem} ${selectedId === t?._id ? styles.active : ""
                        }`}
                      onClick={() => setSelectedId(t?._id)}
                    >
                      <div className={styles.avatar}>
                        {t?.user_id?.avatar ? (
                          <img
                            src={t.user_id.avatar}
                            alt={t?.user_id?.name || "User"}
                          />
                        ) : (
                          <span>M</span>
                        )}
                      </div>
                      <div className={styles.convMain}>
                        <div className={styles.convTop}>
                          <span className={styles.convName}>
                            {t?.user_id?.name || "Khách"}
                          </span>
                          <span className={styles.convTime}>
                            {t?.updatedAt ? formatDate(t.updatedAt) : ""}
                          </span>
                        </div>
                        <div className={styles.convLast}>
                          {t?.lastMessage?.text || ""}
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </aside>

          {/* PANE CHAT */}
          <section className={styles.chatPane}>
            <header className={styles.chatHeader}>
              <div className={styles.headerLeft}>
                <div className={styles.headerAvatar}>
                  {selectedThread?.user_id?.avatar ? (
                    <img
                      src={selectedThread.user_id.avatar}
                      alt={selectedThread?.user_id?.name || "User"}
                    />
                  ) : (
                    <span>M</span>
                  )}
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.headerName}>
                    {selectedThread?.user_id?.name || "Khách"}
                  </div>
                  <div className={styles.headerStatus}>Offline</div>
                </div>
              </div>
            </header>

            {hasMore && selectedId ? (
              <div style={{ padding: "8px 12px" }}>
                <button onClick={loadMore} disabled={loading}>
                  Tải thêm
                </button>
              </div>
            ) : null}

            <div className={styles.chatBody}>
              {messages.map((m) => (
                <div
                  key={m?._id}
                  className={`${styles.msgRow} ${m?.sender === "seller" ? styles.right : styles.left
                    }`}
                >
                  <div className={styles.msgBubble}>
                    <div className={styles.msgMeta}>
                      <b>{m?.sender || ""}</b>{" "}
                      <span>{m?.createdAt ? formatDate(m.createdAt) : ""}</span>
                    </div>

                    {m?.text ? (
                      <div className={styles.msgText}>{m.text}</div>
                    ) : null}

                    {Array.isArray(m?.attachments) &&
                      m.attachments.length > 0 ? (
                      <div style={{ marginTop: 4 }}>
                        {m.attachments.map((a, idx) => (
                          <a
                            key={idx}
                            href={a?.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginRight: 8 }}
                          >
                            {(a?.type === "image" && "Ảnh") ||
                              (a?.type === "video" && "Video") ||
                              "File"}
                            : {a?.name}
                          </a>
                        ))}
                      </div>
                    ) : null}
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
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!text.trim()}
              >
                <Send size={20} />
              </button>
            </div>

            {err ? (
              <div style={{ color: "red", padding: "6px 12px" }}>{err}</div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
