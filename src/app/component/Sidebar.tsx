"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    GraduationCap,
    MessageCircle,
    Layers,
    LogOut,
    Shirt,
    Box,
} from "lucide-react";
import styles from "../dashboard/dashboard.module.css";



const menuItems = [
    { label: "Tổng quan", href: "dashboard", icon: LayoutDashboard },
    { label: "Đơn hàng", href: "order", icon: ShoppingCart },
    { label: "Sản phẩm", href: "products", icon: Shirt },
    { label: "Danh mục", href: "categories", icon: Layers },
    { label: "Người dùng", href: "users", icon: Users },
    { label: "Khuyến mãi", href: "voucher", icon: GraduationCap },
    { label: "Đánh giá", href: "comments", icon: MessageCircle },
    { label: "Tồn kho", href: "inventory", icon: Box },
    { label: "Đăng xuất", href: "logout", icon: LogOut },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.aside}>
            <div className={styles.logo}>FIYO</div>
            <ul className={styles.menuList}>
                {menuItems.map(({ label, href, icon: Icon }) => {
                    // Tự động nối base path
                    const fullHref = `${href}`;
                    return (
                        <li
                            key={href}
                            className={
                                pathname === fullHref ||
                                pathname.startsWith(fullHref)
                                    ? styles.activeItem
                                    : ""
                            }
                        >
                            <Link href={fullHref} className={styles.menuItem}>
                                <Icon className={styles.icon} />
                                <span className={styles.title}>{label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
