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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";
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
    ["/api/images/", "/images/", "/uploads/", "public/images/"].forEach((pre) =>
      addAbs(pre + fname)
    );
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

  if (clean.startsWith("/uploads/"))
    addAbs(`/api/images/${clean.slice("/uploads/".length)}`);
  if (clean.startsWith("public/images/"))
    addAbs(`/api/images/${clean.slice("public/images/".length)}`);

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
    console.debug("[ImgWithFallback] candidates for", src, list);
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
        else console.warn("Ảnh failed sau mọi fallback:", { original: src, tries });
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

export default function Messages({ currentUserId }: { currentUserId?: string }) {
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  const endRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => threads.find((t) => t._id === selectedId) || null,
    [threads, selectedId]
  );

  const sortedThreads = useMemo(() => {
    const copy = [...threads];
    copy.sort((a, b) => {
      const ta = a?.lastMessage?.at || a?.updatedAt || "";
      const tb = b?.lastMessage?.at || b?.updatedAt || "";
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
    return copy;
  }, [threads]);

  async function fetchThreadsOnce() {
    setError("");
    try {
      const uid = currentUserId || getFallbackUserId();
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
      setThreads(list || []);
      if ((list || []).length && !selectedId) setSelectedId(list[0]._id);
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách hội thoại.");
    }
  }

  useEffect(() => {
    setLoadingList(true);
    fetchThreadsOnce().finally(() => setLoadingList(false));
  }, [currentUserId]);

  useEffect(() => {
    const id = setInterval(fetchThreadsOnce, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
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
      } catch (e: any) {
        setError(e?.message || "Không tải được tin nhắn.");
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

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
      const uid = currentUserId || getFallbackUserId();
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
                const last = c?.lastMessage?.text || "";
                return (
                  <button
                    key={c._id}
                    className={`${styles.convItem} ${selectedId === c._id ? styles.active : ""}`}
                    onClick={() => setSelectedId(c._id)}
                  >
                    <div className={styles.avatar}>
                      {avatarSrc ? (
                        <ImgWithFallback src={avatarSrc} alt={name} className={styles.avatarImg} />
                      ) : (
                        <span>M</span>
                      )}
                      {!!c.unread_user && c.unread_user > 0 && (
                        <span className={styles.badge}>{c.unread_user > 99 ? "99+" : c.unread_user}</span>
                      )}
                    </div>
                    <div className={styles.convMain}>
                      <div className={styles.convTop}>
                        <span className={styles.convName}>{name}</span>
                        <span className={styles.convTime}>{time}</span>
                      </div>
                      <div className={styles.convLast}>{last ? last : "—"}</div>
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
