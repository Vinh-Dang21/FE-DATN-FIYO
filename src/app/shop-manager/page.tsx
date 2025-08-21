"use client";
import { Eye, Store, CheckCircle, Lock, Clock, User, Phone, Mail } from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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



const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/";
// 👉 Đặt đúng port backend (VD: 3001). Tạo file .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001

export default function ShopPage() {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked" | "pending">("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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

  // Fetch danh sách shop
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setErr("");
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_BASE}api/shop`, {
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
              <option value="locked">Bị khóa</option> {/* đổi từ inactive -> locked */}
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
                          src={shop.avatar || "http://localhost:3000/images/default-shop.jpg"}
                          alt={shop.name}
                          className={styles.shopImg}
                          loading="lazy"
                          onError={(e: any) => (e.currentTarget.src = "http://localhost:3000/images/default-shop.jpg")}
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

                    <td>{shop.phone || "-"}</td>
                    <td>{shop.email || "-"}</td>
                    <td>{shop.address || "-"}</td>
                    <td>
                      <Link href={`/shopdetail/${shop._id}`}>
                        <button className={styles.actionBtn} title="Xem">
                          <Eye size={20} />
                        </button>
                      </Link>
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
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
