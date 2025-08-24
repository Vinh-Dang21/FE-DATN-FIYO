"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Users, RefreshCw, Search, Eye, XCircle } from "lucide-react";
import styles from "./fllowers.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

type Follower = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  followedAt?: string; // ISO
};

const SHOP_NAME = "Fiyo Official (Mock)";
const LIMIT_OPTIONS = [5, 10, 20, 50];

// ============ Helpers ============
const fmtVN = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tạo danh sách mock follower tĩnh
function makeMockFollowers(count = 37): Follower[] {
  const names = [
    "Nguyễn Minh Anh","Trần Gia Huy","Lê Khánh Linh","Phạm Thanh Tùng","Bùi Thu Trang",
    "Đỗ Hoàng Long","Vũ Quỳnh Chi","Phan Ngọc Hân","Huỳnh Quốc Khang","Hoàng Hải Yến",
    "Lâm Nhật Huy","Đinh Mai Lan","Tạ Đức Mạnh","Trương Bảo Ngọc","Mai Anh Thư",
    "Vương Thiên Phúc","Ngô Thị Hương","Lê Đức Duy","Phạm Hoài Nam","Đỗ Minh Khoa",
    "Trần Nhật Anh","Vũ Tuấn Kiệt","Nguyễn Hồng Nhung","Hồ Phương Anh","Phan Nhật Minh",
    "Đặng Thùy Dương","Trịnh Trung Hiếu","Nguyễn Tấn Tài","Đoàn Khánh Vy","Nguyễn Hữu Tín",
    "Trần Bích Phượng","Phạm Quốc Hưng","Lê Thanh Hà","Đỗ Phương Linh","Vũ Khánh Hòa",
    "Nguyễn Minh Quân","Ngô Bảo Châu","Trần Hải Đăng","Phan Tường Vy","Đặng Kim Oanh"
  ];
  const list: Follower[] = Array.from({ length: count }).map((_, i) => {
    const idx = i % names.length;
    const name = names[idx];
    const id = String(1000 + i);
    // rải ngày theo dõi lùi dần
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    dt.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);

    return {
      _id: id,
      user: {
        _id: `u_${id}`,
        name,
        email: `user${id}@example.com`,
        avatar: `https://i.pravatar.cc/100?img=${(i % 70) + 1}`,
      },
      followedAt: dt.toISOString(),
    };
  });
  return list;
}

export default function FollowersPage() {
  // mock dữ liệu tĩnh
  const initialRef = useRef<Follower[]>(makeMockFollowers(38));
  const [all, setAll] = useState<Follower[]>(initialRef.current);

  // UI/query state
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // filter + paging
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((f) => {
      const n = f.user.name?.toLowerCase() || "";
      const e = f.user.email?.toLowerCase() || "";
      return n.includes(q) || e.includes(q);
    });
  }, [all, search]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * limit;
  const end = start + limit;
  const rows = filtered.slice(start, end);

  useEffect(() => {
    // Nếu đổi limit làm page vượt phạm vi thì kéo về trang cuối hợp lệ
    if (page > pageCount) setPage(pageCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, total]);

  const hardRefresh = () => {
    // reset về dữ liệu tĩnh ban đầu
    setAll(initialRef.current);
    setSearch("");
    setPage(1);
    setLimit(10);
    setSuccess("Đã làm mới danh sách (dữ liệu tĩnh).");
    setTimeout(() => setSuccess(""), 2000);
  };

  const removeFollower = (id: string) => {
    const f = all.find((x) => x._id === id);
    if (!f) return;
    if (!confirm(`Gỡ người theo dõi: ${f.user.name}?`)) return;
    setAll((prev) => prev.filter((x) => x._id !== id));
    setSuccess("Đã gỡ người theo dõi (mock).");
    setTimeout(() => setSuccess(""), 1800);
  };

  const viewFollower = (f: Follower) => {
    alert(
      `Xem người theo dõi\n\nTên: ${f.user.name}\nEmail: ${f.user.email || "-"}\nTheo dõi lúc: ${fmtVN(
        f.followedAt
      )}`
    );
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <div className={styles.toolbarPad}>
          <Topbar />
        </div>

        <div className={styles.hero}>
          <div className={styles.heroIcon}><Users size={22} /></div>
          <div>
            <h2 className={styles.heroTitle}>Người theo dõi</h2>
            <p className={styles.heroSub}>
              Quản lý danh sách người dùng theo dõi cửa hàng — <strong>{SHOP_NAME}</strong>
            </p>
          </div>
        </div>

        {!!error && <div className={styles.errorBanner}>{error}</div>}
        {!!success && (
          <div className={styles.successBanner}>
            <span className={styles.dot} /> {success}
          </div>
        )}

        {/* Controls */}
        <div className={styles.card}>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên hoặc email…"
              />
            </div>

            <div className={styles.rightControls}>
              <div className={styles.total}>
                Tổng: <strong>{total}</strong>
              </div>
              <div className={styles.selectWrap}>
                <label>Số dòng:</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value) || 10);
                    setPage(1);
                  }}
                >
                  {LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button className={styles.ghostBtn} onClick={hardRefresh} type="button" title="Làm mới">
                <RefreshCw size={16} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người theo dõi</th>
                  <th>Email</th>
                  <th>Ngày theo dõi</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.empty}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  rows.map((f, idx) => (
                    <tr key={f._id}>
                      <td>{start + idx + 1}</td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {f.user?.avatar ? (
                              <img src={f.user.avatar} alt={f.user.name} />
                            ) : (
                              <span className={styles.avatarFallback}>
                                {f.user?.name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div className={styles.userMeta}>
                            <div className={styles.name}>{f.user.name}</div>
                            <div className={styles.idText}>ID: {f.user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.email}>{f.user.email || "-"}</td>
                      <td>{fmtVN(f.followedAt)}</td>
                      <td className={styles.actions}>
                        <button
                          className={styles.iconBtn}
                          title="Xem"
                          onClick={() => viewFollower(f)}
                          type="button"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.danger}`}
                          title="Gỡ người theo dõi"
                          onClick={() => removeFollower(f._id)}
                          type="button"
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pager */}
          <div className={styles.pager}>
            <button
              className={`${styles.pageBtn} ${page <= 1 ? styles.btnDisabled : ""}`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              type="button"
            >
              Trang trước
            </button>
            <div className={styles.pageInfo}>
              Trang <strong>{safePage}</strong> / {pageCount}
            </div>
            <button
              className={`${styles.pageBtn} ${page >= pageCount ? styles.btnDisabled : ""}`}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              type="button"
            >
              Trang sau
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
