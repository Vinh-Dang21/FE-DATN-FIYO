"use client";
import {
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
  Table,
} from "lucide-react";
import styles from "./order.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import Tabs from "../component/filterorder";
import Link from "next/link";

interface Order {
  _id: string;
  total_price: number;
  status_order: string;
  createdAt: string;
  user_id: User | null;
  voucher_id?: Voucher;
  payment_method: string;
  transaction_code: string;
  transaction_status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Voucher {
  _id: string;
  value: number;
  voucher_code: string;
  type: string;
  quantity: number;
  created_at: string;
  is_active: boolean;
  expired_at: string | null;
  max_total: number | null;
  max_discount: number;
  min_total: number;
}



export default function Order() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>("pending");


  useEffect(() => {
    const fetchFilteredOrders = async () => {
      try {
        let url = "http://localhost:3000/orders/filter";
        if (filteredStatus !== "all") {
          url += `?status_order=${filteredStatus}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          setOrders(data.result);
        } else {
          setOrders([]); // clear nếu không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lọc đơn hàng:", error);
      }
    };

    fetchFilteredOrders();
  }, [filteredStatus]);


  const handleConfirmOrder = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}/confirm`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (res.ok) {
        alert("Đơn hàng đã được xác nhận!");

        // Cập nhật trạng thái trong danh sách
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status_order: "preparing" }
              : order
          )
        );
      } else {
        alert((data.message || "Xác nhận thất bại"));
      }
    } catch (error) {
      console.error("Lỗi xác nhận:", error);
      alert("Lỗi kết nối máy chủ");
    }
  };

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
        <Tabs onFilter={(status) => setFilteredStatus(status)} />
        <div className={styles.usertList}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Ngày đặt</th>
                <th>Người đặt</th>
                <th>Trạng thái</th>
                <th>Thông tin giao hàng</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link href={`/orderdetail/${order._id}`}>{order._id}</Link>
                  </td>
                  <td>{order.createdAt}</td>
                  <td className={styles.userInfo}>
                    <div className={styles.productDetails}>
                      <div className={styles.userName}>
                        {order.user_id?.name || "Khách lạ"}
                      </div>
                      <div className={styles.userDesc}>
                        {order.user_id?.email || "Không có email"}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`${styles.methodDelivered} ${order.status_order === "pending"
                        ? styles["status-choxacnhan"]
                        : order.status_order === "preparing"
                          ? styles["status-dangsoan"]
                          : order.status_order === "shipping"
                            ? styles["status-danggiao"]
                            : order.status_order === "delivered"
                              ? styles["status-dagiao"]
                              : order.status_order === "cancelled"
                                ? styles["status-dahuy"]
                                : order.status_order === "refund"
                                  ? styles["status-trahang"]
                                  : ""
                        }`}
                    >
                      {order.status_order === "pending"
                        ? "Chờ xác nhận"
                        : order.status_order === "preparing"
                          ? "Đang soạn hàng"
                          : order.status_order === "shipping"
                            ? "Đang giao hàng"
                            : order.status_order === "delivered"
                              ? "Đã giao hàng"
                              : order.status_order === "cancelled"
                                ? "Đã hủy"
                                : order.status_order === "refund"
                                  ? "Trả hàng / Hoàn tiền"
                                  : order.status_order}
                    </span>

                  </td>
                  <td className={styles.shippingInfo}>
                    <div className={styles.userDesc}>
                      <strong>SĐT:</strong> {order.user_id?.phone || "Chưa có"}
                    </div>
                    <div className={styles.userDesc}>
                      <strong>Địa chỉ:</strong> {order.user_id?.address || "Chưa có"}
                    </div>
                  </td>

                  <td>
                    <Link href={`/orderdetail/${order._id}`}>
                      <button className={styles.actionBtn} title="Xem">
                        <Eye size={23} />
                      </button>
                    </Link>
                    {order.status_order === "pending" && (
                      <button
                        className={styles.actionBtn}
                        title="Xác nhận"
                        onClick={() => handleConfirmOrder(order._id)}
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}

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
