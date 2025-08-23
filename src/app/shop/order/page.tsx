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
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";
import Tabs from "@/app/component/filterorder";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { log } from "console";
// ===== Common =====
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

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;   // ví dụ: "Phường 3, Quận 10, TP.HCM"
  detail: string;    // ví dụ: "Số 12, hẻm 34"
  type: string;      // "Nhà riêng" | "Cơ quan" ...
  is_default?: boolean;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== Guest address (2 biến thể BE có thể trả) =====
type GuestAddressBase = {
  name: string;
  phone: string;
  email?: string;
  type?: string;
  detail: string;
};

type GuestAddressV1 = GuestAddressBase & {
  address: string; // dạng gộp sẵn
};

type GuestAddressV2 = GuestAddressBase & {
  province: string;
  district: string;
  ward: string;
};

export type AddressGuess = GuestAddressV1 | GuestAddressV2;


// ===== Order (cha) =====
interface Order {
  _id: string;
  total_price: number;
  status_order: string;           // "unpending" | "pending" | "preparing" | ...
  createdAt: string;
  user_id: User | string | null;  // BE có thể trả object hoặc id
  address_id: Address | string | null;
  address_guess?: AddressGuess;   // ⬅️ UNION đã sửa
  voucher_id?: Voucher;
  payment_method: string;
  transaction_code: string | null;
  transaction_status: string;     // "unpaid" | "paid" | "failed" | ...
  confirmed?: boolean;
  cancel_reason?: string;
  status_history?: { status: string; updatedAt: string; note?: string; _id: string }[];
  updatedAt?: string;
  __v?: number;
}

// ===== OrderShop (con theo shop) =====
interface OrderShop {
  _id: string;
  order_id: Order | null; // có thể null
  shop_id: {
    _id: string;
    name: string;
    // ... bổ sung nếu cần
  };
  total_price: number;
  status_order: string;  // "pending" | "preparing" | "shipping" | ...
  status_history: { status: string; updatedAt: string; note?: string; _id: string }[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// ===== Kiểu dòng hiển thị bảng =====
type RowOrder = {
  _orderShopId: string; // để đi tới chi tiết
  _id: string;          // id hiển thị (dùng orderShopId)
  createdAt: string;    // ưu tiên OrderShop.createdAt
  status_order: string; // hiển thị (ưu tiên "unpending" nếu order cha unpending)
  transaction_status?: string;

  user_name: string;
  user_email: string;
  address_text: string;

  user_id?: string;     // nếu order trả id (không phải object)
  address_id?: string;

  // block guest để render nhanh không cần fetch
  _guest?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string; // "detail, address" hoặc "detail, ward, district, province"
  };
};

// ===== (tuỳ chọn) helpers type guard + format address =====
export function isGuestAddrV1(ag: AddressGuess): ag is GuestAddressV1 {
  return (ag as GuestAddressV1).address !== undefined;
}

export function formatGuestAddress(ag?: AddressGuess): string {
  if (!ag) return "";
  const parts: string[] = [];
  if (ag.detail) parts.push(ag.detail);

  if ("address" in ag && ag.address) {
    // V1: có address
    parts.push(ag.address);
  } else {
    // V2: ghép ward, district, province
    const ward = "ward" in ag ? ag.ward : undefined;
    const district = "district" in ag ? ag.district : undefined;
    const province = "province" in ag ? ag.province : undefined;
    const tail = [ward, district, province].filter(Boolean).join(", ");
    if (tail) parts.push(tail);
  }
  return parts.join(", ");
}



const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000/api/";

// Kiểu dữ liệu cho các đơn hàng trong bảng
interface OrderTableRow {
  _id: string;
  createdAt: string;
  status_order: string;
  user_id?: User;
  address_id?: Address;
  address_guess?: {
    name: string;
    phone: string;
    email?: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
  };
}

export default function Order() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [orders, setOrders] = useState<RowOrder[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    delivered: 0,
    refunded: 0,
    failed: 0,
    shipping: 0,
  });
  const [customerInfoMap, setCustomerInfoMap] = useState<
    Record<string, { name: string; email: string; phone?: string; address?: string }>
  >({});

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

        // Đúng cấu trúc trả về
        const id =
          data?.shop?._id   // ✅ trường hợp hiện tại
          ?? data?.shopId   // fallback nếu BE đổi
          ?? data?._id;     // fallback khác

        if (id) {
          setShopId(String(id));
          console.log("Shop ID:", id);
        } else {
          console.warn("Không tìm được shopId trong payload:", data);
        }
      } catch (err) {
        console.error("Lỗi lấy shopId:", err);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (!shopId) return;
  //   const fetchAllOrders = async () => {
  //     try {
  //       const res = await fetch(`http://localhost:3000/orderShop/${shopId}/confirm`);
  //       const data = await res.json();

  //       if (data.status && Array.isArray(data.result)) {
  //         const counts = {
  //           pending: 0,
  //           delivered: 0,
  //           refunded: 0,
  //           failed: 0,
  //           shipping: 0,
  //         };

  //         data.result.forEach((order: Order) => {
  //           if (order.status_order === "pending") counts.pending++;
  //           if (order.status_order === "delivered") counts.delivered++;
  //           if (order.status_order === "refund") counts.refunded++;
  //           if (order.transaction_status === "failed") counts.failed++;
  //           if (order.status_order === "shipping") counts.shipping++;
  //         });

  //         setStatusCounts(counts);
  //       }
  //     } catch (error) {
  //       console.error("Lỗi khi đếm đơn hàng theo trạng thái:", error);
  //     }
  //   };

  //   fetchAllOrders();
  //   const interval = setInterval(fetchAllOrders, 5000);

  //   return () => clearInterval(interval);
  // }, [shopId]);


  useEffect(() => {
    if (!shopId) return;

    const fetchShopOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}orderShop/shop/${shopId}`);
        const data = await res.json();

        if (data.status && data.result && Array.isArray(data.result.items)) {
          const items: OrderShop[] = data.result.items;

          const counts = {
            pending: 0,
            delivered: 0,
            refunded: 0,
            failed: 0,
            shipping: 0,
          };

          items.forEach((os) => {
            // đếm theo trạng thái đơn mức shop
            if (os.status_order === "pending") counts.pending++;
            if (os.status_order === "delivered") counts.delivered++;
            if (os.status_order === "refund") counts.refunded++;
            if (os.status_order === "shipping") counts.shipping++;

            // nếu có order cha và transaction_status = failed thì cộng failed
            if (os.order_id?.transaction_status === "failed") counts.failed++;
          });

          setStatusCounts(counts);
        }
      } catch (error) {
        console.error("Lỗi khi đếm đơn hàng theo trạng thái:", error);
      }
    };

    fetchShopOrders();
    const interval = setInterval(fetchShopOrders, 5000);
    return () => clearInterval(interval);
  }, [shopId]);

  useEffect(() => {
  if (!shopId) return;

  const fetchFilteredOrders = async () => {
    try {
      const url = new URL(`${API_BASE}orderShop/shop/${shopId}`);

      // BE chỉ lọc được theo status của OrderShop.
      // Với 'unpending' (thuộc order cha) thì KHÔNG gắn query cho BE.
      if (filteredStatus && filteredStatus !== "all" && filteredStatus !== "unpending") {
        url.searchParams.set("status", filteredStatus);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.status && data.result && Array.isArray(data.result.items)) {
        let items: OrderShop[] = data.result.items;

        // Lọc 'unpending' theo trạng thái của ORDER CHA
        if (filteredStatus === "unpending") {
          items = items.filter(os => os.order_id?.status_order === "unpending");
        }

        // Lọc ngày theo OrderShop.createdAt
        if (fromDate) {
          const from = dayjs(fromDate).startOf("day");
          items = items.filter(os => dayjs(os.createdAt).isAfter(from) || dayjs(os.createdAt).isSame(from));
        }
        if (toDate) {
          const to = dayjs(toDate).endOf("day");
          items = items.filter(os => dayjs(os.createdAt).isBefore(to) || dayjs(os.createdAt).isSame(to));
        }

        // Map sang RowOrder
        const rows: RowOrder[] = items.map((os) => {
          const o = os.order_id;
          const ag = o?.address_guess;               // AddressGuess | undefined
          const addrText = formatGuestAddress(ag);   // 🔹 dùng helper, KHÔNG gọi ag.address trực tiếp
          const parentUnpending = o?.status_order === "unpending";

          return {
            _orderShopId: os._id,
            _id: os._id,
            createdAt: os.createdAt,
            // Ưu tiên hiển thị 'unpending' nếu order cha còn unpending
            status_order: parentUnpending ? "unpending" : os.status_order,
            transaction_status: o?.transaction_status,

            // sẽ điền bởi fetch user/address hoặc dùng guest
            user_name: "",
            user_email: "",
            address_text: addrText,   // 🔹 lưu sẵn text địa chỉ để fallback khi render

            user_id: typeof o?.user_id === "string" ? o.user_id : undefined,
            address_id: typeof o?.address_id === "string" ? o.address_id : undefined,

            // Block guest để render nhanh
            _guest: ag
              ? {
                  name: ag.name,
                  email: ag.email ?? "",
                  phone: ag.phone ?? "",
                  address: addrText,
                }
              : undefined,
          };
        });

        setOrders(rows);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi lọc đơn hàng:", error);
      setOrders([]);
    }
  };

  fetchFilteredOrders();
}, [shopId, filteredStatus, fromDate, toDate]);



  const handleUpdateStatus = async (orderId: string, newStatus: string, showAlert = true) => {
    try {
      const res = await fetch(`${API_BASE}orderShop/${orderId}/status`, {
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


  // const handleViewOrder = async (order: RowOrder) => {
  //   try {
  //     // Nếu trạng thái là "pending" thì gọi hàm xác nhận đơn luôn
  //     // if (order.status_order === "pending") {
  //     //   await handleConfirmOrder(order._id, false); // false để không hiện alert
  //     // }
  //     // Sau đó chuyển sang trang chi tiết đơn hàng
  //     router.push(`/orderdetail/${order._orderShopId}`);
  //   } catch (error) {
  //     console.error("Lỗi khi xử lý đơn hàng:", error);
  //     alert("Có lỗi xảy ra khi xử lý đơn hàng");
  //   }
  // };

  const getOrderShopId = (order: any) =>
    order._orderShopId ||
    order.order_shop_id ||
    order.orderShopId ||
    order?.order_shop?._id;

  const handleViewOrder = async (order: RowOrder) => {
    try {
      const orderShopId = getOrderShopId(order);

      if (!orderShopId) {
        console.error("Thiếu orderShopId trong RowOrder:", order);
        alert("Không tìm thấy orderShopId của đơn.");
        return;
      }

      // Gọi API mới để lấy chi tiết đơn của shop
      const res = await fetch(
        `${API_BASE}orderDetail/order-shops/${orderShopId}/details`,
        { method: "GET" }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Lưu tạm vào sessionStorage (trang chi tiết có thể đọc lại)
      try {
        sessionStorage.setItem(
          `orderDetail:${orderShopId}`,
          JSON.stringify(data)
        );
      } catch {
        // nếu storage đầy hoặc bị chặn thì bỏ qua, trang chi tiết tự fetch
      }

      // Điều hướng sang trang chi tiết FE
      router.push(`/shop/orderdetail/${orderShopId}`);
    } catch (error) {
      console.error("Lỗi khi xử lý đơn hàng:", error);
      alert(`Có lỗi khi tải chi tiết đơn: ${String((error as Error)?.message || error)}`);
    }
  };


  // const getCustomerInfo = (order: Order) => {
  //   if (order.user_id) {
  //     return {
  //       name: order.user_id.name,
  //       email: order.user_id.email,
  //     };
  //   } else if (order.address_guess) {
  //     return {
  //       name: order.address_guess.name,
  //       email: order.address_guess.email || "Không có email",
  //     };
  //   } else {
  //     return {
  //       name: "Khách lạ",
  //       email: "Không có email",
  //     };
  //   }
  // };

  const handleConfirmOrder = async (orderId: string, showAlert = true) => {
    try {
      const res = await fetch(`${API_BASE}orderShop/${orderId}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.status) throw new Error(data.message || "Lỗi xác nhận đơn hàng");

      if (showAlert) alert(data.message || "Xác nhận đơn hàng thành công!");

      // Cập nhật lại trạng thái đơn trong local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status_order: "preparing" } : order
        )
      );
    } catch (error: any) {
      if (showAlert) alert(error.message || "Lỗi khi xác nhận đơn hàng");
    }
  };


  // Hàm lấy thông tin người dùng và địa chỉ từ order
  async function fetchUserAndAddressInfo(userId: string, addressId: string) {

    try {
      const [userRes, addressRes] = await Promise.all([
        fetch(`${API_BASE}user/${userId}`),
        fetch(`${API_BASE}address/${addressId}`)
      ]);
      const userData = await userRes.json();
      const addressData = await addressRes.json();

      // user ở userData.data, address ở addressData.result
      return {
        user: userData.data || null,
        address: addressData.result || null,
      };
    } catch (error) {
      console.error("Lỗi lấy thông tin user hoặc address:", error);
      return { user: null, address: null };
    }
  }

  useEffect(() => {
    // Lọc ra các order cần fetch info (chưa có trong customerInfoMap)
    const needFetch = orders.filter(
      (order) =>
        order.user_id &&
        order.address_id &&
        !customerInfoMap[order._id]
    );

    if (needFetch.length === 0) return;

    needFetch.forEach((order) => {
      fetchUserAndAddressInfo(order.user_id!, order.address_id!).then((info) => {
        
        setCustomerInfoMap((prev) => ({
          ...prev,
          [order._id]: {
            name: info.user?.name || "Không rõ",
            email: info.user?.email || "Không rõ",
            phone: info.address?.phone || info.user?.phone || "",
            address: info.address
              ? `${info.address.detail}, ${info.address.address}`
              : "",
          },
        }));
      });
    });
  }, [orders, customerInfoMap]);


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
              {orders.map((order) => {
                const customer =
                  customerInfoMap[order._id] ||
                  order._guest ||  // 👈 thêm dòng này
                  { name: "Khách lạ", email: "", phone: "", address: "" };
                return (
                  <tr key={order._id}>
                    <td>
                      <Link href="#" onClick={(e) => {
                        e.preventDefault();
                        handleViewOrder(order);
                      }}>
                        {order._id}
                      </Link>
                    </td>

                    <td>{dayjs(order.createdAt).format("HH:mm:ss - DD/MM/YYYY")}</td>

                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{customer.name}</div>
                        <div className={styles.userDesc}>{customer.email}</div>
                        {customer.phone && (
                          <div className={styles.userDesc}>
                            <strong>SĐT:</strong> {customer.phone}
                          </div>
                        )}
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
                                      : order.status_order === "unpending"
                                        ? styles["status-chuaxacthuc"]
                                        : ""
                          }`}
                      >
                        {order.status_order === "unpending"
                          ? "Chưa xác thực"
                          : order.status_order === "pending"
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
                      {customer.address ? (
                        <>
                          {customer.phone && (
                            <div className={styles.userDesc}>
                              <strong>SĐT:</strong> {customer.phone}
                            </div>
                          )}
                          <div className={styles.userDesc}>
                            <strong>Địa chỉ:</strong> {customer.address}
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
                        {order.status_order === "unpending" && (
                          <button
                            className={styles.statusBtn}
                            // onClick={() => handleConfirmOrder(order._id)}
                            onClick={() => handleUpdateStatus(order._id, "pending")}
                          >
                            Đã xác thực
                          </button>
                        )}

                        {order.status_order === "pending" && (
                          <button
                            className={styles.statusBtn}
                            onClick={() => handleConfirmOrder(order._id)}
                          // onClick={() => handleUpdateStatus(order._id, "preparing")}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
