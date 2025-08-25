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
  unread_user?: number;
};
type Attachment = { url?: string; name?: string; type?: string };
type Msg = {
  _id: string;
  sender: Who;
  text?: string;
  attachments?: Attachment[];
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo.click";
const SELLER_ID_FIELD = "seller_user_id";

/* ===================== Fallback ảnh FE-only ===================== */
function encodePath(path: string) {
  return path
    .split("/")
    .map((seg, i) => (i === 0 && seg === "" ? "" : encodeURIComponent(seg)))
    .join("/");
}
function normalizeUrl(u?: string) {
  if (!u) return "";
  let url = u.trim().replace(/\\/g, "/").replace(/\?+.*/, "");
  if (/^https?:\/\//i.test(url)) {
    try {
      const obj = new URL(url);
      obj.pathname = encodePath(decodeURIComponent(obj.pathname));
      return obj.toString();
    } catch {
      return url;
    }
  }
  if (url.startsWith("public/images/")) url = `/api/images/${url.slice(14)}`;
  if (!url.startsWith("/")) url = `/${url}`;
  return `${API_BASE}${encodePath(url)}`;
}
function buildFallbacks(raw?: string) {
  const out: string[] = [];
  if (!raw) return out;
  const clean = raw.trim().replace(/\\/g, "/").replace(/\?+.*/, "");
  const parts = clean.split("/");
  const file = parts.pop() || "";
  const dir = parts.join("/");
  const lowerFile = file.toLowerCase();
  const isBareFile = !dir;
  const addAbs = (p: string) => out.push(normalizeUrl(p));
  const addWithPrefixes = (fname: string) => {
    ["/api/images/", "/images/", "/uploads/", "public/images/"].forEach((pre) => addAbs(pre + fname));
  };
  if (dir) addAbs([dir, file].filter(Boolean).join("/"));
  else addAbs(file);
  if (lowerFile !== file) {
    if (dir) addAbs([dir, lowerFile].filter(Boolean).join("/"));
    else addAbs(lowerFile);
  }
  const exts = ["webp", "jpg", "jpeg", "png"];
  const base = lowerFile.replace(/\.[a-z0-9]+$/i, "");
  exts.forEach((ext) => {
    const candidate = `${base}.${ext}`;
    if (dir) addAbs([dir, candidate].filter(Boolean).join("/"));
    else addAbs(candidate);
  });
  if (isBareFile) {
    addWithPrefixes(file);
    if (lowerFile !== file) addWithPrefixes(lowerFile);
    exts.forEach((ext) => addWithPrefixes(`${base}.${ext}`));
  }
  if (clean.startsWith("/uploads/")) addAbs(`/api/images/${clean.slice("/uploads/".length)}`);
  if (clean.startsWith("public/images/")) addAbs(`/api/images/${clean.slice("public/images/".length)}`);
  return Array.from(new Set(out));
}
function ImgWithFallback({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [tries, setTries] = useState<string[]>(() => buildFallbacks(src));
  const [idx, setIdx] = useState(0);
  const cur = tries[idx] || "";
  useEffect(() => {
    const list = buildFallbacks(src);
    setTries(list);
    setIdx(0);
  }, [src]);
  if (!cur) return null;
  return (
    <img
      src={cur}
      alt={alt}
      className={className}
      onError={() => {
        const next = idx + 1;
        if (next < tries.length) setIdx(next);
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
/* =================== /Fallback ảnh FE-only ====================== */

function getToken() {
  try {
    return localStorage.getItem("access_token") || localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}
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

/* ===================== READ STATE (persist) ===================== */
type LastSeenMap = Record<string, number>;
const LS_KEY_LAST_SEEN = "msg_last_seen";
const LS_KEY_SELECTED = "selected_thread_id";

function loadLastSeen(): LastSeenMap {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY_LAST_SEEN) || "{}");
  } catch {
    return {};
  }
}
function saveLastSeen(map: LastSeenMap) {
  try {
    localStorage.setItem(LS_KEY_LAST_SEEN, JSON.stringify(map));
  } catch {}
}
function markSeen(threadId: string, time = Date.now()) {
  const map = loadLastSeen();
  map[threadId] = time;
  saveLastSeen(map);
}

/** FE quyết định badge: chỉ hiện nếu lastMessage.from === "user" và mới hơn lastSeen */
function unreadFromLastMessage(t: Thread): number {
  const fromUser = t?.lastMessage?.from === "user";
  if (!fromUser) return 0;

  const at = t?.lastMessage?.at ? new Date(t.lastMessage.at).getTime() : 0;
  const seen = loadLastSeen()[t._id] || 0;

  if (at && seen && seen >= at) return 0;
  if (typeof t.unread_user === "number") return t.unread_user;
  return at > seen ? 1 : 0;
}

/* (Optional) Gọi BE đánh dấu đã đọc nếu có route này; không có cũng ok */
async function apiMarkRead(threadId: string) {
  const token = getToken();
  try {
    await fetch(`${API_BASE}/api/messeger/threads/${threadId}/read`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {}
}
/* =================== /READ STATE ====================== */

/** PAGE COMPONENT – KHÔNG NHẬN PROPS TÙY Ý */
export default function Messages() {
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedIdRef = useRef<string>("");
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const endRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => threads.find((t) => t._id === selectedId) || null, [threads, selectedId]);

  const sortedThreads = useMemo(() => {
    const copy = [...threads];
    copy.sort((a, b) => {
      const ta = a?.lastMessage?.at || a?.updatedAt || "";
      const tb = b?.lastMessage?.at || b?.updatedAt || "";
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
    return copy;
  }, [threads]);

  // ===== fetch: thread list for seller (poll + unread compute) =====
  async function fetchThreadsOnce() {
    setError("");
    try {
      const uid = getFallbackUserId();
      if (!uid) throw new Error("Không tìm thấy userId.");

      const url = `${API_BASE}/api/messeger/threads/me/seller?${SELLER_ID_FIELD}=${encodeURIComponent(uid)}`;
      const token = getToken();
      const res = await fetch(url, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Lỗi lấy danh sách hội thoại: ${res.status}`);
      const data = await res.json();
      const list: Thread[] = Array.isArray(data) ? data : (data.result || data.threads || []);

      // FE quyết định unread; thread đang mở thì luôn 0
      const curId = selectedIdRef.current;
      const normalized = (list || []).map((t) => {
        if (t._id === curId) return { ...t, unread_user: 0 };
        const unread = unreadFromLastMessage(t); // chỉ đếm khi lastMessage.from === 'user'
        return { ...t, unread_user: unread };
      });

      setThreads(normalized || []);

      // Khôi phục lựa chọn
      if ((normalized || []).length) {
        setSelectedId((prev) => {
          if (prev && normalized.some((t) => t._id === prev)) return prev;
          try {
            const saved = localStorage.getItem(LS_KEY_SELECTED) || "";
            if (saved && normalized.some((t) => t._id === saved)) return saved;
          } catch {}
          return normalized[0]._id;
        });
      } else {
        setSelectedId("");
      }
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách hội thoại.");
    }
  }

  // init selectedId từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY_SELECTED);
      if (saved) setSelectedId(saved);
    } catch {}
  }, []);

  useEffect(() => {
    setLoadingList(true);
    fetchThreadsOnce().finally(() => setLoadingList(false));
  }, []);

  // Poll 10s để phát hiện tin mới → badge
  useEffect(() => {
    const id = setInterval(fetchThreadsOnce, 10000);
    return () => clearInterval(id);
  }, []);

  // ===== fetch: messages of selected thread =====
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    (async () => {
      setLoadingMsgs(true);
      setError("");
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE}/api/messeger/threads/${selectedId}/messages?page=1&limit=200`,
          { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );
        if (!res.ok) throw new Error(`Lỗi lấy tin nhắn: ${res.status}`);
        const data = await res.json();
        const list: Msg[] = Array.isArray(data) ? data : (data.result || data.messages || []);
        setMessages(list || []);

        // Đánh dấu đã đọc (persist + optimistic)
        markSeen(selectedId);
        setThreads((prev) => prev.map((t) => (t._id === selectedId ? { ...t, unread_user: 0 } : t)));
        apiMarkRead(selectedId); // có cũng được, không có cũng không sao
      } catch (e: any) {
        setError(e?.message || "Không tải được tin nhắn.");
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [selectedId]);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // ===== send message =====
  const handleSend = async () => {
    if (!text.trim() || !selectedId || sending) return;
    setSending(true);
    setError("");

    const content = text.trim();
    setText("");

    const tempId = `temp-${Date.now()}`;
    const optimistic: Msg = {
      _id: tempId,
      sender: "seller",
      text: content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const uid = getFallbackUserId();
      const token = getToken();

      let res = await fetch(`${API_BASE}/api/messeger/threads/${selectedId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sender: "seller",
          who: "seller",
          text: content,
          [SELLER_ID_FIELD]: uid,
        }),
      });

      if (!res.ok) {
        const fd = new FormData();
        fd.append("sender", "seller");
        fd.append("who", "seller");
        fd.append("text", content);
        if (uid) fd.append(SELLER_ID_FIELD, uid);

        res = await fetch(`${API_BASE}/api/messeger/threads/${selectedId}/messages`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });
      }

      if (!res.ok) throw new Error(`Gửi tin nhắn thất bại: ${res.status}`);
      const data = await res.json();
      const saved: Msg = (data?.message || data?.result || data) as Msg;
      setMessages((prev) => (saved && saved._id ? prev.map((m) => (m._id === tempId ? saved : m)) : prev));

      // Vừa trả lời → coi như đã đọc; nâng mốc lên 1s để thắng race
      const now = Date.now();
      markSeen(selectedId, now + 1000);
      setThreads((prev) =>
        prev.map((t) =>
          t._id === selectedId
            ? {
                ...t,
                unread_user: 0,
                lastMessage: { text: content, at: new Date(now).toISOString(), from: "seller" },
                updatedAt: new Date(now).toISOString(),
              }
            : t
        )
      );
      apiMarkRead(selectedId);
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError(e?.message || "Gửi tin nhắn thất bại.");
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = useMemo(
    () =>
      sortedThreads.filter((c) => {
        const name = c?.user_id?.name || c?.shop_id?.name || "Cuộc hội thoại";
        return name.toLowerCase().includes(search.toLowerCase());
      }),
    [sortedThreads, search]
  );

  function renderAttachments(atts?: Attachment[]) {
    if (!atts || !atts.length) return null;
    return (
      <div className={styles.attachWrap}>
        {atts.map((a, idx) => {
          const raw = a?.url || "";
          const lower = raw.toLowerCase();
          const name = a?.name || raw.split("/").pop() || "file";
          const isImg = (a?.type || "").startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lower);
          const isVid = (a?.type || "").startsWith("video/") || /\.(mp4|webm|ogg|mov|m4v)$/.test(lower);

          if (isImg) {
            return (
              <a key={idx} href={normalizeUrl(raw)} target="_blank" rel="noreferrer" className={styles.attachItem}>
                <ImgWithFallback src={raw} alt={name} className={styles.attachImage} />
              </a>
            );
          }
          if (isVid) {
            return (
              <div key={idx} className={styles.attachItem}>
                <video src={normalizeUrl(raw)} controls className={styles.attachVideo} />
              </div>
            );
          }
          return (
            <a key={idx} href={normalizeUrl(raw)} target="_blank" rel="noreferrer" className={styles.attachFile}>
              {name}
            </a>
          );
        })}
      </div>
    );
  }

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
              <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className={styles.convList}>
              {loadingList && <div className={styles.loadingItem}>Đang tải hội thoại…</div>}
              {!loadingList && filteredThreads.length === 0 && <div className={styles.empty}>Không có hội thoại</div>}
              {filteredThreads.map((c) => {
                const name = c?.user_id?.name || c?.shop_id?.name || "Cuộc hội thoại";
                const avatarSrc = c?.user_id?.avatar || c?.shop_id?.avatar || "";
                const time =
                  c?.lastMessage?.at
                    ? new Date(c.lastMessage.at).toLocaleString()
                    : c?.updatedAt
                    ? new Date(c.updatedAt).toLocaleString()
                    : "";
                const last = c?.lastMessage?.text || "—";
                const isUnread = (c.unread_user ?? 0) > 0;

                return (
                  <button
                    key={c._id}
                    className={`${styles.convItem} ${selectedId === c._id ? styles.active : ""} ${
                      isUnread ? styles.unread : ""
                    }`}
                    onClick={() => {
                      setSelectedId(c._id);
                      try {
                        localStorage.setItem(LS_KEY_SELECTED, c._id);
                      } catch {}
                      // mở → mark read ngay, lưu persist
                      markSeen(c._id);
                      setThreads((prev) => prev.map((t) => (t._id === c._id ? { ...t, unread_user: 0 } : t)));
                      apiMarkRead(c._id);
                    }}
                  >
                    <div className={styles.avatar}>
                      {avatarSrc ? (
                        <ImgWithFallback src={avatarSrc} alt={name} className={styles.avatarImg} />
                      ) : (
                        <span>M</span>
                      )}
                      {isUnread && (
                        <span className={styles.badge}>{c.unread_user! > 99 ? "99+" : c.unread_user}</span>
                      )}
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
                  {(selected?.user_id?.avatar || selected?.shop_id?.avatar) ? (
                    <ImgWithFallback
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
                  <div key={m._id} className={`${styles.msgRow} ${m.sender === "seller" ? styles.right : styles.left}`}>
                    <div className={styles.msgBubble}>
                      <div className={styles.msgMeta}>
                        <b>{m.sender === "seller" ? "Bạn" : "Khách"}</b>{" "}
                        <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}</span>
                      </div>
                      {m.text && <div className={styles.msgText}>{m.text}</div>}
                      {renderAttachments(m.attachments)}
                    </div>
                  </div>
                ))}
              {!loadingMsgs && messages.length === 0 && <div className={styles.empty}>Chưa có tin nhắn</div>}
              <div ref={endRef} />
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
