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
    { label: "Danh mục", href: "/categories", icon: Layers },
    { label: "Người dùng", href: "/users", icon: Users },
    { label: "Khuyến mãi", href: "/voucher", icon: GraduationCap },
    { label: "Đánh giá", href: "/comments", icon: MessageCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.replace("https://fiyo.click/page/login");
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
