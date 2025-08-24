"use client";
import styles from "./dashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";

type TopFollowerRow = {
  userId: string;
  name: string;
  email: string;
  avatar: string;
};

// ---- Entities từ BE ----
interface UserMini {
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

interface AddressMini {
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
}

interface StatusHist {
  status: string;
  updatedAt: string;
  note?: string;
  _id: string;
}

interface ParentOrder {
  _id: string;
  total_price: number;
  status_order: string;
  payment_method?: string;
  transaction_method?: string;
  address_id?: string | AddressMini;
  user_id?: string | UserMini | null;
  address_guess?: {
    name?: string; phone?: string; email?: string;
    address?: string; type?: string; detail?: string;
  } | null;
  status_history?: StatusHist[];
  createdAt?: string;
  updatedAt?: string;
}

interface OrderShop {
  _id: string;
  createdAt: string;
  updatedAt?: string;
  total_price: number;
  status_order: string;
  status_history?: StatusHist[];
  order_id?: ParentOrder | null;
  shop_id?: any;
}

// ---- Hàng hiển thị trong bảng (đÃ CHUẨN HÓA) ----
type PendingRow = {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;            // key trạng thái để map class
  payment_method: string;
};

interface SizeMini { _id: string; size?: string; quantity?: number; sku?: string }
interface VariantMini { _id: string; color?: string; sizes?: SizeMini[] }
interface ProductMini { _id: string; name: string; images?: string[]; variants?: VariantMini[]; isHidden?: boolean }

type LowStockItem = { id: string; name: string; sku: string; qty: number; image: string };

interface MonthlyRevenueItem {
  name: string;
  revenue: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/";

export default function Dashboard() {
  const router = useRouter();
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [currentMonthOrders, setCurrentMonthOrders] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [lastMonthOrders, setLastMonthOrders] = useState(0);
  const [shopId, setShopId] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingRow[]>([]);
  const [topUsers, setTopUsers] = useState<TopFollowerRow[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>([]);
  const [customerPieData, setCustomerPieData] = useState<{ name: string; value: number }[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  const extractOrderShops = (json: any): OrderShop[] => {
    if (Array.isArray(json?.result?.items)) return json.result.items;
    if (Array.isArray(json?.order_shops)) return json.order_shops;
    if (Array.isArray(json?.result)) return json.result;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  };

  const extractProducts = (json: any): ProductMini[] => {
    if (Array.isArray(json?.products)) return json.products;
    if (Array.isArray(json?.result?.products)) return json.result.products;
    if (Array.isArray(json?.result?.items)) return json.result.items;
    if (Array.isArray(json?.data)) return json.data;
    return [];
  };

  const totalQty = (p: ProductMini): number => {
    const variants: VariantMini[] = p.variants ?? [];
    let sum = 0;
    for (const v of variants) {
      const sizes: SizeMini[] = v.sizes ?? [];
      for (const s of sizes) sum += s.quantity ?? 0;
    }
    return sum;
  };

  const pickMinQtySku = (p: ProductMini): string => {
    const variants: VariantMini[] = p.variants ?? [];
    let chosen: SizeMini | null = null;

    for (const v of variants) {
      const sizes: SizeMini[] = v.sizes ?? [];
      for (const sz of sizes) {
        if (!chosen || (sz.quantity ?? 0) < (chosen.quantity ?? 0)) chosen = sz;
      }
    }
    return chosen?.sku ?? "";
  };

  const firstImage = (p: ProductMini): string => p.images?.[0] ?? "/placeholder.png";

  // Guard login/role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 2) {
        router.push("/warning-login");
        return;
      }
    } catch (err) {
      router.push("/warning-login");
    }
  }, [router]);

  // Lấy shopId từ user
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    (async () => {
      try {
        const user = JSON.parse(userStr);
        const userId = user?._id;
        if (!userId) return;

        const res = await fetch(`${API_BASE}shop/user/${userId}`, { cache: "no-store" });
        const data = await res.json();

        const id = data?.shop?._id ?? data?.shopId ?? data?._id;
        if (id) {
          setShopId(String(id));
        } else {
          console.warn("Không tìm được shopId trong payload:", data);
        }
      } catch (err) {
        console.error("Lỗi lấy shopId:", err);
      }
    })();
  }, []);

  // === Helpers thời gian theo tuần/tháng ===
  const getStartAndEndOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 (CN) đến 6 (T7)
    const diffToMonday = day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      fromDate: startOfWeek.toISOString(),
      toDate: endOfWeek.toISOString(),
    };
  };

  const getStartAndEndOfLastWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;

    const startOfLastWeek = new Date(today);
    startOfLastWeek.setDate(today.getDate() - diffToMonday - 7);
    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);

    return {
      fromDate: startOfLastWeek.toISOString(),
      toDate: endOfLastWeek.toISOString(),
    };
  };

  const getStartAndEndOfCurrentMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return {
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
    };
  };

  const getStartAndEndOfLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23, 59, 59, 999);

    return {
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
    };
  };

  const fetchShopOrders = async (
    shopId: string,
    range?: { fromDate?: string; toDate?: string }
  ): Promise<OrderShop[]> => {
    const params = new URLSearchParams();
    if (range?.fromDate) params.set("fromDate", range.fromDate);
    if (range?.toDate) params.set("toDate", range.toDate);

    const url = `${API_BASE}orderShop/shop/${shopId}${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return extractOrderShops(json);
  };

  // tính tổng delivered trong khoảng
  const sumDeliveredInRange = (orders: OrderShop[], fromISO?: string, toISO?: string) => {
    const from = fromISO ? new Date(fromISO) : null;
    const to = toISO ? new Date(toISO) : null;
    return orders.reduce((sum, o) => {
      const d = new Date(o.createdAt);
      const inRange = (!from || d >= from) && (!to || d <= to);
      const delivered = o.status_order === "delivered";
      return inRange && delivered ? sum + (o.total_price || 0) : sum;
    }, 0);
  };

  const fetchWeeklyRevenue = async () => {
    if (!shopId) return;
    try {
      const { fromDate, toDate } = getStartAndEndOfCurrentWeek();
      const orders = await fetchShopOrders(shopId, { fromDate, toDate });
      const total = sumDeliveredInRange(orders, fromDate, toDate);
      setWeeklyRevenue(total);
    } catch (err) {
      console.error("🔥 Lỗi khi tính doanh thu tuần:", err);
      setWeeklyRevenue(0);
    }
  };

  const fetchLastWeekRevenue = async () => {
    if (!shopId) return;
    try {
      const { fromDate, toDate } = getStartAndEndOfLastWeek();
      const orders = await fetchShopOrders(shopId, { fromDate, toDate });
      const total = sumDeliveredInRange(orders, fromDate, toDate);
      setLastWeekRevenue(total);
    } catch (err) {
      console.error("Lỗi khi lấy doanh thu tuần trước:", err);
      setLastWeekRevenue(0);
    }
  };

  const fetchCurrentMonthRevenue = async () => {
    if (!shopId) return;
    try {
      const { fromDate, toDate } = getStartAndEndOfCurrentMonth();
      const orders = await fetchShopOrders(shopId, { fromDate, toDate });

      let total = 0;
      let count = 0;
      const from = new Date(fromDate), to = new Date(toDate);

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        if (o.status_order === "delivered" && d >= from && d <= to) {
          total += o.total_price || 0;
          count += 1;
        }
      });

      setCurrentMonthRevenue(total);
      setCurrentMonthOrders(count);
    } catch (err) {
      console.error("Lỗi khi lấy doanh thu tháng này:", err);
      setCurrentMonthRevenue(0);
      setCurrentMonthOrders(0);
    }
  };

  const fetchLastMonthRevenue = async () => {
    if (!shopId) return;
    try {
      const { fromDate, toDate } = getStartAndEndOfLastMonth();
      const orders = await fetchShopOrders(shopId, { fromDate, toDate });

      let total = 0;
      let count = 0;
      const from = new Date(fromDate), to = new Date(toDate);

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        if (o.status_order === "delivered" && d >= from && d <= to) {
          total += o.total_price || 0;
          count += 1;
        }
      });

      setLastMonthRevenue(total);
      setLastMonthOrders(count);
    } catch (err) {
      console.error("Lỗi khi lấy doanh thu tháng trước:", err);
      setLastMonthRevenue(0);
      setLastMonthOrders(0);
    }
  };

  const fetchPendingOrders = async (): Promise<PendingRow[]> => {
    if (!shopId) return [];
    const orders = await fetchShopOrders(shopId);

    const candidates = orders
      .filter(o => (o.status_order === "pending" || o.status_order === "confirmed"))
      .slice(0, 10);

    const userIds: string[] = [];
    const addrIds: string[] = [];
    for (const o of candidates) {
      const p = o.order_id;
      if (!p) continue;
      if (typeof p.user_id === "string") userIds.push(p.user_id);
      if (typeof p.address_id === "string") addrIds.push(p.address_id);
    }

    const [userMap, addressMap] = await Promise.all([
      fetchUsersByIds(userIds),
      fetchAddressesByIds(addrIds),
    ]);

    const rows = candidates.map(o => toPendingRow(o, userMap, addressMap));
    return rows;
  };

  useEffect(() => {
    if (!shopId) return;
    (async () => {
      const rows = await fetchPendingOrders();
      setPendingOrders(rows);
    })();
  }, [shopId]);

  const fetchMonthlyRevenue = async () => {
    if (!shopId) return;
    try {
      const orders = await fetchShopOrders(shopId);

      const monthlyTotals: Record<number, number> = {};
      orders.forEach(o => {
        if (o.status_order !== "delivered") return;
        const d = new Date(o.createdAt);
        const m = d.getMonth(); // 0..11
        monthlyTotals[m] = (monthlyTotals[m] || 0) + (o.total_price || 0);
      });

      const result = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        revenue: monthlyTotals[i] || 0,
      }));

      setMonthlyRevenue(result);
    } catch (err) {
      console.error("Lỗi khi fetch doanh thu theo tháng:", err);
      setMonthlyRevenue(Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        revenue: 0,
      })));
    }
  };

  const fetchCustomerTypeStats = async () => {
    if (!shopId) return [];
    try {
      const orders = await fetchShopOrders(shopId);

      let guestCount = 0;
      let memberCount = 0;

      orders.forEach(o => {
        const isMember = !!o.order_id?.user_id;
        const isGuest = !!o.order_id?.address_guess;

        if (isMember) memberCount += 1;
        else if (isGuest) guestCount += 1;
      });

      return [
        { name: "Hội viên", value: memberCount },
        { name: "Khách vãng lai", value: guestCount },
      ];
    } catch (err) {
      console.error("❌ Lỗi khi thống kê hội viên vs khách:", err);
      return [];
    }
  };

  const authHeaders = (): Headers => {
    const h = new Headers();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
    return h;
  };

  const fetchUsersByIds = async (ids: string[]) => {
    const uniq = Array.from(new Set(ids.filter(Boolean)));
    const entries = await Promise.all(
      uniq.map(async (id) => {
        try {
          const res = await fetch(`${API_BASE}user/${id}`, {
            cache: "no-store",
            headers: authHeaders(),
          });

          if (!res.ok) {
            console.warn("⚠️ /user/:id fail", id, res.status);
            return [id, null] as const;
          }
          const json = await res.json();

          const u =
            json?.user ??
            json?.findUser ??
            json?.result?.user ??
            json?.result ??
            json?.data ??
            (Array.isArray(json?.users) ? json.users[0] : undefined) ??
            (typeof json === "object" ? json : undefined);

          if (!u) {
            console.warn("⚠️ /user/:id payload lạ", id, json);
            return [id, null] as const;
          }

          return [
            id,
            {
              name: u.name || "Người dùng",
              email: u.email || "",
              phone: u.phone || "",
              avatar: u.avatar || "",
            },
          ] as const;
        } catch (e) {
          console.warn("⚠️ /user/:id error", id, e);
          return [id, null] as const;
        }
      })
    );
    return new Map<string, { name: string; email: string; phone: string; avatar: string } | null>(entries);
  };

  const fetchAddressesByIds = async (ids: string[]) => {
    const uniq = Array.from(new Set(ids.filter(Boolean)));

    const entries = await Promise.all(
      uniq.map(async (id) => {
        try {
          const res = await fetch(`${API_BASE}address/${id}`, {
            cache: "no-store",
            headers: authHeaders(),
          });

          if (!res.ok) {
            console.warn("⚠️ /address/:id fail", id, res.status);
            return [id, null] as const;
          }

          const json = await res.json();

          const a =
            json?.address ??
            json?.findAddress ??
            json?.result ??
            json?.data ??
            (typeof json === "object" ? json : undefined);

          if (!a) {
            console.warn("⚠️ /address/:id payload lạ", id, json);
            return [id, null] as const;
          }

          const address =
            a.address ||
            [a.detail, a.ward, a.district, a.province].filter(Boolean).join(", ");

          return [id, {
            address,
            name: a.name || "",
            phone: a.phone || ""
          }] as const;
        } catch (e) {
          console.warn("⚠️ /address/:id error", id, e);
          return [id, null] as const;
        }
      })
    );

    return new Map<
      string,
      { address: string; name: string; phone: string } | null
    >(entries);
  };

  const toPendingRow = (
    o: OrderShop,
    userMap: Map<string, { name: string; email: string; phone: string; avatar: string } | null>,
    addressMap: Map<string, { address: string; name: string; phone: string } | null>
  ): PendingRow => {
    const parent = o.order_id as ParentOrder | undefined;

    // member
    let member: UserMini | null = null;
    if (typeof parent?.user_id === "string") {
      const u = userMap.get(parent.user_id);
      if (u) member = { name: u.name, email: u.email, phone: u.phone };
      else console.warn("⚠️ Không lấy được user", parent.user_id);
    } else if (parent?.user_id && typeof parent.user_id === "object") {
      member = parent.user_id;
    }

    // address
    let addrText = "—", addrName = "", addrPhone = "";
    if (parent?.address_guess?.address) {
      addrText = parent.address_guess.address;
      addrName = parent.address_guess.name || "";
      addrPhone = parent.address_guess.phone || "";
    } else if (typeof parent?.address_id === "string") {
      const a = addressMap.get(parent.address_id);
      addrText = a?.address || "—";
      addrName = a?.name || "";
      addrPhone = a?.phone || "";
    } else if (parent?.address_id && typeof parent.address_id === "object") {
      const a = parent.address_id as AddressMini & { name?: string; phone?: string };
      addrText =
        a.address ||
        [a.detail, a.ward, a.district, a.province].filter(Boolean).join(", ") ||
        "—";
      addrName = a.name || "";
      addrPhone = a.phone || "";
    }

    const isGuest = !member && !!parent?.address_guess;

    const name = isGuest ? (parent?.address_guess?.name ?? "—") : (member?.name || addrName || "Người dùng");
    const email = isGuest ? (parent?.address_guess?.email ?? "—") : (member?.email || "—");
    const phone = isGuest ? (parent?.address_guess?.phone ?? "—") : (member?.phone || addrPhone || "—");

    const parentStatus = parent?.status_order;
    const childStatus = o.status_order;
    const status = parentStatus === "unpending" ? "unpending" : (childStatus || parentStatus || "unknown");

    const payment_method = String(parent?.payment_method ?? parent?.transaction_method ?? "—");

    return { name, email, phone, address: addrText, status, payment_method };
  };

  const LOW_STOCK_THRESHOLD = 50;

  const fetchLowStock = async () => {
    if (!shopId) return;
    try {
      const res = await fetch(`${API_BASE}products/shop/${shopId}`, {
        cache: "no-store",
        headers: authHeaders(),
      });
      const json = await res.json();
      const products = extractProducts(json);

      const items: LowStockItem[] = products
        .filter(p => !p.isHidden)
        .map((p) => ({
          id: p._id,
          name: p.name,
          sku: pickMinQtySku(p),
          qty: totalQty(p),
          image: firstImage(p),
        }));

      const warned = items
        .filter(i => i.qty < LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.qty - b.qty);

      setLowStock(warned);
    } catch (e) {
      console.error("❌ Lỗi fetchLowStock:", e);
      setLowStock([]);
    }
  };

  // Followers cho ô bên phải
  const fetchFollowersForTopCard = async () => {
    if (!shopId) return;
    try {
      const res = await fetch(`${API_BASE}shop/${shopId}/followers?all=true`, { cache: "no-store" });
      const data = await res.json();
      const items = data?.items ?? data?.followers ?? [];

      const rows: TopFollowerRow[] = items.map((u: any) => ({
        userId: String(u._id || ""),
        name: u.name || "Người dùng",
        email: u.email || "",
        avatar:
          u?.avatar && String(u.avatar).trim() !== ""
            ? (String(u.avatar).startsWith("http") ? u.avatar : `${API_BASE}images/${u.avatar}`)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "User")}&background=random`,
      }));

      setTopUsers(rows);
    } catch (err) {
      console.error("❌ Lỗi khi lấy followers:", err);
      setTopUsers([]);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    fetchWeeklyRevenue();
    fetchLastWeekRevenue();
    fetchCurrentMonthRevenue();
    fetchLastMonthRevenue();
    fetchMonthlyRevenue();
    fetchLowStock();
    fetchCustomerTypeStats().then(setCustomerPieData);
    fetchFollowersForTopCard(); // dùng followers thay vì top theo số đơn
  }, [shopId]);

  // ===== Helpers format =====
  const fmtVND = (n: number) =>
    (Number.isFinite(n) ? n : 0).toLocaleString("vi-VN") + " ₫";

  const pctChange = (curr: number, prev: number) => {
    if (!prev) return curr ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };
  const arrow = (d: number) => (d > 0 ? "↑" : d < 0 ? "↓" : "");
  const trendClass = (d: number) =>
    d > 0 ? styles.cardStatusUp : d < 0 ? styles.cardStatusDown : styles.cardStatusNeutral;

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.greetingBox}>
          Xin chào Admin -{" "}
          <span style={{ fontWeight: 400, fontSize: 16 }}>
            Tình hình cửa hàng của bạn hôm nay như sau
          </span>
        </div>
        <div className={styles.summaryGrid}>
          {/* 1. Doanh thu tuần này */}
          <div className={`${styles.summaryCard} ${styles.kpiEmerald}`}>
            <h4 className={styles.cardTitle}>DOANH THU TUẦN NÀY</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{fmtVND(weeklyRevenue)}</span>
              {(() => {
                const diff = pctChange(weeklyRevenue, lastWeekRevenue);
                return (
                  <span className={trendClass(diff)}>
                    {Math.abs(diff).toFixed(1)}% {arrow(diff)}
                  </span>
                );
              })()}
            </div>
            <div className={styles.cardSubnote}>So với tuần trước</div>
          </div>

          {/* 2. Doanh thu tháng này */}
          <div className={`${styles.summaryCard} ${styles.kpiIndigo}`}>
            <h4 className={styles.cardTitle}>DOANH THU THÁNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{fmtVND(currentMonthRevenue)}</span>
              {(() => {
                const diff = pctChange(currentMonthRevenue, lastMonthRevenue);
                return (
                  <span className={trendClass(diff)}>
                    {Math.round(Math.abs(diff))}% {arrow(diff)}
                  </span>
                );
              })()}
            </div>
            <div className={styles.cardSubnote}>
              Tháng trước: {fmtVND(lastMonthRevenue)}
            </div>
          </div>

          {/* 3. Tổng đơn hàng (tháng) */}
          <div className={`${styles.summaryCard} ${styles.kpiAmber}`}>
            <h4 className={styles.cardTitle}>TỔNG ĐƠN HÀNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {Number(currentMonthOrders || 0).toLocaleString("vi-VN")}
              </span>
              {(() => {
                const diff = pctChange(currentMonthOrders, lastMonthOrders);
                return (
                  <span className={trendClass(diff)}>
                    {Math.abs(diff).toFixed(1)}% {arrow(diff)}
                  </span>
                );
              })()}
            </div>
            <div className={styles.cardSubnote}>
              Tháng trước: {Number(lastMonthOrders || 0).toLocaleString("vi-VN")}
            </div>
          </div>

          {/* 4. Giá trị đơn trung bình (AOV) */}
          <div className={`${styles.summaryCard} ${styles.kpiRose}`}>
            <h4 className={styles.cardTitle}>GIÁ TRỊ ĐƠN TRUNG BÌNH</h4>
            <div className={styles.cardContent}>
              {(() => {
                const aovThis =
                  currentMonthOrders > 0 ? currentMonthRevenue / currentMonthOrders : 0;
                return (
                  <>
                    <span className={styles.cardValue}>{fmtVND(aovThis)}</span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className={styles.splitSection}>
          <div className={styles.placeholderLeft}>
            <div style={{ width: "100%", height: 350 }}>
              <h2 className={styles.sectionTitle}>Thống kê doanh thu </h2>
              <p className={styles.sectionSubTitle}>
                Biểu đồ thống kê doanh thu theo từng tháng
              </p>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart
                  data={monthlyRevenue}
                  barCategoryGap="30%"
                  barGap={4}
                  maxBarSize={50}
                >
                  <CartesianGrid vertical={false} stroke="#EEF2F7" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                    tickLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                    tickLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString("vi-VN")} ₫`}
                    labelStyle={{ color: "#111", fontWeight: 600 }}
                    itemStyle={{ color: "#444", fontSize: 13, fontWeight: 600 }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    radius={[8, 8, 0, 0]}
                    barSize={35}
                    minPointSize={3}
                    fill="url(#gradRevenue)"
                    activeBar={{ fill: "url(#gradRevenue)", opacity: 1 }}
                  />
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bên phải: Người theo dõi */}
          <div className={styles.placeholderRight}>
            <h2 className={styles.sectionTitle}>Người theo dõi</h2>
            <p className={styles.sectionSubTitle}>
              Danh sách followers của shop
            </p>
            <div className={styles.userList}>
              {topUsers.map((user) => (
                <div className={styles.userRow} key={user.userId}>
                  <div className={styles.userInfo}>
                    <img
                      src={user.avatar}
                      alt="avatar"
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder-user.png"; }}
                    />
                    <div>
                      <div className={styles.name}>{user.name}</div>
                      <div className={styles.email}>{user.email || "—"}</div>
                    </div>
                  </div>
                  <div className={styles.money}>
                    Follower
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.splitSection}>
          {/* BẢNG ĐƠN HÀNG */}
          <div className={styles.placeholderLeft}>
            <h2 className={styles.sectionTitle}>Thống kê đơn hàng</h2>
            <p className={styles.sectionSubTitle}>
              Bảng thống kê các đơn hàng mới
            </p>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>Người đặt</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Phương thức</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((row, index) => {
                  const statusClass =
                    row.status === "pending" ? styles["status-choxacnhan"] :
                    row.status === "preparing" ? styles["status-dangsoan"] :
                    row.status === "awaiting_shipment" ? styles["status-chogui"] :
                    row.status === "shipping" ? styles["status-danggiao"] :
                    row.status === "delivered" ? styles["status-dagiao"] :
                    row.status === "cancelled" ? styles["status-dahuy"] :
                    row.status === "refund" ? styles["status-trahang"] :
                    row.status === "unpending" ? styles["status-chuaxacthuc"] : "";

                  const statusText =
                    row.status === "unpending" ? "Chưa xác thực" :
                    row.status === "pending" ? "Chờ xác nhận" :
                    row.status === "preparing" ? "Đang soạn hàng" :
                    row.status === "awaiting_shipment" ? "Chờ gửi hàng" :
                    row.status === "shipping" ? "Đang giao" :
                    row.status === "delivered" ? "Đã giao" :
                    row.status === "cancelled" ? "Đã hủy" :
                    row.status === "refund" ? "Trả hàng" : row.status;

                  return (
                    <tr key={index}>
                      <td>
                        <div className={styles.userInfo}>
                          <div>
                            <div className={styles.name}>{row.name}</div>
                            <div className={styles.email}>{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{row.phone}</td>
                      <td>{row.address}</td>
                      <td>
                        <span className={`${styles.methodDelivered} ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td>{row.payment_method?.toUpperCase?.() || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cảnh báo tồn kho thấp */}
          <div className={styles.placeholderRight}>
            <div className={styles.lowStockCard}>
              <h2 className={styles.sectionTitle}>Cảnh báo tồn kho thấp</h2>

              <div className={styles.sectionSubTitle}>
                <span>Sản phẩm hết hoặc sắp hết hàng</span>
                <span className={styles.lowStockIcon}>!</span>
              </div>

              <div className={styles.lowStockList}>
                {lowStock.length === 0 ? (
                  <div className={styles.lowStockItem}>
                    <div className={styles.lowStockInfo}>
                      <div className={styles.lowStockName}>Tồn kho ổn định ✅</div>
                      <div className={styles.lowStockSku}>Không có sản phẩm dưới 50</div>
                    </div>
                    <div className={styles.lowStockQty}>—</div>
                  </div>
                ) : (
                  lowStock.map((item: LowStockItem) => (
                    <div className={styles.lowStockItem} key={item.id}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, marginRight: 12 }}
                      />
                      <div className={styles.lowStockInfo}>
                        <div className={styles.lowStockName}>{item.name}</div>
                      </div>
                      <div
                        className={`${styles.lowStockQty} ${item.qty === 0
                          ? styles.qtyZero
                          : item.qty < LOW_STOCK_THRESHOLD
                            ? styles.qtyLow
                            : ""
                          }`}
                      >
                        {item.qty} cái
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.viewAll}>
                <a href="/shop/stockentry">XEM VÀ NHẬP SẢN PHẨM →</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
