"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    GraduationCap,
    MessageCircle,
    Layers,
    LogOut,
    Shirt,
    Box, Package, ArrowDown
} from "lucide-react";
import styles from "../dashboard/dashboard.module.css";

const menuItems = [
    { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { label: "Đơn hàng", href: "/order", icon: ShoppingCart },
    { label: "Sản phẩm", href: "/products", icon: Shirt },
    { label: "Danh mục", href: "/categories", icon: Layers },
    { label: "Người dùng", href: "/users", icon: Users },
    { label: "Khuyến mãi", href: "/voucher", icon: GraduationCap },
    { label: "Đánh giá", href: "/comments", icon: MessageCircle },
    { label: "Tồn kho", href: "/inventory", icon: Box },
    { label: "Nhập hàng", href: "/stockentry", icon: ArrowDown  },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await fetch("http://localhost:3000/api/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            // Xóa token và thông tin user ở client
            localStorage.clear();
            sessionStorage.clear();

            // Chuyển sang trang login và chặn quay lại
            router.replace("https://fiyo.click/page/login");
        }
    };

    return (
        <aside className={styles.aside}>
            <div className={styles.logo}>FIYO</div>
            <ul className={styles.menuList}>
                {menuItems.map(({ label, href, icon: Icon }) => (
                    <li
                        key={href}
                        className={
                            pathname === href || pathname.startsWith(href)
                                ? styles.activeItem
                                : ""
                        }
                    >
                        <Link href={href} className={styles.menuItem}>
                            <Icon className={styles.icon} />
                            <span className={styles.title}>{label}</span>
                        </Link>
                    </li>
                ))}

                <li>
                    <button
                        onClick={handleLogout}
                        className={styles.menuItem}
                        style={{
                            background: "none",
                            border: "none",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                        }}
                    >
                        <LogOut className={styles.icon} />
                        <span className={styles.title}>Đăng xuất</span>
                    </button>
                </li>
            </ul>
        </aside>
    );
}
