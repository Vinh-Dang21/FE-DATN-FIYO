import React, { useState } from "react";
import styles from "../dashboard.module.css";

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ thanh toán", value: "pending" },
  { label: "Vận chuyển", value: "shipping" },
  { label: "Chờ giao hàng", value: "waiting" },
  { label: "Hoàn thành", value: "done" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Trả hàng/Hoàn tiền", value: "refund" },
];

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className={styles.tabWrapper}>
      {tabs.map(({ label, value }) => (
        <div
          key={value}
          className={`${styles.tabItem} ${activeTab === value ? styles.active : ""}`}
          onClick={() => setActiveTab(value)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
