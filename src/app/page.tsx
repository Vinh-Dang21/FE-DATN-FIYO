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
} from "recharts";
import { useEffect, useState } from "react";
import Sidebar from "./component/Sidebar";
import Topbar from "./component/Topbar";

// ...existing imports...

const topUsers = [
  {
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    total: "12,000,000đ",
  },
  {
    name: "Trần Thị B",
    email: "tranb@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    total: "10,500,000đ",
  },
  {
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    total: "9,800,000đ",
  },
  {
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    total: "12,000,000đ",
  },
  {
    name: "Trần Thị B",
    email: "tranb@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    total: "10,500,000đ",
  },
];
// ...existing code...

interface MonthlyRevenueItem {
  name: string;
  revenue: number;
}

export default function Dashboard() {
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [currentMonthOrders, setCurrentMonthOrders] = useState(0);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [lastMonthOrders, setLastMonthOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>(
    []
  );
  const [customerPieData, setCustomerPieData] = useState<
    { name: string; value: number }[]
  >([]);


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

  const fetchWeeklyRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfCurrentWeek();

    try {
      const res = await fetch(
        `http://localhost:3000/orders?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = await res.json();

      const totalRevenue = data.result.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.createdAt);
        const isInRange =
          orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
        const isDelivered = order.status_order === "delivered";
        return isInRange && isDelivered ? sum + order.total_price : sum;
      }, 0);

      console.log("💰 Doanh thu tuần này:", totalRevenue);
      setWeeklyRevenue(totalRevenue);
    } catch (error) {
      console.error("🔥 Lỗi khi tính doanh thu tuần:", error);
    }
  };

  const fetchLastWeekRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfLastWeek();

    try {
      const res = await fetch(
        `http://localhost:3000/orders?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = await res.json();

      const total = data.result.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.createdAt);
        const isInRange =
          orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);
        const isDelivered = order.status_order === "delivered";
        return isInRange && isDelivered ? sum + order.total_price : sum;
      }, 0);

      console.log("💸 Doanh thu tuần trước:", total);
      setLastWeekRevenue(total);
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu tuần trước:", error);
    }
  };

  const fetchCurrentMonthRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfCurrentMonth();

    try {
      const res = await fetch(
        `http://localhost:3000/orders?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = await res.json();

      let total = 0;
      let count = 0;

      data.result.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const isInRange =
          orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);

        if (isInRange) {
          total += order.total_price;
          count += 1;
        }
      });

      setCurrentMonthRevenue(total);
      setCurrentMonthOrders(count);

      console.log("🟢 Doanh thu tháng này:", total);
      console.log("📦 Số đơn tháng này:", count);
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu tháng này:", error);
    }
  };

  const fetchLastMonthRevenue = async () => {
    const { fromDate, toDate } = getStartAndEndOfLastMonth();

    try {
      const res = await fetch(
        `http://localhost:3000/orders?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = await res.json();

      let total = 0;
      let count = 0;

      data.result.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const isInRange =
          orderDate >= new Date(fromDate) && orderDate <= new Date(toDate);

        if (isInRange) {
          total += order.total_price;
          count += 1;
        }
      });

      setLastMonthRevenue(total);
      setLastMonthOrders(count);

      console.log("🟡 Doanh thu tháng trước:", total);
      console.log("🟡 Đơn hàng tháng trước:", count);
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu tháng trước:", error);
    }
  };

  const fetchTotalUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/user/");
      const data = await res.json();

      if (Array.isArray(data.result)) {
        setTotalUsers(data.result.length);
        console.log("🟢 Tổng số người dùng:", data.result.length);
      } else {
        console.error("❌ Không phải mảng user:", data);
      }
    } catch (error) {
      console.error("🔴 Lỗi khi fetch user:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();

      if (data.status && Array.isArray(data.result)) {
        const pendingOrders = data.result
          .filter((order: any) => order.status_order === "pending")
          .slice(0, 10);

        console.log("🟡 Đơn hàng pending:", pendingOrders);
        return pendingOrders;
      } else {
        console.error("Dữ liệu không hợp lệ:", data);
        return [];
      }
    } catch (err) {
      console.error("❌ Lỗi khi fetch đơn hàng:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadPendingOrders = async () => {
      const orders = await fetchPendingOrders();
      setPendingOrders(orders);
    };
    loadPendingOrders();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const resUser = await fetch("http://localhost:3000/user/");
      const dataUser = await resUser.json();
      const users = dataUser.result;

      const spendingList = await Promise.all(
        users.map(async (user: any) => {
          const resOrder = await fetch(
            `http://localhost:3000/orders/user/${user._id}`
          );
          const orders = await resOrder.json();

          const totalSpent = orders.reduce(
            (sum: number, order: any) =>
              order.status_order === "delivered"
                ? sum + (order.total_price || 0)
                : sum,
            0
          );

          return {
            name: user.name,
            email: user.email,
            avatar:
              user.avatar && user.avatar.trim() !== ""
                ? user.avatar
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`,
            total: totalSpent,
          };
        })
      );

      const top10 = spendingList
        .filter((u) => u.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setTopUsers(top10);
    } catch (error) {
      console.error("❌ Lỗi khi lấy top người dùng:", error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json(); // ✅ cần khai báo dòng này

      const orders = data.result || [];

      if (!Array.isArray(orders)) {
        console.error("orders không phải là mảng:", orders);
        return;
      }

      const monthlyTotals: { [key: number]: number } = {};

      orders.forEach((order) => {
        if (order.status_order !== "delivered") return;

        const createdAt = new Date(order.createdAt);
        const month = createdAt.getMonth(); // tháng từ 0 đến 11

        const total = order.total_price || 0;
        monthlyTotals[month] = (monthlyTotals[month] || 0) + total;
      });

      const result = Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        revenue: monthlyTotals[i] || 0,
      }));

      setMonthlyRevenue(result);
    } catch (error) {
      console.error("Lỗi khi fetch đơn hàng:", error);
    }
  };

  const fetchCustomerTypeStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();
      const orders = data.result || [];

      let guestCount = 0;
      let memberCount = 0;

      orders.forEach((order: any) => {
        // Không cần lọc theo trạng thái nữa

        if (order.user_id) {
          memberCount += 1;
        } else if (order.address_guess) {
          guestCount += 1;
        }
      });

      return [
        { name: "Hội viên", value: memberCount },
        { name: "Khách vãng lai", value: guestCount },
      ];
    } catch (error) {
      console.error("❌ Lỗi khi thống kê hội viên vs khách:", error);
      return [];
    }
  };



  useEffect(() => {
    fetchWeeklyRevenue();
    fetchLastWeekRevenue();
    fetchCurrentMonthRevenue();
    fetchLastMonthRevenue();
    fetchTotalUsers();
    fetchMonthlyRevenue();
    fetchTopUsers();
    fetchCustomerTypeStats().then(setCustomerPieData);
  }, []);

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
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU TUẦN NÀY</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {weeklyRevenue.toLocaleString()} đ
              </span>
              <span
                className={
                  weeklyRevenue >= lastWeekRevenue
                    ? styles.cardStatusUp
                    : styles.cardStatusDown
                }
              >
                {Math.abs(
                  ((weeklyRevenue - lastWeekRevenue) / (lastWeekRevenue || 1)) *
                  100
                ).toFixed(1)}
                % {weeklyRevenue >= lastWeekRevenue ? "↑" : "↓"}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU THÁNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {Math.round(currentMonthRevenue / 1000)} tr
              </span>
              <span
                className={
                  weeklyRevenue >= lastWeekRevenue
                    ? styles.cardStatusUp
                    : styles.cardStatusDown
                }
              >
                Tháng trước:{" "}
                {Math.round(
                  ((currentMonthRevenue - lastMonthRevenue) /
                    (lastMonthRevenue || 1)) *
                  100
                )}
                %{currentMonthRevenue >= lastMonthRevenue ? " ↑" : " ↓"}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG ĐƠN HÀNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {currentMonthOrders.toLocaleString("vi-VN")}
              </span>

              <span
                className={
                  currentMonthOrders >= lastMonthOrders
                    ? styles.cardStatusUp
                    : styles.cardStatusDown
                }
              >
                Tháng trước:&nbsp;
                {Number(
                  (
                    ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) *
                    100
                  ).toFixed(1)
                )}
                % {currentMonthOrders >= lastMonthOrders ? "↑" : "↓"}
              </span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG NGƯỜI DÙNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>{totalUsers}</span>
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
                <BarChart data={monthlyRevenue} barCategoryGap={10}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()} đ`}
                  />
                  <Bar dataKey="revenue" fill="#7367F0" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.placeholderRight}>
            <div style={{ width: "100%", height: 350 }}>
              <h2 className={styles.sectionTitle}>Thống kê bán hàng</h2>
              <p className={styles.sectionSubTitle}>
                Tỷ lệ đơn hàng: Đăng nhập vs Mua nhanh
              </p>

              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={customerPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    <Cell fill="#7367F0" /> {/* Hội viên */}
                    <Cell fill="#FF9F43" /> {/* Khách vãng lai */}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()} đơn`}
                  />
                </PieChart>
              </ResponsiveContainer>

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
                {pendingOrders.map((order: any, index: number) => {
                  const isGuest = !order.user_id && order.address_guess;

                  const name = isGuest
                    ? order.address_guess.name
                    : order.user_id?.name || "—";
                  const email = isGuest
                    ? order.address_guess.email
                    : order.user_id?.email || "—";
                  const phone = isGuest
                    ? order.address_guess.phone
                    : order.user_id?.phone || "—";
                  const address = isGuest
                    ? order.address_guess.address
                    : order.address_id?.address || "—";
                  const status =
                    order.status_order ||
                    order.status_history?.[order.status_history.length - 1]
                      ?.status ||
                    "unknown";

                  return (
                    <tr key={index}>
                      <td>
                        <div className={styles.userInfo}>
                          <div>
                            <div className={styles.name}>{name}</div>
                            <div className={styles.email}>{email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{phone}</td>
                      <td>{address}</td>
                      <td>
                        <span
                          className={`${styles.methodDelivered} ${styles["status-choxacnhan"]}`}
                        >
                          Chờ xác nhận
                        </span>
                      </td>
                      <td>{order.payment_method?.toUpperCase()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TOP NGƯỜI DÙNG */}
          <div className={styles.placeholderRight}>
            <h2 className={styles.sectionTitle}>Top Người Dùng</h2>
            <p className={styles.sectionSubTitle}>
              Người dùng tiêu tiền nhiều nhất tháng này
            </p>
            <div className={styles.userList}>
              {topUsers.map((user, index) => (
                <div className={styles.userRow} key={index}>
                  <div className={styles.userInfo}>
                    <img src={user.avatar} alt="avatar" />
                    <div>
                      <div className={styles.name}>{user.name}</div>
                      <div className={styles.email}>{user.email}</div>
                    </div>
                  </div>
                  <div className={styles.money}>
                    {user.total.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.viewAll}>
              <a href="#">XEM TẤT CẢ NGƯỜI DÙNG →</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
