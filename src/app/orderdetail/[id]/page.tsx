"use client";
import {
    Search,
    Bell,
} from "lucide-react";
import styles from "./orderdetail.module.css";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
const orderDetailData = {
    orderId: "#DH20250613",
    orderDate: "13/06/2025",
    status: "Đã giao",
    customer: {
        name: "Trần Minh Hòa",
        id: "#C1024",
        email: "minhhoa.tran@gmail.com",
        phone: "0987654321",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    shipping: {
        receiver: "Trần Minh Hòa",
        address: "Số 12, Nguyễn Thái Học, Ba Đình, Hà Nội",
        note: "Giao sau 17h, gọi trước khi đến"
    },
    payment: {
        method: "Momo",
        transactionId: "2506130000456789"
    },
    products: [
        {
            name: "Áo sơ mi nam trắng",
            desc: "Chất liệu cotton thoáng mát, size M",
            image: "https://1557691689.e.cdneverest.net/fast/180x0/filters:format(webp)/static.5sfashion.vn/storage/product/0wyTFhVjgZqOy8DDcmRYqbc4gmMzy4jW.webp",
            price: 320000,
            quantity: 2,
            total: 640000
        },
        {
            name: "Quần jeans xanh",
            desc: "Slim fit, size 30",
            image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/XjuznF9TOo2H6wf2rRPjuxSjRPhrQmjh.webp",
            price: 450000,
            quantity: 1,
            total: 450000
        },
        {
            name: "Áo thun basic",
            desc: "Chất liệu co giãn, size L",
            image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/8wo2oe2X0LomZg4RUd9KUUtXQUGlq3lV.jpg",
            price: 210000,
            quantity: 2,
            total: 420000
        }
    ],
    total: {
        value: 1510000,
        discount: 110000,
        final: 1400000
    }
};
const trackingData = [
    {
        time: "08:12 13/06",
        status: "Đặt hàng",
        description: "Khách hàng đã đặt đơn hàng thành công trên website.",
        active: true,
    },
    {
        time: "08:25 13/06",
        status: "Xác nhận",
        description: "Nhân viên đã xác nhận đơn hàng và chuẩn bị đóng gói.",
        active: true,
    },
    {
        time: "08:50 13/06",
        status: "Đã bàn giao cho đơn vị vận chuyển",
        description: (
            <>
                Đơn hàng đã được bàn giao cho <strong style={{color: "#22c55e"}}>Giao Hàng Nhanh</strong>.<br />
                <span style={{ color: "#22c55e", fontWeight: 600 }}>Shipper: Nguyễn Văn B (SDT: 0901234567)</span>
            </>
        ),
        active: true,
    },
    {
        time: "09:30 13/06",
        status: "Đang lấy hàng",
        description: "Shipper đang đến kho để nhận hàng.",
        active: true,
    },
    {
        time: "10:10 13/06",
        status: "Đang giao",
        description: (
            <>
                Đơn hàng đang được vận chuyển đến địa chỉ nhận: <br />
                <span style={{ color: "#0ea5e9", fontWeight: 600 }}>Số 12, Nguyễn Thái Học, Ba Đình, Hà Nội</span>
            </>
        ),
        active: true,
    },
    {
        time: "12:30 13/06",
        status: "Đang giao",
        description: "Shipper đang giao hàng, vui lòng giữ điện thoại để liên hệ nhận hàng.",
        active: true,
    },
    {
        time: "15:42 13/06",
        status: "Đã giao",
        description: "Shipper đã giao hàng cho khách tại địa chỉ nhận.",
        active: true,
    },
    {
        time: "15:45 13/06",
        status: "Đã giao thành công",
        description: "Khách hàng đã nhận hàng và thanh toán tiền mặt.",
        active: true,
    },
];

export default function Order() {
    // Lấy dữ liệu đơn hàng từ orderDetailData
    const {
        orderId,
        orderDate,
        status,
        customer,
        shipping,
        payment,
        products,
        total,
    } = orderDetailData;

    return (
        <main className={styles.main}>
            <Sidebar />

            <section className={styles.content}>
                <Topbar />
                <div className={styles.orderSummary}>
                    <div className={styles.orderInfoLeft}>
                        <h2 className={styles.orderTitle}>
                            Mã hóa đơn: {orderId}
                        </h2>
                        <p className={styles.statusLine}>
                            Trạng thái:
                            <span className={styles.badge}>{status}</span>
                        </p>
                        <p className={styles.orderDate}>
                            Ngày đặt: {orderDate}
                        </p>
                    </div>

                    <div className={styles.orderDetailGrid}>
                        <div className={styles.productSection}>
                            <table className={styles.orderDetailTable}>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, i) => (
                                        <tr key={i}>
                                            <td className={styles.orderDetailInfo}>
                                                <img
                                                    src={product.image}
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
                                </tbody>
                            </table>

                            <div className={styles.totalSection}>
                                <p>
                                    Giá trị đơn hàng:{" "}
                                    <span className={styles.totalValue}>
                                        {total.value.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </p>
                                <p>
                                    Giảm:{" "}
                                    <span className={styles.totalValue}>
                                        {total.discount.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </p>
                                <p className={styles.totalFinal}>
                                    Tổng tiền thanh toán:{" "}
                                    <span className={styles.totalAmount}>
                                        {total.final.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </p>
                            </div>
                            <div className={styles.shipping}>
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
                            </div>
                        </div>

                        <div className={styles.gridSection}>
                            <div className={styles.box}>
                                <h3>Chi tiết khách hàng</h3>
                                <div className={styles.userInfo}>
                                    <img
                                        src={customer.avatar}
                                        alt="Hình SP"
                                        className={styles.userImage}
                                    />
                                    <div className={styles.productDetails}>
                                        <div className={styles.userName}>
                                            {customer.name}
                                        </div>
                                        <div className={styles.userDesc}>
                                            ID người dùng:{" "}
                                            <strong>{customer.id}</strong>
                                        </div>
                                    </div>
                                </div>
                                <p className={styles.userMeta}>
                                    <strong>Email</strong>: {customer.email}
                                </p>
                                <p className={styles.userMeta}>
                                    <strong>SDT</strong>: {customer.phone}
                                </p>
                            </div>

                            <div className={styles.box}>
                                <h3>Địa chỉ giao hàng</h3>
                                <p>
                                    <strong>Tên người nhận</strong>:{" "}
                                    {shipping.receiver}
                                </p>
                                <p>
                                    <strong>Địa chỉ</strong>: {shipping.address}
                                </p>
                                <p>
                                    <strong>Ghi chú</strong>: {shipping.note}
                                </p>
                            </div>

                            <div className={styles.box}>
                                <h3>Phương thức thanh toán</h3>
                                <p>
                                    <strong>Phương thức</strong>: {payment.method}
                                </p>
                                <p>
                                    <strong>Mã giao dịch</strong>:{" "}
                                    {payment.transactionId}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </section>
        </main>
    );
}
