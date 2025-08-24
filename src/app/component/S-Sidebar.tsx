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
  Box,
  Package,
  ArrowDown,
  Settings,
  UserCheck,            // 👈 THÊM ICON
} from "lucide-react";
import styles from "../dashboard/dashboard.module.css";

const menuItems = [
  { label: "Tổng quan", href: "/shop/dashboard", icon: LayoutDashboard },
  { label: "Đơn hàng", href: "/shop/order", icon: ShoppingCart },
  { label: "Sản phẩm", href: "/shop/products", icon: Shirt },
  { label: "Đánh giá", href: "/shop/comments", icon: MessageCircle },
  { label: "Tồn kho", href: "/shop/inventory", icon: Box },
  { label: "Nhập hàng", href: "/shop/stockentry", icon: ArrowDown },
  { label: "Tin nhắn", href: "/shop/messages", icon: MessageCircle },
  { label: "Người theo dõi", href: "/shop/followers", icon: UserCheck }, // 👈 MỤC MỚI
  { label: "Cài đặt", href: "/shop/settings", icon: Settings },
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
