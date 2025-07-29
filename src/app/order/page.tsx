"use client";
import {
  Eye,
  Calendar,
  Check,
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
import { useRouter } from "next/navigation";
import dayjs from "dayjs";



interface Order {
  _id: string;
  total_price: number;
  status_order: string;
  createdAt: string;
  user_id: User | null;
  address_id: Address | null;
  address_guess?: {
    name: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
  };
  voucher_id?: Voucher;
  payment_method: string;
  transaction_code: string | null;
  transaction_status: string;
}


interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  detail: string;
  type: string;
  is_default?: boolean;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}


interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role?: number;
  authType?: string;
  point?: number;
  rank?: string;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
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
  const router = useRouter();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>("pending");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    delivered: 0,
    refunded: 0,
    failed: 0,
    shipping: 0, // 🆕 thêm dòng này
  });

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/orders");
        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          const counts = {
            pending: 0,
            delivered: 0,
            refunded: 0,
            failed: 0,
            shipping: 0,
          };

          data.result.forEach((order: Order) => {
            if (order.status_order === "pending") counts.pending++;
            if (order.status_order === "delivered") counts.delivered++;
            if (order.status_order === "refund") counts.refunded++;
            if (order.transaction_status === "failed") counts.failed++;
            if (order.status_order === "shipping") counts.shipping++;

          });

          setStatusCounts(counts);
        }
      } catch (error) {
        console.error("Lỗi khi đếm đơn hàng theo trạng thái:", error);
      }
    };

    fetchAllOrders();
  }, []);

  useEffect(() => {
    const fetchFilteredOrders = async () => {
      try {
        let url = "http://localhost:3000/orders/filter";
        const params = new URLSearchParams();

        if (filteredStatus !== "all") {
          params.append("status_order", filteredStatus);
        }
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          setOrders(data.result);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Lỗi khi lọc đơn hàng:", error);
      }
    };

    fetchFilteredOrders();
  }, [filteredStatus, fromDate, toDate]); // ✅ phải có đủ 3 biến



  const handleUpdateStatus = async (orderId: string, newStatus: string, showAlert = true) => {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        if (showAlert) alert("Cập nhật trạng thái thành công!");

        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status_order: newStatus } : order
          )
        );
      } else {
        if (showAlert) alert(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      if (showAlert) alert("Lỗi kết nối máy chủ");
    }
  };


  const handleViewOrder = async (order: Order) => {
    if (order.status_order === "pending") {
      await handleUpdateStatus(order._id, "preparing", false);
    }
    router.push(`/orderdetail/${order._id}`);
  };


  return (
    <main className={styles.main}>
      <Sidebar />

      <section className={styles.content}>
        <Topbar />

        <div className={styles.orderSummary}>
          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>{statusCounts.pending}</div>
              <div className={styles.orderLabel}>Chờ xác nhận</div>
            </div>
            <div className={styles.orderIcon}>
              <Calendar />
            </div>
          </div>

          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>{statusCounts.shipping}</div>
              <div className={styles.orderLabel}>Đang giao</div>
            </div>
            <div className={styles.orderIcon}>
              <Truck />
            </div>
          </div>


          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>{statusCounts.delivered.toLocaleString("vi-VN")}</div>
              <div className={styles.orderLabel}>Đã hoàn thành</div>
            </div>
            <div className={styles.orderIcon}>
              <Check />
            </div>
          </div>

          <div className={styles.orderItem}>
            <div className={styles.orderInfo}>
              <div className={styles.orderNumber}>{statusCounts.failed}</div>
              <div className={styles.orderLabel}>Thất bại</div>
            </div>
            <div className={styles.orderIcon}>
              <AlertCircle />
            </div>
          </div>
        </div>

        <div className={styles.searchProduct}>
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchAddBar}>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.dateFilterBar}>
              <label>
                Từ:
                <input
                  type="date"
                  className={styles.dateInput}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label>
                Đến:
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
            </div>
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
                    <Link href="#" onClick={(e) => {
                      e.preventDefault();
                      handleViewOrder(order);
                    }}>
                      {order._id}
                    </Link>
                  </td>

                  <td>{dayjs(order.createdAt).format("DD/MM/YYYY")}</td>

                  <td>
                    <div className={styles.userInfo}>
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
                          : order.status_order === "awaiting_shipment"
                            ? styles["status-chogui"]
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
                          : order.status_order === "awaiting_shipment"
                            ? "Chờ gửi hàng"
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
                    {order.address_id ? (
                      <>
                        <div className={styles.userDesc}>
                          <strong>SĐT:</strong> {order.address_id.phone}
                        </div>
                        <div className={styles.userDesc}>
                          <strong>Địa chỉ:</strong> {order.address_id.detail}, {order.address_id.address}
                        </div>
                      </>
                    ) : order.address_guess ? (
                      <>
                        <div className={styles.userDesc}>
                          <strong>SĐT:</strong> {order.address_guess.phone}
                        </div>
                        <div className={styles.userDesc}>
                          <strong>Địa chỉ:</strong>{" "}
                          {`${order.address_guess.detail}, ${order.address_guess.ward}, ${order.address_guess.district}, ${order.address_guess.province}`}
                        </div>
                      </>
                    ) : (
                      <div className={styles.userDesc}>Không có địa chỉ</div>
                    )}
                  </td>

                  <td>
                    <div className={styles.actionGroup}>
                      <button className={styles.actionBtn} onClick={() => handleViewOrder(order)}>
                        <Eye size={25} />
                      </button>


                      {order.status_order === "pending" && (
                        <button
                          className={styles.statusBtn}
                          onClick={() => handleUpdateStatus(order._id, "preparing")}
                        >
                          Xác nhận
                        </button>
                      )}

                      {order.status_order === "preparing" && (
                        <button
                          className={styles.statusBtn}
                          onClick={() => handleUpdateStatus(order._id, "awaiting_shipment")}
                        >
                          Chờ gửi
                        </button>
                      )}

                      {order.status_order === "awaiting_shipment" && (
                        <button
                          className={styles.statusBtn}
                          onClick={() => handleUpdateStatus(order._id, "shipping")}
                        >
                          Đang giao
                        </button>
                      )}

                      {order.status_order === "shipping" && (
                        <button
                          className={styles.statusBtn}
                          onClick={() => handleUpdateStatus(order._id, "delivered")}
                        >
                          Đã giao
                        </button>
                      )}
                    </div>
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
