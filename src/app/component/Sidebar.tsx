import React from "react";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    GraduationCap,
    MessageCircle,
    Layers,
    LogOut,
    Shirt,
} from "lucide-react";
import styles from "../dashboard.module.css";
import { usePathname } from "next/navigation";
const menuItems = [
    { label: "Tổng quan", href: "/", icon: LayoutDashboard },
    { label: "Đơn hàng", href: "/order", icon: ShoppingCart },
    { label: "Sản phẩm", href: "/products", icon: Shirt },
    { label: "Danh mục", href: "/categories", icon: Layers },
    { label: "Người dùng", href: "/users", icon: Users },
    { label: "Khuyến mãi", href: "/voucher", icon: GraduationCap },
    { label: "Bình luận", href: "/comments", icon: MessageCircle },
    { label: "Đăng xuất", href: "/logout", icon: LogOut },
];




export default function Sidebar() {
    const pathname = usePathname();
    return (
        <aside className={styles.aside}>
            <div className={styles.logo}>FIYO</div>

            <ul className={styles.menuList}>
                {menuItems.map(({ label, href, icon: Icon }) => (
                    <li
                        key={href}
                        className={
                            (href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(href))
                                ? styles.activeItem
                                : ""
                        }
                    >
                        <a href={href} className={styles.menuItem}>
                            <Icon className={styles.icon} />
                            <span className={styles.title}>{label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

