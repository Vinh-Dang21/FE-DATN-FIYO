"use client";

import styles from "./dashboard.module.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface MonthlyRevenueItem { name: string; revenue: number; }
type Product = {
  _id: string;
  name: string;
  category_id?: { categoryId?: { _id: string; name?: string }, categoryName?: string };
  category?: { _id: string; name?: string } | string;
};
type Voucher = {
  _id: string;
  voucher_code: string;
  is_active?: boolean;
  quantity?: number;
  used_count?: number;
  expired_at?: string;
};
interface Shop {
  _id: string;
  name: string;
  status: "active" | "pending" | "locked" | "inactive";
  // ... có thể thêm field khác nếu cần
}
type Category = {
  _id: string;
  name: string;
  slug?: string;
  parentId: string | null;
  images?: string[];
};


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://fiyo-be.onrender.com/api/";

export default function Dashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({ pending: 0, active: 0, blocked: 0 });

  // === 1) Đơn đã giao (THÁNG) – ĐẾM SỐ LƯỢNG ===
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}shop`, { cache: "no-store" });
        const data = await res.json();
        const list: Shop[] = Array.isArray(data) ? data : data.result || [];

        let pending = 0, active = 0, blocked = 0;
        list.forEach((s) => {
          if (s.status === "pending") pending++;
          if (s.status === "active") active++;
          if (s.status === "locked" || s.status === "inactive") blocked++;
        });

        setCounts({ pending, active, blocked });
      } catch (e) {
        console.error("Lỗi fetch shop:", e);
      }
    })();
  }, []);

  // === 2) Doanh thu theo người mua (THÁNG) ===
  const [userMonthRevenue, setUserMonthRevenue] = useState(0);      // hội viên
  const [userLastMonthRevenue, setUserLastMonthRevenue] = useState(0);
  const [guestMonthRevenue, setGuestMonthRevenue] = useState(0);    // vãng lai
  const [guestLastMonthRevenue, setGuestLastMonthRevenue] = useState(0);

  // === 3) Chart & danh mục / voucher ===
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categoryPieData, setCategoryPieData] = useState<{ name: string; value: number }[]>([]);

  // User (admin)
  const [user, setUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  // ---- Guard ----
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/warning-login"); return; }
    try {
      const u = JSON.parse(userStr);
      if (u.role !== 0) { router.push("/warning-login"); return; }
      setUser({ id: u._id, name: u.name, avatar: u.avatar });
    } catch { router.push("/warning-login"); }
  }, [router]);

  // ---- Helpers thời gian ----
  const getStartAndEndOfCurrentMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start.toISOString(), toDate: end.toISOString() };
  };
  const getStartAndEndOfLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start.toISOString(), toDate: end.toISOString() };
  };

  // ---- Fetch helpers ----
  const fetchOrdersInRange = async (fromDate: string, toDate: string) => {
    const res = await fetch(`${API_BASE}orders?fromDate=${fromDate}&toDate=${toDate}`);
    const data = await res.json();
    return Array.isArray(data?.result) ? data.result : [];
  };

  // ---- Tính: Đơn đã giao + Doanh thu hội viên & vãng lai (THÁNG) ----
  const calcMonthlyKPIs = async () => {
    const cur = getStartAndEndOfCurrentMonth();
    const prev = getStartAndEndOfLastMonth();

    try {
      const [curOrders, prevOrders] = await Promise.all([
        fetchOrdersInRange(cur.fromDate, cur.toDate),
        fetchOrdersInRange(prev.fromDate, prev.toDate),
      ]);

      const deliveredCur = curOrders.filter((o: any) => o.status_order === "delivered");
      const deliveredPrev = prevOrders.filter((o: any) => o.status_order === "delivered");

      // 1) Đơn đã giao – ĐẾM

      // 2) Doanh thu hội viên & vãng lai
      const memberCur = deliveredCur.reduce(
        (s: number, o: any) => (o.user_id ? s + (o.total_price || 0) : s), 0);
      const memberPrev = deliveredPrev.reduce(
        (s: number, o: any) => (o.user_id ? s + (o.total_price || 0) : s), 0);

      const guestCur = deliveredCur.reduce(
        (s: number, o: any) => (!o.user_id && o.address_guess ? s + (o.total_price || 0) : s), 0);
      const guestPrev = deliveredPrev.reduce(
        (s: number, o: any) => (!o.user_id && o.address_guess ? s + (o.total_price || 0) : s), 0);

      setUserMonthRevenue(memberCur);
      setUserLastMonthRevenue(memberPrev);
      setGuestMonthRevenue(guestCur);
      setGuestLastMonthRevenue(guestPrev);
    } catch (e) {
      console.error("Lỗi tính KPI tháng:", e);
    }
  };

  // ---- Biểu đồ doanh thu theo 12 tháng ----
  const fetchMonthlyRevenue = async () => {
    try {
      const res = await fetch(`${API_BASE}orderShop`);
      const data = await res.json();
      const orders = data.result || [];
      const monthlyTotals: Record<number, number> = {};
      orders.forEach((o: any) => {
        if (o.status_order !== "delivered") return;
        const m = new Date(o.createdAt).getMonth();
        monthlyTotals[m] = (monthlyTotals[m] || 0) + (o.total_price || 0);
      });
      const result = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        revenue: monthlyTotals[i] || 0,
      }));
      setMonthlyRevenue(result);
    } catch (e) { console.error("Lỗi tổng hợp doanh thu theo tháng:", e); }
  };

  // ---- Category / Product / Voucher ----
  const [parentCategories, setParentCategories] = useState(0);
  const [childCategories, setChildCategories] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}category`, { cache: "no-store" });
        const data = await res.json();

        // nếu BE trả {result: []} thì lấy ra, còn không thì lấy thẳng mảng
        const list: any[] = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];

        const parents = list.filter(c => !c.parentId || c.parentId === null);
        const children = list.filter(c => c.parentId);

        setParentCategories(parents.length);
        setChildCategories(children.length);
      } catch (e) {
        console.error("Lỗi lấy category:", e);
        setParentCategories(0);
        setChildCategories(0);
      }
    };
    fetchCategories();
  }, []);


  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}products`);
      const data = await res.json();
      const list: Product[] = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
      setProducts(list);
    } catch (e) { console.error("Lỗi lấy products:", e); setProducts([]); }
  };
  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_BASE}voucher`);
      const data = await res.json();
      const list: Voucher[] = Array.isArray(data?.vouchers) ? data.vouchers : Array.isArray(data) ? data : [];
      setVouchers(list);
    } catch (e) { console.error("Lỗi lấy voucher:", e); setVouchers([]); }
  };

  // Gom dữ liệu Pie từ products
  useEffect(() => {
    if (!products.length) { setCategoryPieData([]); return; }
    const counter = new Map<string, number>();
    products.forEach((p) => {
      const nameFromPopulate = p.category_id?.categoryId?.name;
      const nameFromEmbed = p.category_id?.categoryName;
      const nameFromFlat = typeof p.category === "string" ? p.category : p.category?.name;
      const catName = nameFromPopulate || nameFromEmbed || nameFromFlat || "Khác";
      counter.set(catName, (counter.get(catName) || 0) + 1);
    });
    const arr = Array.from(counter.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    setCategoryPieData(arr);
  }, [products]);

  const totalCategories = categories.length;
  const activeVouchers = useMemo(() => vouchers.filter(v => v.is_active).length, [vouchers]);

  const pct = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? "—" : "100% ↑";
    const p = Math.round(((cur - prev) / prev) * 100);
    return `${p}% ${cur >= prev ? "↑" : "↓"}`;
  };

  // Pie palette
  const PIE_COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7", "#84CC16", "#F97316", "#14B8A6", "#EC4899"];
  const colorFor = (name: string) => {
    let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PIE_COLORS[h % PIE_COLORS.length];
  };

  // Voucher hiệu lực theo expired_at
  const formatVoucherRange = (expired_at?: string) => {
    if (!expired_at) return "Không giới hạn";
    return `Đến ${new Date(expired_at).toLocaleDateString("vi-VN")}`;
  };

  // First load
  useEffect(() => {
    calcMonthlyKPIs();
    fetchMonthlyRevenue();
    fetchProducts();
    fetchVouchers();
  }, []);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.greetingBox}>
          Xin chào {user?.name || "admin"} -{" "}
          <span style={{ fontWeight: 400, fontSize: 16 }}>Tình hình các shop trên sàn hôm nay</span>
        </div>

        {/* SUMMARY */}
        <div className={styles.summaryGrid}>
          {/* 1) ĐƠN HÀNG ĐÃ GIAO (THÁNG) – ĐẾM */}
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>THỐNG KÊ CỬA HÀNG</h4>
            <div className={styles.cardContents}>
              <div className={styles.pending}>
                <h2 className={styles.shoptitle}>Chờ duyệt</h2>
                <span className={styles.shopvalue}>{counts.pending}</span>
              </div>
              <div className={styles.active}>
                <h2 className={styles.shoptitle}>Hoạt động</h2>
                <span className={styles.shopvalue}>{counts.active}</span>
              </div>
              <div className={styles.blocked}>
                <h2 className={styles.shoptitle}>Bị khóa</h2>
                <span className={styles.shopvalue}>{counts.blocked}</span>
              </div>
            </div>

          </div>

          {/* 2) Doanh thu HỘI VIÊN (THÁNG) */}
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU HỘI VIÊN (THÁNG)</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{userMonthRevenue.toLocaleString("vi-VN")} đ</span>
              <span className={userMonthRevenue >= userLastMonthRevenue ? styles.cardStatusUp : styles.cardStatusDown}>
                Tháng trước: {pct(userMonthRevenue, userLastMonthRevenue)}
              </span>
            </div>
          </div>

          {/* 3) Doanh thu VÃNG LAI (THÁNG) */}
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU VÃNG LAI (THÁNG)</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{guestMonthRevenue.toLocaleString("vi-VN")} đ</span>
              <span className={guestMonthRevenue >= guestLastMonthRevenue ? styles.cardStatusUp : styles.cardStatusDown}>
                Tháng trước: {pct(guestMonthRevenue, guestLastMonthRevenue)}
              </span>
            </div>
          </div>

          {/* 4) Tổng danh mục */}
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG DANH MỤC</h4>
            <div className={styles.cardContents}>
              <div className={styles.cardBox}>
                <h3 className={styles.cateTitle}>Danh mục cha</h3>
                <span className={styles.cateValue}>
                  {parentCategories}
                </span>
              </div>
              <div className={styles.cardBox}>
                <h3 className={styles.cateTitle}>Danh mục con</h3>
                <span className={styles.cateValue}>
                  {childCategories}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* CHARTS */}
        <div className={styles.splitSection}>
          <div className={styles.placeholderLeft}>
            <div style={{ width: "100%", height: 350 }}>
              <h2 className={styles.sectionTitle}>THỐNG KÊ DOANH THU</h2>
              <p className={styles.sectionSubTitle}>Biểu đồ thống kê doanh thu theo từng tháng</p>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={monthlyRevenue} margin={{ left: 10 }} barCategoryGap={10}>
                  <XAxis dataKey="name" />
                  <YAxis
                    allowDecimals={false}
                    tickFormatter={(v) =>
                      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` :
                        v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : v
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => `${Number(value).toLocaleString("vi-VN")} đ`}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", color: "#444" }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Bar dataKey="revenue" fill="#7367F0" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.placeholderRight} style={{ width: "100%", height: 400 }}>
            <h2 className={styles.sectionTitle}>PHÂN BỐ SẢN PHẨM THEO DANH MỤC</h2>
            <p className={styles.sectionSubTitle}>Tỷ lệ sản phẩm trên các danh mục</p>

            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={105} innerRadius={42}
                  labelLine={false} label={false}
                >
                  {categoryPieData.map((d, i) => (
                    <Cell key={`${d.name}-${i}`} fill={colorFor(d.name)} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom" iconType="circle"
                  wrapperStyle={{ paddingTop: 4, lineHeight: "16px" }}
                  formatter={(value) => <span style={{ color: "#4b5563", fontSize: 13 }}>{value}</span>}
                />
                <Tooltip
                  formatter={(v: number, _k: string, item: any) => [
                    `${Number(v ?? 0).toLocaleString("vi-VN")} SP`,
                    item?.payload?.name || "Danh mục",
                  ]}
                  labelFormatter={() => ""}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VOUCHER + TOP DANH MỤC */}
        <div className={styles.splitSection}>
          <div className={styles.placeholderLeft}>
            <h2 className={styles.sectionTitle}>VOUCHER HIỆN CÓ</h2>
            <p className={styles.sectionSubTitle}>Danh sách voucher đang dùng cho sàn</p>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Trạng thái</th>
                  <th>Còn lại</th>
                  <th>Hiệu lực</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.slice(0, 10).map((v) => {
                  const left = (v.quantity ?? 0) - (v.used_count ?? 0);
                  const isExpired = v.expired_at ? new Date(v.expired_at) < new Date() : false;
                  return (
                    <tr key={v._id}>
                      <td>{v.voucher_code}</td>
                      <td>
                        <span
                          className={v.is_active && !isExpired ? styles.cardStatusUp : styles.cardStatusDown}
                          style={{ fontWeight: 600 }}
                        >
                          {isExpired ? "Hết hạn" : v.is_active ? "Bật" : "Tắt"}
                        </span>
                      </td>
                      <td>{isFinite(left) ? left : (v.quantity ?? "—")}</td>
                      <td>{formatVoucherRange(v.expired_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.placeholderRight}>
            <h2 className={styles.sectionTitle}>TOP DANH MỤC</h2>
            <p className={styles.sectionSubTitle}>Nhiều sản phẩm nhất</p>
            <div className={styles.userList}>
              {categoryPieData
                .slice()
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((c, idx) => (
                  <div className={styles.userRow} key={c.name}>
                    <div className={styles.userInfo}>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 999, display: "flex",
                          alignItems: "center", justifyContent: "center", marginRight: 10,
                          background: idx === 0 ? "#FEF3C7" : idx === 1 ? "#E0E7FF" : "#F1F5F9",
                          color: "#111827", fontWeight: 600, fontSize: 13
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className={styles.name}>{c.name}</div>
                        <div className={styles.email}>Danh mục</div>
                      </div>
                    </div>
                    <div className={styles.money}>{c.value.toLocaleString("vi-VN")} SP</div>
                  </div>
                ))}
            </div>
            <div className={styles.viewAll}>
              <a href="/categories">QUẢN LÝ DANH MỤC →</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
