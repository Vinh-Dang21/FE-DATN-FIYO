import React, { useState, useEffect } from "react";
import styles from "../dashboard.module.css";

interface TabsProps {
  onFilter?: (status: string) => void;
}

const tabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đang soạn hàng", value: "preparing" },
  { label: "Đang vận chuyển", value: "shipping" },
  { label: "Hoàn thành", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Trả hàng/Hoàn tiền", value: "refund" },
];

export default function Tabs({ onFilter }: TabsProps) {
  const [activeTabs, setActiveTabs] = useState<string[]>(["pending"]);

  const handleTabClick = (value: string) => {
    setActiveTabs([value]); // chỉ giữ đúng 1 tag
  };

  useEffect(() => {
    const filterValue = activeTabs.includes("all") ? "all" : activeTabs.join(",");
    onFilter?.(filterValue);
  }, [activeTabs]);

  return (
    <div className={styles.tabWrapper}>
      {tabs.map(({ label, value }) => (
        <div
          key={value}
          className={`${styles.tabItem} ${activeTabs.includes(value) ? styles.active : ""}`}
          onClick={() => handleTabClick(value)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
