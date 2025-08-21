
"use client";
import { useEffect, useState } from "react";
import styles from "./orderdetail.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { useCallback } from "react";

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

interface OrderShop {
    _id: string;
    shop_id: string;
    order_id: string;
    status: string;
    total_price: number;
    createdAt: string;
    status_history: {
        status: string;
        updatedAt: string;
        note?: string;
        _id: string;
    }[];
}

interface OrderParent {
    _id: string;
    payment_method: string;
    status_order: string;
    transaction_status: string | null;
    transaction_code: string | null;
    total_price: number;
    createdAt: string;
    status_history: {
        status: string;
        updatedAt: string;
        note?: string;
        _id: string;
    }[];
    address_id?: string;
}

interface OrderItem {
    order_id: string;
    order_shop_id: string;
    createdAt: string;
    quantity: number;
    product: Product & {
        variant?: Variant | null;
        size?: { size: string; quantity: number; sku?: string } | null;
    };
}

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: ShippingAddress;
}

type ShippingAddress = {
    _id?: string; name?: string; phone?: string;
    address?: string; detail?: string; type?: string;
} | null;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";




export default function Order() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const orderShopId = params.id;
    console.log("Order Shop ID:", orderShopId);
    const [order, setOrder] = useState<any>(null);           // đơn cha (order_parent)
    const [orderProducts, setOrderProducts] = useState<any[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [orderShop, setOrderShop] = useState<OrderShop | null>(null);
    const [orderParent, setOrderParent] = useState<OrderParent | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(null);
    const [user, setUser] = useState<UserInfo | null>(null);


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

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (!orderShopId) return;

    //         try {
    //             const [orderDetailRes, orderInfoRes] = await Promise.all([
    //                 fetch(`${API_BASE}/orderDetail/order-shops/${orderShopId}/details`),
    //                 fetch(`${API_BASE}/orderShop/${orderShopId}`)
    //             ]);

    //             const orderDetailData = await orderDetailRes.json();
    //             const orderInfoData = await orderInfoRes.json();

    //             console.log("📦 orderDetailData:", orderDetailData);
    //             console.log("🧾 orderInfoData:", orderInfoData);

    //             if (orderDetailData.status) {
    //                 setOrderProducts(orderDetailData.result);  // lấy danh sách sản phẩm
    //                 setUser(orderDetailData.user);              // lấy user nếu cần
    //             }

    //             if (orderInfoData.status) {
    //                 setOrder(orderInfoData.order); // ✅ Lấy đúng `order`, KHÔNG dùng `.result`
    //             }

    //         } catch (error) {
    //             console.error("Lỗi khi fetch order:", error);
    //         }
    //     };

    //     fetchData();
    // }, [orderShopId]);

    useEffect(() => {
        if (!orderShopId) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/orderDetail/order-shops/${orderShopId}/details`);
                const data = await res.json();
                if (!res.ok || !data.status) throw new Error(data?.message || `HTTP ${res.status}`);

                setOrderShop(data.order_shop);
                setOrder(data.order_parent);
                setUser(data.user || null);
                setOrderProducts(Array.isArray(data.items) ? data.items : []);
                setShippingAddress(data.shipping_address || null);
            } catch (e) {
                console.error("Fetch order detail error:", e);
            }
        })();
    }, [orderShopId]);

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

    const reload = useCallback(async () => {
        if (!orderShopId) return;
        const res = await fetch(`${API_BASE}/orderDetail/order-shops/${orderShopId}/details`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.status) throw new Error(data?.message || `HTTP ${res.status}`);

        setOrderShop(data.order_shop);
        setOrder(data.order_parent);
        setUser(data.user || null);
        setOrderProducts(Array.isArray(data.items) ? data.items : []);
        setShippingAddress(data.shipping_address || data.user?.address || null);
    }, [orderShopId]);

    useEffect(() => { reload().catch(console.error); }, [reload]);

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`${API_BASE}/orderShop/${orderShopId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();

            if (res.ok && data.status) {
                alert("Cập nhật trạng thái thành công!");
                setOrderShop((prev: OrderShop | null) =>
                    prev ? { ...prev, status: newStatus } : prev
                );
            } else {
                alert(data.message || "Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert("Lỗi kết nối máy chủ");
        }
    };

    const code = orderShop?._id || order?._id || orderProducts?.[0]?.order_id || "Đang tải...";
    const statusValue = (orderShop?.status || order?.status_order || "") as string;
    const createdAt = order?.createdAt || orderShop?.createdAt || null;


    // Ưu tiên order (order_parent), fallback sang orderShop.order_id nếu bạn có gọi /orderShop/:id
    const payment = order ?? orderShop?.order_id ?? null;

    const paymentMethodLabel = payment?.payment_method
        ? (payment.payment_method.toLowerCase() === "cod"
            ? "Thanh toán khi nhận hàng (COD)"
            : payment.payment_method.toUpperCase() === "VNPAY"
                ? "VNPay"
                : payment.payment_method)
        : "Không rõ";

    const txStatusLabel =
        ({
            unpaid: "Chưa thanh toán",
            paid: "Đã thanh toán",
            failed: "Thanh toán thất bại",
            refunded: "Đã hoàn tiền",
        } as const)[(payment?.transaction_status || "") as "unpaid" | "paid" | "failed" | "refunded"] || "Không rõ";

    const shopTotal = Number(orderShop?.total_price ?? 0);              // tổng tiền của đơn con (đúng API)
    const grossTotal = Array.isArray(orderProducts)                     // giá trị trước giảm (từ items)
        ? orderProducts.reduce(
            (sum: number, it: any) => sum + ((it?.product?.price || 0) * (it?.quantity || 0)),
            0
        )
        : 0;
    const discountTotal = Math.max(0, grossTotal - shopTotal);          // phần chênh lệch coi như giảm giá


    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />
                <div className={styles.orderSummary}>
                    <div className={styles.orderInfoLeft}>
                        <h2 className={styles.orderTitle}>Mã hóa đơn: {code}</h2>

                        <p className={styles.statusLine}>
                            Trạng thái:
                            <span
                                className={`${styles.badge} ${statusValue === "pending" ? styles["status-choxacnhan"] :
                                    statusValue === "preparing" ? styles["status-dangsoan"] :
                                        statusValue === "awaiting_shipment" ? styles["status-chogui"] :
                                            statusValue === "shipping" ? styles["status-danggiao"] :
                                                statusValue === "delivered" ? styles["status-dagiao"] :
                                                    statusValue === "cancelled" ? styles["status-dahuy"] :
                                                        statusValue === "refund" ? styles["status-trahang"] : ""
                                    }`}
                            >
                                {getStatusLabel(statusValue)}
                            </span>
                        </p>

                        <p className={styles.orderDate}>
                            Ngày đặt: {createdAt ? dayjs(createdAt).format("DD/MM/YYYY HH:mm") : "..."}
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
                                                    {item.variant?.color || "Không rõ"} / {item.variant?.size?.size || "Không rõ"}
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
                                        {grossTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </span>
                                </p>

                                <p>
                                    Giảm:{" "}
                                    <span className={styles.totalValue}>
                                        {discountTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </span>
                                </p>

                                <p className={styles.totalFinal}>
                                    Tổng tiền thanh toán:{" "}
                                    <span className={styles.totalAmount}>
                                        {shopTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                    </span>
                                </p>
                            </div>

                            {/* Nút chuyển trạng thái đơn hàng */}
                            <div className={styles.actionButtons}>
                                {statusValue === "pending" && (
                                    <button className={styles.statusBtn} disabled={isUpdating}
                                        onClick={() => handleUpdateStatus("preparing")}>
                                        {isUpdating ? "Đang cập nhật..." : "Xác nhận đơn"}
                                    </button>
                                )}

                                {statusValue === "preparing" && (
                                    <button className={styles.statusBtn} disabled={isUpdating}
                                        onClick={() => handleUpdateStatus("awaiting_shipment")}>
                                        {isUpdating ? "Đang cập nhật..." : "Chờ gửi hàng"}
                                    </button>
                                )}

                                {statusValue === "awaiting_shipment" && (
                                    <button className={styles.statusBtn} disabled={isUpdating}
                                        onClick={() => handleUpdateStatus("shipping")}>
                                        {isUpdating ? "Đang cập nhật..." : "Đang giao hàng"}
                                    </button>
                                )}

                                {statusValue === "shipping" && (
                                    <button className={styles.statusBtn} disabled={isUpdating}
                                        onClick={() => handleUpdateStatus("delivered")}>
                                        {isUpdating ? "Đang cập nhật..." : "Đã giao hàng"}
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
                                <p><strong>Tên người nhận</strong>: {shippingAddress?.name || "Chưa có"}</p>
                                <p><strong>SĐT</strong>: {shippingAddress?.phone || "Chưa có"}</p>
                                <p>
                                    <strong>Địa chỉ</strong>:
                                    {(shippingAddress?.detail || shippingAddress?.address)
                                        ? `${shippingAddress?.detail || ""}, ${shippingAddress?.address || ""}`
                                        : "Chưa có"}
                                </p>
                                <p><strong>Loại địa chỉ</strong>: {shippingAddress?.type || "Không rõ"}</p>
                            </div>




                            {payment && (
                                <div className={styles.box}>
                                    <h3>Phương thức thanh toán</h3>

                                    <p>
                                        <strong>Phương thức</strong>: {paymentMethodLabel}
                                    </p>

                                    <p>
                                        <strong>Mã giao dịch</strong>: {payment?.transaction_code || "Không có"}
                                    </p>

                                    <p>
                                        <strong>Trạng thái</strong>: {txStatusLabel}
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
