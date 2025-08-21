"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import styles from "./messages.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

export default function Messages() {
  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [sellerId, setSellerId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(""); // _id thread đang chọn
  const [text, setText] = useState("");

  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ===== BASE URL =====
  // 👉 Đang test local:
  const BASE_API = "http://localhost:3000/api/messeger";
  // 👉 Khi lên server đổi lại:
  // const BASE_API = "https://fiyo.click/api/messeger";

  // ===== Helpers =====
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

  // ===== 1) Đọc sellerId sau khi mount =====
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const id = u?._id || u?.id || "";
        if (id) setSellerId(id);
      }
    } catch (e) {
      console.error("Parse user from localStorage failed:", e);
    }
  }, []);

  // ===== 2) Lấy danh sách thread của SELLER khi đã có sellerId =====
  useEffect(() => {
    if (!sellerId) return; // chờ có sellerId
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const url = `${BASE_API}/threads/me/seller?seller_user_id=${sellerId}`;

        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Lỗi lấy thread (${res.status})`);
        }

        const list = await res.json();
        if (!mounted) return;

        setThreads(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) {
          setSelectedId(list[0]?._id || "");
        } else {
          setSelectedId("");
        }
      } catch (e: any) {
        setErr(e?.message || "Lỗi lấy thread");
        console.error("fetch threads error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  // ===== 3) Khi chọn thread → lấy messages + mark read =====
  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        // trang 1
        const res = await fetch(
          `${BASE_API}/threads/${selectedId}/messages?page=1&limit=20`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error("Lỗi tải tin nhắn");
        const firstPage = await res.json();
        if (!mounted) return;

        setMessages(Array.isArray(firstPage) ? firstPage : []);
        setPage(1);
        setHasMore(firstPage?.length === 20);

        // mark read phía seller
        await fetch(`${BASE_API}/threads/${selectedId}/read`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            role: "seller",
            user_id: sellerId || undefined,
          }),
        });
      } catch (e: any) {
        setErr(e?.message || "Lỗi tải tin nhắn");
        console.error("fetch messages error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedId, sellerId]);

  // ===== 4) Tải thêm tin cũ =====
  const loadMore = async () => {
    if (!hasMore || !selectedId || loading) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const next = page + 1;

      const res = await fetch(
        `${BASE_API}/threads/${selectedId}/messages?page=${next}&limit=20`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Lỗi tải thêm tin nhắn");
      const older = await res.json();

      setMessages((prev) => [...older, ...prev]); // older là trang cũ, nối lên đầu
      setPage(next);
      setHasMore(older?.length === 20);
    } catch (e: any) {
      setErr(e?.message || "Lỗi tải thêm tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  // ===== 5) Gửi tin nhắn =====
  const handleSend = async () => {
    if (!text.trim()) return;

    if (!selectedId) {
      alert("Chưa có cuộc hội thoại nào. Hãy chọn một thread ở cột trái hoặc tạo thread trước rồi mới gửi tin.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      const res = await fetch(`${BASE_API}/threads/${selectedId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: text.trim(),
          sender: "seller",           // đúng theo controller của bạn
          user_id: sellerId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Gửi message thất bại");
      const created = await res.json();

      setMessages((prev) => [...prev, created]);
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Gửi tin nhắn thất bại");
      console.error("send message error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ===== (Tuỳ chọn) Tạo thread test – chỉ dùng khi list rỗng (để comment mặc định) =====
  // const TEST_USER_ID = "PUT_USER_ID_HERE";
  // const TEST_SHOP_ID = "PUT_SHOP_ID_HERE";
  // const openTestThread = async () => {
  //   try {
  //     const token = localStorage.getItem("token") || "";
  //     const r = await fetch(`${BASE_API}/threads/open`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //       },
  //       body: JSON.stringify({
  //         user_id: TEST_USER_ID,
  //         shop_id: TEST_SHOP_ID,
  //       }),
  //     });
  //     if (!r.ok) throw new Error(await r.text());
  //     const th = await r.json();
  //     setThreads((prev) => [th, ...prev]);
  //     setSelectedId(th?._id || "");
  //   } catch (e) {
  //     alert("Tạo thread lỗi. Kiểm tra lại user_id/shop_id test.");
  //     console.error(e);
  //   }
  // };

  // Thread đang chọn (header)
  const selectedThread =
    threads.find((t: any) => t?._id === selectedId) || threads[0];

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        {/* bọc Topbar để căn lề thẳng hàng */}
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

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
              {threads.length === 0 ? (
                <div style={{ padding: 12, color: "#777" }}>
                  Chưa có cuộc hội thoại
                  {/* <div style={{ marginTop: 8 }}>
                    <button
                      onClick={openTestThread}
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Tạo thread test
                    </button>
                  </div> */}
                </div>
              ) : (
                threads
                  ?.filter((t: any) =>
                    String(t?.user_id?.name || "")
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map((t: any) => (
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

              {/* Nếu cần nút tạo thread test, bỏ comment bên dưới để hiện nút */}
              {/* <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={openTestThread}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Tạo thread test
                </button>
              </div> */}
            </header>

            {/* nút tải thêm (tuỳ chọn) */}
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
                  className={`${styles.msgRow} ${m?.sender === "seller" ? styles.right : styles.left
                    }`}
                >
                  <div className={styles.msgBubble}>
                    <div className={styles.msgMeta}>
                      <b>{m?.sender || ""}</b>{" "}
                      <span>
                        {m?.createdAt ? formatDate(m.createdAt) : ""}
                      </span>
                    </div>
                    {m?.text ? (
                      <div className={styles.msgText}>{m.text}</div>
                    ) : null}

                    {Array.isArray(m?.attachments) &&
                      m.attachments.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {m.attachments.map((a: any, idx: number) => (
                            <a
                              key={idx}
                              href={a?.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ marginRight: 8 }}
                            >
                              {a?.type === "image"
                                ? "Ảnh"
                                : a?.type === "video"
                                  ? "Video"
                                  : "File"}
                              : {a?.name}
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
