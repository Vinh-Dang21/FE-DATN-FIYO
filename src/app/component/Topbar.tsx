"use client";
import React, { useEffect, useState } from "react";
import { Bell, Search, UserCircle } from "lucide-react";
import styles from "../dashboard/dashboard.module.css";

export default function Topbar() {
  const [user, setUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser({
          id: parsed._id,
          name: parsed.name,
          avatar: parsed.avatar,
        });
      } catch (err) {
        console.error("Lỗi parse user:", err);
      }
    }
  }, []);

  return (
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
        {user ? (
          <div className={styles.avatarWrapper}>
            <img
              src={user.avatar}
              alt={user.name}
              className={styles.avatar}
            />
            <span className={styles.onlineDot}></span>
          </div>
        ) : (
          <div className={styles.avatarWrapper}>
            <UserCircle className={styles.avatar} /> {/* 👈 icon mặc định */}
          </div>
        )}
      </div>
    </div>
  );
}
