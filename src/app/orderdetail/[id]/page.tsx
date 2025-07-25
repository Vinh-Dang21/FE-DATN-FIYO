
"use client";
import { useEffect, useState } from "react";
import styles from "./orderdetail.module.css";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import { useParams } from "next/navigation";
import dayjs from "dayjs";

interface Product {
    _id: string;
    name: string;
    images: string[];
    price: number;
    sale: number;
    material: string;
    shop_id: number;
    create_at: string;
    description: string;
    sale_count?: number;
    isHidden: boolean;
    category_id: {
        categoryName: string;
        categoryId: string;
    };
    variants: Variant[]; // 👈 Thêm dòng này
}

interface Variant {
    color: string;
    sizes: {
        size: string;
        quantity: number;
        sku?: string; // nếu có dùng SKU
    }[];
}




export default function Order() {
    const params = useParams();
    const orderId = params?.id;
    const [order, setOrder] = useState<any>(null);
    const [orderProducts, setOrderProducts] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!orderId) return;

            try {
                const [orderDetailRes, orderInfoRes] = await Promise.all([
                    fetch(`http://localhost:3000/orderDetail/${orderId}`),
                    fetch(`http://localhost:3000/orders/${orderId}`)
                ]);

                const orderDetailData = await orderDetailRes.json();
                const orderInfoData = await orderInfoRes.json();

                if (orderDetailData.status) {
                    setOrderProducts(orderDetailData.result);
                }

                if (orderInfoData.status) {
                    setOrder(orderInfoData.result); // 🟢 đây mới có các field như total_price, status_order, v.v.
                    setUser(orderDetailData.user); // ✅ đúng source user // 🟢 user nằm trong order.result.user_id
                }

            } catch (error) {
                console.error("Lỗi khi fetch order:", error);
            }
        };

        fetchData();
    }, [orderId]);
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xác nhận";
            case "preparing":
                return "Đang soạn";
            case "awaiting_shipment":
                return "Chờ gửi";
            case "shipping":
                return "Đang giao";
            case "delivered":
                return "Đã giao";
            case "cancelled":
                return "Đã hủy";
            case "refund":
                return "Trả hàng / Hoàn tiền";
            default:
                return "Không xác định";
        }
    };

    const orderSubtotal = orderProducts.reduce((total, item) => {
        return total + item.product.price * item.quantity;
    }, 0);

    const handleUpdateStatus = async (newStatus: string) => {
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
                alert("Cập nhật trạng thái thành công!");
                setOrder((prev: any) => ({ ...prev, status_order: newStatus }));
            } else {
                alert(data.message || "Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert("Lỗi kết nối máy chủ");
        }
    };



    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />
                <div className={styles.orderSummary}>
                    <div className={styles.orderInfoLeft}>
                        <h2 className={styles.orderTitle}>Mã hóa đơn: {orderProducts[0]?.order_id || "Đang tải..."}</h2>

                        <p className={styles.statusLine}>
                            Trạng thái:
                            <span
                                className={`${styles.badge} ${order?.status_order === "pending"
                                    ? styles["status-choxacnhan"]
                                    : order?.status_order === "preparing"
                                        ? styles["status-dangsoan"]
                                        : order?.status_order === "awaiting_shipment"
                                            ? styles["status-chogui"]
                                            : order?.status_order === "shipping"
                                                ? styles["status-danggiao"]
                                                : order?.status_order === "delivered"
                                                    ? styles["status-dagiao"]
                                                    : order?.status_order === "cancelled"
                                                        ? styles["status-dahuy"]
                                                        : order?.status_order === "refund"
                                                            ? styles["status-trahang"]
                                                            : ""
                                    }`}
                            >
                                {getStatusLabel(order?.status_order || "")}
                            </span>

                        </p>

                        <p className={styles.orderDate}>
                            Ngày đặt: {order?.createdAt ? dayjs(order.createdAt).format("DD/MM/YYYY HH:mm") : "..."}
                        </p>

                    </div>


                    <div className={styles.orderDetailGrid}>
                        <div className={styles.productSection}>
                            <table className={styles.orderDetailTable}>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>loại</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderProducts.map((item, index) => {
                                        const product = item.product;
                                        return (
                                            <tr key={index}>
                                                <td className={styles.orderDetailInfo}>
                                                    <img
                                                        src={product.images?.[0] || "/no-image.png"}
                                                        alt={product.name}
                                                        className={styles.userImage}
                                                    />
                                                    <div className={styles.productDetails}>
                                                        <div className={styles.userName}>{product.name}</div>
                                                        <div className={styles.userDesc}>{product.description}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {product.price.toLocaleString("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    })}
                                                </td>
                                                <td>
                                                    {product.variant?.color || "Không rõ"} / {product.size || "Không rõ"}
                                                </td>

                                                <td>{item.quantity}</td>
                                                <td>
                                                    {(product.price * item.quantity).toLocaleString("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className={styles.totalSection}>
                                <p>
                                    Giá trị đơn hàng:{" "}
                                    <span className={styles.totalValue}>
                                        {orderSubtotal.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </p>

                                <p>
                                    Giảm:{" "}
                                    <span className={styles.totalValue}>
                                        {order?.voucher?.discount?.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }) || "0 ₫"}
                                    </span>
                                </p>

                                <p className={styles.totalFinal}>
                                    Tổng tiền thanh toán:{" "}
                                    <span className={styles.totalAmount}>
                                        {order?.total_price?.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }) || "0 ₫"}
                                    </span>
                                </p>

                            </div>
                            {/* Nút chuyển trạng thái đơn hàng */}
                            <div className={styles.actionButtons}>
                                {order?.status_order === "pending" && (
                                    <button
                                        className={styles.statusBtn}
                                        onClick={() => handleUpdateStatus("preparing")}
                                    >
                                        Xác nhận đơn
                                    </button>
                                )}

                                {order?.status_order === "preparing" && (
                                    <button
                                        className={styles.statusBtn}
                                        onClick={() => handleUpdateStatus("awaiting_shipment")}
                                    >
                                        Chờ gửi hàng
                                    </button>
                                )}

                                {order?.status_order === "awaiting_shipment" && (
                                    <button
                                        className={styles.statusBtn}
                                        onClick={() => handleUpdateStatus("shipping")}
                                    >
                                        Đang giao hàng
                                    </button>
                                )}

                                {order?.status_order === "shipping" && (
                                    <button
                                        className={styles.statusBtn}
                                        onClick={() => handleUpdateStatus("delivered")}
                                    >
                                        Đã giao hàng
                                    </button>
                                )}
                            </div>


                            {/* <div className={styles.shipping}>
                                <h3 className={styles.heading}>Theo dõi kiện hàng</h3>
                                <div className={styles.timeline}>
                                    {trackingData.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.step} ${item.status === "Đang giao" ? styles.stepActive : ""}`}
                                        >
                                            <div className={styles.left}>
                                                <span className={styles.time}>{item.time}</span>
                                                <span
                                                    className={`${styles.circle} ${item.active ? styles.active : ""}`}
                                                ></span>
                                                {index !== trackingData.length - 1 && (
                                                    <div className={styles.line}></div>
                                                )}
                                            </div>
                                            <div className={styles.right}>
                                                {item.status && (
                                                    <p
                                                        className={`${styles.status} ${item.status === "Đang giao" ? styles.statusDelivering : ""}`}
                                                    >
                                                        {item.status}
                                                    </p>
                                                )}
                                                <p className={styles.description}>{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                        </div>

                        <div className={styles.gridSection}>
                            <div className={styles.box}>
                                <h3>Chi tiết khách hàng</h3>
                                <div className={styles.userInfo}>
                                    
                                    <div className={styles.productDetails}>
                                        <div className={styles.userName}>{user?.name}</div>
                                        <div className={styles.userDesc}>
                                            <strong>Email:</strong> {user?.email}
                                        </div>

                                    </div>
                                </div>
                                <p className={styles.userMeta}>
                                    <strong>SĐT</strong>: {user?.phone || "Chưa có"}
                                </p>
                                <p className={styles.userMeta}>
                                    <strong>Địa chỉ</strong>:{" "}
                                    {(user?.address?.detail || user?.address?.address)
                                        ? `${user?.address?.detail || ""}, ${user?.address?.address || ""}`
                                        : "Chưa có"}
                                </p>

                            </div>



                            <div className={styles.box}>
                                <h3>Địa chỉ giao hàng</h3>
                                <p>
                                    <strong>Tên người nhận</strong>: {order?.address_id?.name || "Chưa có"}
                                </p>
                                <p>
                                    <strong>SĐT</strong>: {order?.address_id?.phone || "Chưa có"}
                                </p>
                                <p>
                                    <strong>Địa chỉ</strong>: {(order?.address_id?.detail || order?.address_id?.address)
                                        ? `${order?.address_id?.detail || ""}, ${order?.address_id?.address || ""}`
                                        : "Chưa có"}
                                </p>
                                <p>
                                    <strong>Loại địa chỉ</strong>: {order?.address_id?.type || "Không rõ"}
                                </p>
                            </div>


                            {order && (
                                <div className={styles.box}>
                                    <h3>Phương thức thanh toán</h3>

                                    <p>
                                        <strong>Phương thức</strong>:{" "}
                                        {order.payment_method?.toUpperCase() === "COD" ? "Thanh toán khi nhận hàng (COD)" : order.payment_method || "Không rõ"}
                                    </p>

                                    <p>
                                        <strong>Mã giao dịch</strong>:{" "}
                                        {order.transaction_code ? order.transaction_code : "Không có"}
                                    </p>

                                    <p>
                                        <strong>Trạng thái</strong>:{" "}
                                        {{
                                            unpaid: "Chưa thanh toán",
                                            paid: "Đã thanh toán",
                                            failed: "Thanh toán thất bại",
                                            refunded: "Đã hoàn tiền",
                                        }[order.transaction_status as "unpaid" | "paid" | "failed" | "refunded"] || "Không rõ"}
                                    </p>

                                </div>
                            )}



                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}
