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
    Shirt,
    LayoutDashboard,
    ClipboardList,
    Wallet2
} from "lucide-react";
import styles from "./userdetail.module.css";
import { useState } from "react";
// Dữ liệu user
const userData = {
    id: "#US002",
    name: "Trần Thị Mai",
    email: "maitran@gmail.com",
    phone: "0938123456",
    gender: "Nữ",
    avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    createdAt: "21/05/2024",
    orders: 8,
    totalSpent: 5870000,
    addresses: [
        {
            id: 1,
            name: "Trần Thị Mai",
            phone: "0938123456",
            address: "123/4 Nguyễn Văn Đậu, Phường 5, Bình Thạnh, TP HCM",
            isDefault: true, // Nhà riêng 1 (mặc định)
        },
        {
            id: 2,
            name: "Trần Thị Mai",
            phone: "0938123456",
            address: "56/8 Lê Quang Định, Phường 14, Bình Thạnh, TP HCM",
            isDefault: false, // Nhà riêng 2
        },
        {
            id: 3,
            name: "Trần Thị Mai",
            phone: "0938123456",
            address: "Tầng 8, Tòa nhà ABC, 12 Nguyễn Huệ, Quận 1, TP HCM",
            isDefault: false, // Công ty
        },
    ],
};

export default function Order() {
    const [showAdd, setShowAdd] = useState(false);

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
                            <Columns3 className={styles.icon} />
                            <span className={styles.title}>Danh mục</span>
                        </a>
                    </li>
                    <li className={styles.activeItem}>
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
                    <div className={styles.orderInfoLeft}>
                        <h2 className={styles.usertitle}>Mã người dùng: {userData.id}</h2>
                        <p className={styles.createdAt}>Ngày tạo: {userData.createdAt}</p>
                    </div>

                    <div className={styles.leftPanel}>
                        <img src={userData.avatar} alt="avatar" className={styles.userAvatar} />
                        <h3 className={styles.name}>{userData.name}</h3>
                        <p className={styles.userId}>MÃ khách hàng: {userData.id}</p>

                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>{userData.orders}</span>
                                    <span className={styles.statLabel}>Đơn hàng</span>
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>{userData.totalSpent.toLocaleString()}</span>
                                    <span className={styles.statLabel}>Đã chi</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.customerInfo}>
                            <div className={styles.customerInfoTitle}>Thông tin khách hàng</div>
                            <hr className={styles.customerInfoDivider} />
                            <p><strong>Tên đăng nhập:</strong> {userData.name}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Số điện thoại:</strong> {userData.phone}</p>
                            <p><strong>Giới tính:</strong> {userData.gender}</p>
                        </div>
                    </div>
                    {/* Địa chỉ giao hàng */}
                    <div className={styles.rightPanel}>
                        <div className={styles.addressList}>
                            <div className={styles.addressTitle}>Địa chỉ</div>
                            {userData.addresses.map((item) => (
                                <div className={styles.addressItem} key={item.id}>
                                    <div className={styles.addressItemRow}>
                                        <div>
                                            <p className={styles.addressInfo}>
                                                <span>
                                                    <strong className={styles.addressName}>{item.name}</strong>
                                                    <span className={styles.addressPhone}> | {item.phone}</span>
                                                </span>
                                                <br />
                                                <span className={styles.addressText}>{item.address}</span>
                                            </p>
                                            {item.isDefault && (
                                                <div className={styles.defaultBadge}>Mặc định</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </section>
        </main>
    );
}
