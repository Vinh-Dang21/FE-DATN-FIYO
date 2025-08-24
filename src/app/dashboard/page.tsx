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

interface MonthlyRevenueItem {
  name: string;
  revenue: number;
}

type Category = { _id: string; name: string };
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
  start_date?: string;
  end_date?: string;
};

export default function Dashboard() {
  const router = useRouter();

  // Doanh thu / Đơn hàng
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [currentMonthOrders, setCurrentMonthOrders] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [lastMonthOrders, setLastMonthOrders] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>([]);

  // Danh mục / Sản phẩm / Voucher
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  // Pie danh mục
  const [categoryPieData, setCategoryPieData] = useState<{ name: string; value: number }[]>([]);

  // User (admin)
  const [user, setUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  // ==== Guard + lấy user ====
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }
    try {
      const u = JSON.parse(userStr);
      if (u.role !== 0) {
        router.push("/warning-login");
        return;
      }
      setUser({ id: u._id, name: u.name, avatar: u.avatar });
    } catch {
      router.push("/warning-login");
    }
  }, [router]);

  // ==== Helpers thời gian ====
  const getStartAndEndOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start.toISOString(), toDate: end.toISOString() };
  };

  const getStartAndEndOfLastWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday - 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { fromDate: start.toISOString(), toDate: end.toISOString() };
  };

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

  // ==== Orders (admin sàn) ====
  const fetchWeeklyRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfCurrentWeek();
    try {
      const res = await fetch(`https://fiyo.click/api/orders?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      const total = (data.result || []).reduce((sum: number, order: any) => {
        const d = new Date(order.createdAt);
        const inRange = d >= new Date(fromDate) && d <= new Date(toDate);
        const delivered = order.status_order === "delivered";
        return inRange && delivered ? sum + (order.total_price || 0) : sum;
      }, 0);
      setWeeklyRevenue(total);
    } catch (e) {
      console.error("Lỗi doanh thu tuần:", e);
    }
  };

  const fetchLastWeekRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfLastWeek();
    try {
      const res = await fetch(`https://fiyo.click/api/orders?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      const total = (data.result || []).reduce((sum: number, order: any) => {
        const d = new Date(order.createdAt);
        const inRange = d >= new Date(fromDate) && d <= new Date(toDate);
        const delivered = order.status_order === "delivered";
        return inRange && delivered ? sum + (order.total_price || 0) : sum;
      }, 0);
      setLastWeekRevenue(total);
    } catch (e) {
      console.error("Lỗi doanh thu tuần trước:", e);
    }
  };

  const fetchCurrentMonthRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfCurrentMonth();
    try {
      const res = await fetch(`https://fiyo.click/api/orders?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      let total = 0;
      let count = 0;
      (data.result || []).forEach((order: any) => {
        const d = new Date(order.createdAt);
        const inRange = d >= new Date(fromDate) && d <= new Date(toDate);
        if (inRange && order.status_order === "delivered") {
          total += order.total_price || 0;
          count += 1;
        }
      });
      setCurrentMonthRevenue(total);
      setCurrentMonthOrders(count);
    } catch (e) {
      console.error("Lỗi doanh thu tháng:", e);
    }
  };

  const fetchLastMonthRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfLastMonth();
    try {
      const res = await fetch(`https://fiyo.click/api/orders?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      let total = 0;
      let count = 0;
      (data.result || []).forEach((order: any) => {
        const d = new Date(order.createdAt);
        const inRange = d >= new Date(fromDate) && d <= new Date(toDate);
        if (inRange && order.status_order === "delivered") {
          total += order.total_price || 0;
          count += 1;
        }
      });
      setLastMonthRevenue(total);
      setLastMonthOrders(count);
    } catch (e) {
      console.error("Lỗi doanh thu tháng trước:", e);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const res = await fetch("https://fiyo.click/api/orders");
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
    } catch (e) {
      console.error("Lỗi tổng hợp doanh thu theo tháng:", e);
    }
  };

  // ==== Category / Product / Voucher ====
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://fiyo.click/api/category");
      const data = await res.json();
      const list: Category[] =
        Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
      setCategories(list);
    } catch (e) {
      console.error("Lỗi lấy category:", e);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://fiyo.click/api/products");
      const data = await res.json();
      const list: Product[] =
        Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
      setProducts(list);
    } catch (e) {
      console.error("Lỗi lấy products:", e);
      setProducts([]);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await fetch("https://fiyo.click/api/voucher");
      const data = await res.json();
      const list: Voucher[] =
        Array.isArray(data?.vouchers) ? data.vouchers : Array.isArray(data) ? data : [];
      setVouchers(list);
    } catch (e) {
      console.error("Lỗi lấy voucher:", e);
      setVouchers([]);
    }
  };

  // Gom dữ liệu Pie theo danh mục từ products
  const buildCategoryPie = () => {
    if (!products.length) {
      setCategoryPieData([]);
      return;
    }
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
  };

  // Tổng danh mục & voucher đang bật
  const totalCategories = categories.length;
  const activeVouchers = useMemo(
    () => vouchers.filter(v => v.is_active).length,
    [vouchers]
  );

  // Safe % helper
  const pct = (current: number, previous: number) => {
    if (previous === 0) return "—";
    const v = Math.round(((current - previous) / previous) * 100);
    return `${v}% ${current >= previous ? "↑" : "↓"}`;
  };

  // ==== FIRST LOAD ====
  useEffect(() => {
    fetchWeeklyRevenue();
    fetchLastWeekRevenue();
    fetchCurrentMonthRevenue();
    fetchLastMonthRevenue();
    fetchMonthlyRevenue();
    fetchCategories();
    fetchProducts();
    fetchVouchers();
  }, []);

  useEffect(() => {
    buildCategoryPie();
  }, [products]);

  // ==== Palette & color mapping cho Pie ====
  const PIE_COLORS = [
    "#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4",
    "#A855F7", "#84CC16", "#F97316", "#14B8A6", "#EC4899",
  ];
  const colorFor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PIE_COLORS[h % PIE_COLORS.length];
  };

  // ==== Format hiệu lực voucher (FE) ====
  const formatVoucherRange = (start?: string, end?: string) => {
    const parse = (v?: string) => (v ? new Date(v) : null);
    const s = parse(start);
    const e = parse(end);
    const toVN = (d: Date) => d.toLocaleDateString("vi-VN");
    if (s && e) return `${toVN(s)} – ${toVN(e)}`;
    if (s) return `Từ ${toVN(s)}`;
    if (e) return `Đến ${toVN(e)}`;
    return "Không giới hạn";
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.greetingBox}>
          Xin chào {user?.name || "admin"} -{" "}
          <span style={{ fontWeight: 400, fontSize: 16 }}>
            Tình hình các shop trên sàn hôm nay
          </span>
        </div>

        {/* SUMMARY */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU TUẦN NÀY</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {weeklyRevenue.toLocaleString("vi-VN")} đ
              </span>
              <span className={
                weeklyRevenue > lastWeekRevenue ? styles.cardStatusUp :
                  weeklyRevenue < lastWeekRevenue ? styles.cardStatusDown :
                    styles.cardStatusDown}
              >
                {lastWeekRevenue === 0
                  ? "—"
                  : `${Math.abs(((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1)}% ${weeklyRevenue >= lastWeekRevenue ? "↑" : "↓"}`}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU THÁNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {currentMonthRevenue.toLocaleString("vi-VN")} đ
              </span>
              <span className={currentMonthRevenue >= lastMonthRevenue ? styles.cardStatusUp : styles.cardStatusDown}>
                Tháng trước: {pct(currentMonthRevenue, lastMonthRevenue)}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG DANH MỤC</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {totalCategories.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>VOUCHER ĐANG BẬT</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {activeVouchers.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className={styles.splitSection}>
          {/* Bar revenue */}
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

          {/* Pie theo danh mục – bỏ box lồng, tắt label trên lát */}
          <div className={styles.placeholderRight} style={{ width: "100%", height: 350 }}>
            <h2 className={styles.sectionTitle}>PHÂN BỐ SẢN PHẨM THEO DANH MỤC</h2>
            <p className={styles.sectionSubTitle}>Tỷ lệ sản phẩm trên các danh mục</p>

            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={42}
                  labelLine={false}
                  label={false}
                >
                  {categoryPieData.map((d, i) => (
                    <Cell key={`${d.name}-${i}`} fill={colorFor(d.name)} />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
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
          {/* BẢNG VOUCHER */}
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
                  const isExpired = v.end_date ? new Date(v.end_date) < new Date() : false;
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
                      <td>{formatVoucherRange(v.start_date as any, v.end_date as any)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TOP DANH MỤC */}
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
