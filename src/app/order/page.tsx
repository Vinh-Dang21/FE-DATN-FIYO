"use client";
import {
  Search,
  Bell,
  Eye,
  Pencil,
  Calendar,
  Check,
  CreditCard,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import styles from "./order.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
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
      <Sidebar />

      <section className={styles.content}>
        <Topbar />

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
                    <Link href={`/orderdetail`}>{order.id}</Link>
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
