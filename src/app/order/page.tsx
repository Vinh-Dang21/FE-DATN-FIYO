"use client";
import {
  Users,
  ShoppingCart,
  GraduationCap,
  MessageCircle,
  Columns3,
  LogOut,
  Search,
  Bell,
  Eye,
  Pencil,
  Shirt,
  Calendar,
  Check,
  CreditCard,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import styles from "./order.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
// Dữ liệu giả
const orders = [
  {
    id: "#1010",
    date: "10/06/2024",
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    status: "Chờ xác nhận",
    address: "25 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
  },
  {
    id: "#1009",
    date: "09/06/2024",
    name: "Phạm Văn Hùng",
    email: "hung.pham@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    status: "Chờ xác nhận",
    address: "88 Lý Thường Kiệt, Quận 10, TP.HCM",
  },
  {
    id: "#1008",
    date: "08/06/2024",
    name: "Lê Thị Hồng",
    email: "hong.le@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    status: "Đang giao",
    address: "12 Nguyễn Văn Linh, Quận 7, TP.HCM",
  },
  {
    id: "#1007",
    date: "07/06/2024",
    name: "Trần Quốc Dũng",
    email: "dung.tran@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    status: "Đang giao",
    address: "88 Cách Mạng Tháng 8, Quận 10, TP.HCM",
  },
  {
    id: "#1006",
    date: "06/06/2024",
    name: "Ngô Thị Hạnh",
    email: "hanh.ngo@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "Đã giao",
    address: "22 Phan Đăng Lưu, Bình Thạnh, TP.HCM",
  },
  {
    id: "#1005",
    date: "05/06/2024",
    name: "Võ Minh Tuấn",
    email: "tuan.vo@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "Đã hủy",
    address: "99 Trần Hưng Đạo, Quận 5, TP.HCM",
  },
  {
    id: "#1004",
    date: "04/06/2024",
    name: "Phạm Thị Mai",
    email: "mai.pham@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "Đã giao",
    address: "210 Lê Lợi, Quận 3, TP.HCM",
  },
  {
    id: "#1003",
    date: "03/06/2024",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "Đã giao",
    address: "15 Nguyễn Trãi, Quận 1, TP.HCM",
  },
  {
    id: "#1002",
    date: "02/06/2024",
    name: "Lê Văn Cường",
    email: "cuong.le@gmail.com",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "Đã giao",
    address: "789 Cách Mạng Tháng 8, Quận 10, TP.HCM",
  },
  {
    id: "#1001",
    date: "01/06/2024",
    name: "Trần Thị Bích",
    email: "bich.tran@gmail.com",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "Đã hủy",
    address: "45 Lê Lợi, Quận 3, TP.HCM",
  },
];

export default function Order() {
  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <div className={styles.logo}>F I Y O</div>
        <ul className={styles.menuList}>
          <li>
            <a href="/" className={styles.menuItem}>
              <LayoutDashboard className={styles.icon} />
              <span className={styles.title}>Tổng quan</span>
            </a>
          </li>
          <li className={styles.activeItem}>
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
              <Columns3 className={styles.icon} />
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

        <div className={styles.orderSummary}>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>56</div>
              <div className={styles.orderLabel}>Chờ xác nhận</div>
            </div>
            <div className={styles.orderIcon}>
              <Calendar />
            </div>
          </div>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>12,689</div>
              <div className={styles.orderLabel}>Đã hoàn thành</div>
            </div>
            <div className={styles.orderIcon}>
              <Check />
            </div>
          </div>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>124</div>
              <div className={styles.orderLabel}>Đã hoàn tiền</div>
            </div>
            <div className={styles.orderIcon}>
              <CreditCard />
            </div>
          </div>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>32</div>
              <div className={styles.orderLabel}>Thất bại</div>
            </div>
            <div className={styles.orderIcon}>
              <AlertCircle />
            </div>
          </div>
        </div>

        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm ..."
              className={styles.searchInput}
            />
          </div>
        </div>
        <div className={styles.usertList}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Ngày đặt</th>
                <th>Người đặt</th>
                <th>Trạng thái</th>
                <th>Địa chỉ</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/orderdetail`}>
                      {order.id}
                    </Link>
                  </td>
                  <td>{order.date}</td>
                  <td className={styles.userInfo}>
                    <img
                      src={order.avatar}
                      alt="Hình SP"
                      className={styles.userImage}
                    />
                    <div className={styles.productDetails}>
                      <div className={styles.userName}>{order.name}</div>
                      <div className={styles.userDesc}>{order.email}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.methodDelivered} ${
                        order.status === "Chờ xác nhận"
                          ? styles["status-choxacnhan"]
                          : order.status === "Đang giao"
                          ? styles["status-danggiao"]
                          : order.status === "Đã giao"
                          ? styles["status-dagiao"]
                          : order.status === "Đã hủy"
                          ? styles["status-dahuy"]
                          : ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.address}</td>
                  <td>
                    <Link href={`/orderdetail`}>
                      <button className={styles.actionBtn} title="Xem">
                        <Eye size={23} />
                      </button>
                    </Link>
                    <button className={styles.actionBtn} title="Sửa">
                      <Pencil size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
