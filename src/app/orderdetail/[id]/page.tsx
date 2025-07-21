
"use client";
import { useEffect, useState } from "react";
import styles from "./orderdetail.module.css";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import { useParams } from "next/navigation";
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

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const res = await fetch(`http://localhost:3000/orders/${orderId}`);
                const data = await res.json();

                if (data.status) {
                    setOrder(data.result);
                } else {
                    console.error("Không tìm thấy đơn hàng");
                }
            } catch (err) {
                console.error("Lỗi gọi API:", err);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (!order) {
        return <div>Đang tải dữ liệu đơn hàng...</div>;
    }

    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />
                <div className={styles.orderSummary}>
                    <div className={styles.orderInfoLeft}>
                        <h2 className={styles.orderTitle}>Mã hóa đơn: {order._id}</h2>

                        <p className={styles.statusLine}>
                            Trạng thái:
                            <span className={styles.badge}>{order.status_order}</span>
                        </p>

                        <p className={styles.orderDate}>
                            Ngày đặt: {order.createdAt}
                        </p>
                    </div>

                    <div className={styles.orderDetailGrid}>
                        <div className={styles.productSection}>
                            <table className={styles.orderDetailTable}>
                                {/* <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products?.map((product: Product, i: number) => (

                                        <tr key={i}>

                                            <td className={styles.orderDetailInfo}>
                                                <img
                                                    src={product.images}
                                                    alt={product.name}
                                                    className={styles.userImage}
                                                />
                                                <div className={styles.productDetails}>
                                                    <div className={styles.userName}>
                                                        {product.name}
                                                    </div>
                                                    <div className={styles.userDesc}>
                                                        {product.desc}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {product.price.toLocaleString("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                })}
                                            </td>
                                            <td>{product.quantity}</td>
                                            <td>
                                                {product.total.toLocaleString("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody> */}
                            </table>

                            <div className={styles.totalSection}>
                                <p>
                                    Giá trị đơn hàng:{" "}
                                    {/* <span className={styles.totalValue}>
                                        {total.value.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span> */}
                                </p>
                                <p>
                                    Giảm:{" "}
                                    {/* <span className={styles.totalValue}>
                                        {total.discount.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span> */}
                                </p>
                                <p className={styles.totalFinal}>
                                    Tổng tiền thanh toán:{" "}
                                    <span className={styles.totalAmount}>
                                        {order.total_price.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </p>

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
                                    <img
                                        src="https://randomuser.me/api/portraits/men/32.jpg" // Avatar mẫu
                                        alt="Avatar"
                                        className={styles.userImage}
                                    />
                                    <div className={styles.productDetails}>
                                        <div className={styles.userName}>
                                            {order.user_id?.name}
                                        </div>
                                        <div className={styles.userDesc}>
                                            ID người dùng:{" "}
                                            <strong>{order.user_id?.id}</strong>
                                        </div>
                                    </div>
                                </div>
                                <p className={styles.userMeta}>
                                    <strong>Email</strong>: {order.user_id?.email}
                                </p>
                                <p className={styles.userMeta}>
                                    <strong>SDT</strong>: {order.user_id?.phone}
                                </p>
                            </div>

                            <div className={styles.box}>
                                <h3>Địa chỉ giao hàng</h3>
                                {/* <p>
                                    <strong>Tên người nhận</strong>:{" "}
                                    {shipping.receiver}
                                </p>
                                <p>
                                    <strong>Địa chỉ</strong>: {shipping.address}
                                </p>
                                <p>
                                    <strong>Ghi chú</strong>: {shipping.note}
                                </p> */}
                            </div>

                            <div className={styles.box}>
                                <h3>Phương thức thanh toán</h3>
                                <p>
                                    <strong>Phương thức</strong>: {order.payment_method}
                                </p>
                                <p>
                                    <strong>Mã giao dịch</strong>: {order.transaction_code}
                                </p>
                                <p>
                                    <strong>Trạng thái</strong>: {order.transaction_status === "unpaid" ? "Chưa thanh toán" : "Đã thanh toán"}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}
