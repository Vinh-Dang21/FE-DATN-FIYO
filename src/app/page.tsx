"use client";
import {
  LayoutDashboard,
  BarChart as BarChartIcon, // Đổi tên để tránh trùng
  Users,
  ShoppingCart,
  GraduationCap,
  MessageCircle,
  Layers,
  LogOut,
  Search,
  Bell,
  Shirt,
} from "lucide-react";
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

// ...existing imports...
const orders = [
  {
    id: 1001,
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0912345678",
    address: "123 Đường ABC, Q.1, TP.HCM",
    method: "COD",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 1002,
    name: "Trần Thị B",
    email: "tranb@gmail.com",
    phone: "0987654321",
    address: "456 Đường XYZ, Q.3, TP.HCM",
    method: "VNPay",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 1003,
    name: "Lê Văn C",
    email: "levanc@gmail.com",
    phone: "0909123456",
    address: "789 Đường DEF, Q.5, TP.HCM",
    method: "ZaloPay",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: 1001,
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0912345678",
    address: "123 Đường ABC, Q.1, TP.HCM",
    method: "COD",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 1002,
    name: "Trần Thị B",
    email: "tranb@gmail.com",
    phone: "0987654321",
    address: "456 Đường XYZ, Q.3, TP.HCM",
    method: "VNPay",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  
];

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

const data = [
  { name: "Tháng 1", orders: 30 },
  { name: "Tháng 2", orders: 50 },
  { name: "Tháng 3", orders: 70 },
  { name: "Tháng 4", orders: 45 },
  { name: "Tháng 5", orders: 57 },
  { name: "Tháng 6", orders: 34 },
  { name: "Tháng 7", orders: 24 },
  { name: "Tháng 8", orders: 11 },
  { name: "Tháng 9", orders: 15 },
  { name: "Tháng 10", orders: 17 },
  { name: "Tháng 11", orders: 32 },
  { name: "Tháng 12", orders: 45 },
];

export default function Dashboard() {
  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <div className={styles.logo}>F I Y O</div>

        <ul className={styles.menuList}>
          <li className={styles.activeItem}>
            <a href="/" className={styles.menuItem}>
              <LayoutDashboard className={styles.icon} />
              <span className={styles.title}>Tổng quan</span>
            </a>
          </li>
          <li>
            <a href="/order" className={styles.menuItem}>
              <ShoppingCart className={styles.icon} />
              <span className={styles.title}>Đơn hàng</span>
            </a>
          </li>
          <li>
            <a href="/products" className={styles.menuItem}>
              <Shirt className={styles.icon} />
              <span className={styles.title}>Sản phẩm</span>
            </a>
          </li>
          <li>
            <a href="/categories" className={styles.menuItem}>
              <Layers className={styles.icon} />
              <span className={styles.title}>Danh mục</span>
            </a>
          </li>
          <li>
            <a href="/users" className={styles.menuItem}>
              <Users className={styles.icon} />
              <span className={styles.title}>Người dùng</span>
            </a>
          </li>
          <li>
            <a href="/voucher" className={styles.menuItem}>
              <GraduationCap className={styles.icon} />
              <span className={styles.title}>Khuyến mãi</span>
            </a>
          </li>
          <li>
            <a href="/comments" className={styles.menuItem}>
              <MessageCircle className={styles.icon} />
              <span className={styles.title}>Bình luận</span>
            </a>
          </li>
          <li>
            <a href="/logout" className={styles.menuItem}>
              <LogOut className={styles.icon} />
              <span className={styles.title}>Đăng xuất</span>
            </a>
          </li>
        </ul>
      </aside>

      <section className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.actions}>
            <div className={styles.notification}>
              <Bell className={styles.icon} />
              <span className={styles.dot}></span>
            </div>
            <div className={styles.avatarWrapper}>
              <img
                src="https://phunugioi.com/wp-content/uploads/2022/06/Hinh-cho-cute.jpg"
                alt="Avatar"
                className={styles.avatar}
              />
              <span className={styles.onlineDot}></span>
            </div>
          </div>
        </div>
        <div className={styles.greetingBox}>
          Xin chào Admin -{" "}
          <span style={{ fontWeight: 400, fontSize: 16 }}>
            Tình hình cửa hàng của bạn hôm nay như sau
          </span>
        </div>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>DOANH THU TRONG NGÀY</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>6,426 tr</span>
              <span className={styles.cardStatusUp}>+36% ↑</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG DOANH THU</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>29,380 tr</span>
              <span className={styles.cardStatusDown}>Tháng trước: +14% ↓</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG ĐƠN HÀNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>84,382</span>
              <span className={styles.cardStatusUp}>Tháng trước: +36% ↑</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <h4 className={styles.cardTitle}>TỔNG KHÁCH HÀNG</h4>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>33,493</span>
              <span className={styles.cardStatusUp}>Tháng trước: +36% ↑</span>
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
                <BarChart data={data} barCategoryGap={10}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#7367F0" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.placeholderRight}>
            <div style={{ width: "100%", height: 350 }}>
              <h2 className={styles.sectionTitle}>Thống kê bán hàng</h2>
              <p className={styles.sectionSubTitle}>
                Tỉ lệ doanh số theo kênh bán hàng
              </p>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Cửa hàng", value: 80 },
                      { name: "TikTok Shop", value: 60 },
                      { name: "Shopee", value: 100 },
                      { name: "Fanpage", value: 40 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    <Cell fill="#007BFF" />
                    <Cell fill="#FF69B4" />
                    <Cell fill="#FFA500" />
                    <Cell fill="#00C49F" />
                  </Pie>
                  <Legend />
                  <Tooltip />
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
                Bảng thống kê các đơn hàng trong ngày
              </p>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người đặt</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Phương thức</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>#{order.id}</td>
                    <td>
                      <div className={styles.userInfo}>
                        <img src={order.avatar} alt="avatar" />
                        <div>
                          <div className={styles.name}>{order.name}</div>
                          <div className={styles.email}>{order.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{order.phone}</td>
                    <td>{order.address}</td>
                    <td>{order.method}</td>
                  </tr>
                ))}
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
                  <div className={styles.money}>{user.total}</div>
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
