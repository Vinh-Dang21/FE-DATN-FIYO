"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

type Thread = any;
type Message = any;

export default function Messages() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [text, setText] = useState("");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ====== cấu hình + auto-probe ======
  const HOST = "https://fiyo.click";
  const CANDIDATE_BASES = [
    `${HOST}/api/messeger/threads`,   // theo app.js (messeger)
    `${HOST}/api/messenger/threads`,  // chính tả chuẩn
    `${HOST}/api/chat/threads`,       // có thể mount dưới /api/chat
    `${HOST}/api/threads`,            // mount thẳng /api
  ];
  const [threadsBaseURL, setThreadsBaseURL] = useState<string>(""); // sẽ dò ra 1 cái hợp lệ
  const [probeLog, setProbeLog] = useState<{ url: string; status: number }[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = rawUser ? JSON.parse(rawUser) : {};
  const sellerUserId: string = parsedUser?._id || parsedUser?.id || "";

  const h = (extra?: Record<string, string>) => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  });

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

  // 1) Dò base URL hợp lệ
  useEffect(() => {
    let mounted = true;
    (async () => {
      const logs: { url: string; status: number }[] = [];
      for (const base of CANDIDATE_BASES) {
        const test = sellerUserId
          ? `${base}/me/seller?seller_user_id=${sellerUserId}`
          : `${base}/me/seller`;
        try {
          const res = await fetch(test, { headers: h(), cache: "no-store" });
          logs.push({ url: test, status: res.status });
          if (res.ok) {
            if (!mounted) return;
            setThreadsBaseURL(base); // <-- dùng base này cho mọi request sau
            setProbeLog(logs);
            return;
          }
        } catch {
          logs.push({ url: test, status: 0 });
        }
      }
      if (mounted) {
        setProbeLog(logs);
        setErr("Không tìm thấy route chat hợp lệ. Kiểm tra prefix mount trên BE/Nginx.");
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Lấy danh sách thread khi đã dò xong base
  useEffect(() => {
    if (!threadsBaseURL) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const url = sellerUserId
          ? `${threadsBaseURL}/me/seller?seller_user_id=${sellerUserId}`
          : `${threadsBaseURL}/me/seller`;
        const res = await fetch(url, { headers: h(), cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Lỗi lấy thread (${res.status}) tại ${url}`);
        }
        const list = await res.json();
        if (!mounted) return;
        setThreads(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) {
          setSelectedId(list[0]?._id || "");
        }
      } catch (e: any) {
        setErr(e?.message || "Lỗi lấy thread");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [threadsBaseURL, sellerUserId]);

  // 3) Khi chọn thread → lấy messages + mark read
  useEffect(() => {
    if (!selectedId || !threadsBaseURL) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const urlMsg = `${threadsBaseURL}/${selectedId}/messages?page=1&limit=20`;
        const res = await fetch(urlMsg, { headers: h(), cache: "no-store" });
        if (!res.ok) throw new Error("Lỗi tải tin nhắn");
        const first = await res.json();
        if (!mounted) return;
        setMessages(Array.isArray(first) ? first : []);
        setPage(1);
        setHasMore(first?.length === 20);

        // mark read phía seller
        await fetch(`${threadsBaseURL}/${selectedId}/read`, {
          method: "POST",
          headers: h({ "Content-Type": "application/json" }),
          body: JSON.stringify({ role: "seller", user_id: sellerUserId || undefined }),
        });
      } catch (e: any) {
        setErr(e?.message || "Lỗi tải tin nhắn");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedId, threadsBaseURL, sellerUserId]);

  // 4) Load more
  const loadMore = async () => {
    if (!hasMore || !selectedId || !threadsBaseURL || loading) return;
    try {
      setLoading(true);
      const next = page + 1;
      const moreUrl = `${threadsBaseURL}/${selectedId}/messages?page=${next}&limit=20`;
      const res = await fetch(moreUrl, { headers: h(), cache: "no-store" });
      if (!res.ok) throw new Error("Lỗi tải thêm tin nhắn");
      const older = await res.json();
      setMessages((prev) => [...older, ...prev]);
      setPage(next);
      setHasMore(older?.length === 20);
    } catch (e: any) {
      setErr(e?.message || "Lỗi tải thêm tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  // 5) Send
  const handleSend = async () => {
    if (!selectedId || !text.trim() || !threadsBaseURL) return;
    try {
      setLoading(true);
      const res = await fetch(`${threadsBaseURL}/${selectedId}/messages`, {
        method: "POST",
        headers: h({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          text: text.trim(),
          sender: "seller", // fallback khi chưa gắn auth
          user_id: sellerUserId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Gửi message thất bại");
      const created = await res.json();
      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Gửi tin nhắn thất bại");
    } finally {
      setLoading(false);
    }
  };

  const selectedThread =
    threads.find((t: any) => t?._id === selectedId) || threads[0];

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        <div className={styles.chatWrapper}>
          {/* Sidebar hội thoại */}
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
              {threads
                ?.filter((t: any) =>
                  String(t?.user_id?.name || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((t: any) => (
                  <button
                    key={t?._id}
                    className={`${styles.convItem} ${selectedId === t?._id ? styles.active : ""}`}
                    onClick={() => setSelectedId(t?._id)}
                  >
                    <div className={styles.avatar}>
                      {t?.user_id?.avatar ? (
                        <img src={t.user_id.avatar} alt={t?.user_id?.name || "User"} />
                      ) : (
                        <span>M</span>
                      )}
                    </div>
                    <div className={styles.convMain}>
                      <div className={styles.convTop}>
                        <span className={styles.convName}>{t?.user_id?.name || "Khách"}</span>
                        <span className={styles.convTime}>
                          {t?.updatedAt ? formatDate(t.updatedAt) : ""}
                        </span>
                      </div>
                      <div className={styles.convLast}>{t?.lastMessage?.text || ""}</div>
                    </div>
                  </button>
                ))}
            </div>
          </aside>

          {/* Pane chat */}
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

            {/* nút tải thêm */}
            {hasMore && selectedId && (
              <div style={{ padding: "8px 12px" }}>
                <button onClick={loadMore} disabled={loading}>
                  Tải thêm
                </button>
              </div>
            )}

            <div className={styles.chatBody}>
              {messages?.map((m: any) => (
                <div
                  key={m?._id}
                  className={`${styles.msgRow} ${m?.sender === "seller" ? styles.right : styles.left}`}
                >
                  <div className={styles.msgBubble}>
                    <div className={styles.msgMeta}>
                      <b>{m?.sender || ""}</b>{" "}
                      <span>{m?.createdAt ? formatDate(m.createdAt) : ""}</span>
                    </div>
                    {m?.text ? <div className={styles.msgText}>{m.text}</div> : null}
                    {Array.isArray(m?.attachments) && m.attachments.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {m.attachments.map((a: any, idx: number) => (
                          <a key={idx} href={a?.url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                            {a?.type === "image" ? "Ảnh" : a?.type === "video" ? "Video" : "File"}: {a?.name}
                          </a>
                        ))}
                      </div>
                    )}
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
              <button className={styles.sendBtn} onClick={handleSend} disabled={!selectedId || !text.trim()}>
                <Send size={20} />
              </button>
            </div>

            {/* hiển thị lỗi + log probe để bạn thấy base nào fail */}
            {err && <div style={{ color: "red", padding: "6px 12px" }}>{err}</div>}
            {!threadsBaseURL && probeLog.length > 0 && (
              <div style={{ fontSize: 12, color: "#b75", padding: "6px 12px" }}>
                <div><b>Đã thử các URL:</b></div>
                {probeLog.map((l, i) => (
                  <div key={i}>{l.url} → {l.status}</div>
                ))}
                <div>→ Nếu tất cả 404: cần BE/Nginx map đúng prefix đến Node (ví dụ /api/messeger hoặc /api/messenger).</div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
