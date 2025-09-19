"use client";
import { Eye, Store, CheckCircle, Lock, Clock, User, Phone, Mail, MoreVertical, Unlock } from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import React from "react";

interface Shop {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status: "active" | "locked" | "pending" | "inactive";
  description?: string;
  avatar?: string;
  banner?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: { _id: string; name: string; email: string; phone?: string };

  // extra từ backend
  rating?: { average: number; count: number };
  sale_count?: number;
  followers?: string[];
}

// Bỏ slash thừa, ghép host nếu cần
const fixUrl = (u?: string) => {
  if (!u) return "/images/default-avatar.png";
  // Nếu backend trả tuyệt đối (http://...), chỉ cần bỏ '//' thừa giữa domain và path
  try {
    const url = new URL(u);
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    return url.toString();
  } catch {
    // Nếu là đường dẫn tương đối (/images/.. hoặc images/..)
    const path = u.replace(/\/{2,}/g, "/");
    return path.startsWith("/") ? path : `/${path}`;
  }
};

const normalizeShop = (s: Shop): Shop => ({
  ...s,
  name: (s.name ?? "").trim(),
  avatar: fixUrl(s.avatar) || "/images/default-avatar.png",
  description: s.description ?? "",
});



const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://fiyo-be.onrender.com/api/";
// 👉 Đặt đúng port backend (VD: 3001). Tạo file .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001

const extractProductsCount = (raw: any): number => {
  if (Array.isArray(raw) && raw.length > 1 && raw[0]?.status === true) return raw.length - 1;
  if (Array.isArray(raw?.products)) return raw.products.length;
  if (Array.isArray(raw)) return raw.length;
  return 0;
};

export default function ShopPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked" | "pending">("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [deliveredRevenue, setDeliveredRevenue] = useState<Record<string, number>>({});
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);



  // Check đăng nhập phía client
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 0) router.push("/warning-login");
    } catch {
      router.push("/warning-login");
    }
  }, [router]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-root]")) setMenuOpenFor(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);


  // Fetch danh sách shop
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE}shop`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text}`);
        }

        const data = await res.json();
        // data có thể là {status:true, result:[...]} hoặc [] thẳng
        const rawList: Shop[] = Array.isArray(data) ? data : data?.result ?? [];
        setShops(rawList.map(normalizeShop));

        // Giả định backend trả { status: true, result: Shop[] }
        if (data?.status && Array.isArray(data.result)) {
          setShops(data.result);
        } else if (Array.isArray(data)) {
          setShops(data); // Trường hợp backend trả thẳng mảng
        } else {
          throw new Error("Response không đúng format mong đợi");
        }
      } catch (error: any) {
        console.error("Lỗi fetch shops:", error);
        setErr(error?.message || "Fetch shop thất bại");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const filteredShops = shops.filter((shop) => {
    const matchesStatus = statusFilter === "all" || shop.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      shop.name?.toLowerCase().includes(q) ||
      shop.email?.toLowerCase().includes(q) ||
      shop.user_id?.name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });


  useEffect(() => {
    if (!shops.length) return;
    let cancelled = false;

    (async () => {
      try {
        const entries = await Promise.all(
          shops.map(async (s) => {
            try {
              const res = await fetch(`${API_BASE}products/shop/${encodeURIComponent(s._id)}`, {
                cache: "no-store",
              });
              const data = await res.json();
              return [s._id, extractProductsCount(data)] as const;
            } catch {
              return [s._id, 0] as const; // lỗi thì coi như 0
            }
          })
        );
        if (!cancelled) setProductCounts(Object.fromEntries(entries));
      } catch {
        /* no-op */
      }
    })();

    return () => { cancelled = true; };
  }, [shops]);

  // Lấy total_price an toàn từ item
  const getItemTotal = (os: any) =>
    typeof os?.total_price === "number"
      ? os.total_price
      : (os?.order_id?.total_price ?? 0);

  // Gọi 1 lần KHÔNG filter để lấy tổng số đơn (result.total)
  async function fetchTotalOrders(shopId: string): Promise<number> {
    const url = new URL(`${API_BASE}orderShop/shop/${encodeURIComponent(shopId)}`);
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "1"); // chỉ cần 1 bản ghi để lấy total
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    return Number(data?.result?.total ?? 0);
  }

  // Gọi NHIỀU trang với status=delivered để cộng doanh thu
  async function sumDeliveredRevenue(shopId: string): Promise<number> {
    let page = 1;
    const limit = 200; // page to hơn để giảm số lần gọi
    let totalPages = 1;
    let sum = 0;

    do {
      const url = new URL(`${API_BASE}orderShop/shop/${encodeURIComponent(shopId)}`);
      url.searchParams.set("status", "delivered");
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(limit));
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();

      const items: any[] = data?.result?.items ?? [];
      for (const os of items) sum += getItemTotal(os);

      totalPages = Number(data?.result?.total_pages ?? 1);
      page += 1;
    } while (page <= totalPages);

    return sum;
  }

  useEffect(() => {
    if (!shops.length) return;
    let cancelled = false;

    (async () => {
      try {
        const countsEntries = await Promise.all(
          shops.map(async (s) => {
            try {
              const total = await fetchTotalOrders(s._id);
              return [s._id, total] as const;
            } catch {
              return [s._id, 0] as const;
            }
          })
        );

        const revenueEntries = await Promise.all(
          shops.map(async (s) => {
            try {
              const rev = await sumDeliveredRevenue(s._id);
              return [s._id, rev] as const;
            } catch {
              return [s._id, 0] as const;
            }
          })
        );

        if (!cancelled) {
          setOrderCounts(Object.fromEntries(countsEntries));
          setDeliveredRevenue(Object.fromEntries(revenueEntries));
        }
      } catch {/* noop */ }
    })();

    return () => { cancelled = true; };
  }, [shops]);

  async function activateShop(id: string) {
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${API_BASE}shop/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Kích hoạt thất bại");
    // cập nhật state theo shop trả về
    setShops(prev => prev.map(s => (s._id === id ? { ...s, status: data?.shop?.status ?? "active" } : s)));
    setMenuOpenFor(null);
    alert(data?.message || "Đã xác nhận shop");
  }

  async function toggleShopStatus(id: string, currentStatus: Shop["status"]) {
    const token = localStorage.getItem("token") || "";
    const res = await fetch(`${API_BASE}shop/${id}/toggle-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Cập nhật trạng thái thất bại");
    // backend trả về shop mới, dùng status mới
    setShops(prev => prev.map(s => (s._id === id ? { ...s, status: data?.shop?.status ?? (currentStatus === "active" ? "locked" : "active") } : s)));
    setMenuOpenFor(null);
    alert(data?.message || (currentStatus === "active" ? "Đã khóa shop" : "Đã mở khóa shop"));
  }

  type ShopDetail = Shop & {
    total_products?: number;
    followers?: string[];
    rating?: { average: number; count: number };
    sale_count?: number;
  };

  const [viewer, setViewer] = useState<{
    open: boolean;
    loading: boolean;
    data?: ShopDetail;
    error?: string;
  }>({ open: false, loading: false });

  function closeViewer() {
    setViewer({ open: false, loading: false });
  }

  async function openViewShop(id: string) {
    setViewer({ open: true, loading: true });
    try {
      const token = localStorage.getItem("token") || "";

      // đúng route BE: /api/Shop/:id (chữ S hoa). Có thể fallback sang /shop/:id nếu cần.
      let res = await fetch(`${API_BASE}Shop/${id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
      });

      // fallback nếu BE dùng /shop/:id
      if (!res.ok) {
        res = await fetch(`${API_BASE}shop/${id}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: "no-store",
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      // BE có thể trả {shop: {...}} hoặc trả thẳng object
      const data: ShopDetail = json?.shop || json;
      setViewer({ open: true, loading: false, data });
    } catch (e: any) {
      setViewer({ open: true, loading: false, error: e?.message || "Không tải được thông tin shop" });
    }
  }

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        {/* Tổng quan */}
        <div className={styles.shopSummary}>
          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>{shops.length}</div>
              <div className={styles.shopLabel}>Tổng số shop</div>
            </div>
            <div className={styles.shopIcon}><Store /></div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>
                {shops.filter(s => s.status === "active").length}
              </div>
              <div className={styles.shopLabel}>Đang hoạt động</div>
            </div>
            <div className={styles.shopIcon}><CheckCircle /></div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>
                {shops.filter(s => s.status === "locked").length}
              </div>
              <div className={styles.shopLabel}>Bị khóa</div>
            </div>
            <div className={styles.shopIcon}><Lock /></div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>
                {shops.filter(s => s.status === "pending").length}
              </div>
              <div className={styles.shopLabel}>Chờ duyệt</div>
            </div>
            <div className={styles.shopIcon}><Clock /></div>
          </div>
        </div>

        {/* Tìm kiếm & lọc */}
        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm ..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Bị khóa</option> {/* đổi từ inactive -> locked */}
              <option value="pending">Chờ duyệt</option>
            </select>

          </div>
        </div>

        {/* Bảng */}
        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Danh sách cửa hàng</h2>

          {loading && <div style={{ padding: 12 }}>Đang tải danh sách shop…</div>}
          {!!err && (
            <div style={{ padding: 12, color: "crimson", whiteSpace: "pre-wrap" }}>
              Lỗi: {err}
            </div>
          )}

          {!loading && !err && (
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Cửa hàng</th>
                  <th>Chủ cửa hàng</th>
                  <th>Trạng thái</th>
                  <th>Sản phẩm</th>
                  <th>Tổng đơn</th>
                  <th>Doanh thu</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop, index) => (
                  <tr key={shop._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className={styles.shopCell}>
                        <img
                          src={shop.avatar || `${API_BASE}images/default-shop.jpg`}
                          alt={shop.name}
                          className={styles.shopImg}
                          loading="lazy"
                        // onError={(e: any) => (e.currentTarget.src = `${API_BASE}images/default-shop.jpg`)}
                        />
                        <div className={styles.shopText}>
                          <div className={styles.shopName}>{shop.name}</div>
                          <div className={styles.shopDesc}>
                            {shop.description || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.ownerCell}>
                        <div className={styles.ownerRow}>
                          <User size={16} className={styles.ownerIcon} />
                          <span className={styles.ownerName}>{shop.user_id?.name || "-"}</span>
                        </div>
                        <div className={styles.ownerRow}>
                          <Phone size={16} className={styles.ownerIcon} />
                          <span className={styles.ownerPhone}>{shop.user_id?.phone || "-"}</span>
                        </div>
                        <div className={styles.ownerRow}>
                          <Mail size={16} className={styles.ownerIcon} />
                          <span className={styles.ownerEmail}>{shop.user_id?.email || "-"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${shop.status === "active"
                          ? styles.active
                          : shop.status === "inactive"
                            ? styles.inactive
                            : shop.status === "locked"
                              ? styles.locked
                              : styles.pending
                          }`}
                      >
                        {shop.status === "active"
                          ? "Hoạt động"
                          : shop.status === "inactive"
                            ? "Tạm ngưng"
                            : shop.status === "locked"
                              ? "Bị khóa"
                              : "Chờ duyệt"}
                      </span>
                    </td>

                    <td>{productCounts[shop._id] ?? "…"}</td>
                    <td>{orderCounts[shop._id] ?? "…"}</td>
                    <td>
                      {deliveredRevenue[shop._id] !== undefined
                        ? `${deliveredRevenue[shop._id].toLocaleString("vi-VN")}₫`
                        : "…"}
                    </td>

                    <td className={styles.actionCell} data-menu-root>
                      <button
                        className={styles.kebabBtn}
                        onClick={() => setMenuOpenFor(menuOpenFor === shop._id ? null : shop._id)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpenFor === shop._id}
                        title="Thao tác"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuOpenFor === shop._id && (
                        <div className={styles.dropdownMenu} role="menu">
                          <button className={styles.menuItem} onClick={() => openViewShop(shop._id)}>
                            <Eye size={16} /> <span>Xem chi tiết</span>
                          </button>


                          {shop.status === "pending" && (
                            <button
                              className={styles.menuItem}
                              onClick={() => activateShop(shop._id)}
                            >
                              <CheckCircle size={16} /> <span>Xác nhận shop</span>
                            </button>
                          )}

                          {shop.status === "active" && (
                            <button
                              className={styles.menuItem}
                              onClick={() => toggleShopStatus(shop._id, shop.status)}
                            >
                              <Lock size={16} /> <span>Khóa shop</span>
                            </button>
                          )}

                          {(shop.status === "locked" || shop.status === "inactive") && (
                            <button
                              className={styles.menuItem}
                              onClick={() => toggleShopStatus(shop._id, shop.status)}
                            >
                              <Unlock size={16} /> <span>Mở khóa shop</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
                {filteredShops.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: 16 }}>
                      Không có cửa hàng phù hợp.
                    </td>
                  </tr>
                )}
                {viewer.open && createPortal(
                  <>
                    <div className={styles.modalBackdrop} onClick={closeViewer} />
                    <div className={styles.modalCard} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                      <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>Thông tin cửa hàng</div>
                        <button className={styles.closeBtn} onClick={closeViewer}>×</button>
                      </div>

                      {viewer.loading ? (
                        <div className={styles.modalBody}>Đang tải...</div>
                      ) : viewer.error ? (
                        <div className={styles.modalBody} style={{ color: "crimson" }}>{viewer.error}</div>
                      ) : viewer.data ? (
                        <div className={styles.modalBody}>
                          <div className={styles.shopTop}>
                            <img
                              src={fixUrl(viewer.data.avatar)}
                              alt={viewer.data.name}
                              className={styles.modalAvatar}
                            />
                            <div>
                              <div className={styles.modalName}>{viewer.data.name}</div>
                              <span className={`${styles.statusBadge} ${viewer.data.status === "active" ? styles["status-active"]
                                  : viewer.data.status === "locked" ? styles["status-locked"]
                                    : viewer.data.status === "pending" ? styles["status-pending"]
                                      : styles["status-inactive"]
                                }`}>
                                {viewer.data.status === "active" ? "Hoạt động"
                                  : viewer.data.status === "locked" ? "Bị khóa"
                                    : viewer.data.status === "pending" ? "Chờ duyệt"
                                      : "Tạm ngưng"}
                              </span>

                              <div className={styles.metaRow}>
                                Sản phẩm: <b>{viewer.data.total_products ?? "-"}</b>
                              </div>
                              <div className={styles.metaRow}>
                                Đánh giá: <b>{viewer.data.rating?.average ?? 0}</b> ({viewer.data.rating?.count ?? 0})
                              </div>
                            </div>
                          </div>

                          <div className={styles.grid2}>
                            <div>
                              <div className={styles.field}><b>Chủ shop:</b> {viewer.data.user_id?.name || "-"}</div>
                              <div className={styles.field}><b>Điện thoại:</b> {viewer.data.phone || "-"}</div>
                              <div className={styles.field}><b>Email:</b> {viewer.data.email || "-"}</div>
                            </div>
                            <div>
                              <div className={styles.field}><b>Địa chỉ:</b> {viewer.data.address || "-"}</div>
                              <div className={styles.field}><b>Mô tả:</b> {viewer.data.description || "—"}</div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className={styles.modalFooter}>
                        <button className={styles.primaryBtn} onClick={closeViewer}>Đóng</button>
                      </div>
                    </div>
                  </>,
                  document.body
                )}

              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
