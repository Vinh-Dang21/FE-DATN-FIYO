"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import styles from "../userdetail.module.css";

interface User {
  _id: string;
  code?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  gender?: string;
  createdAt?: string;
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, addressRes] = await Promise.all([
          fetch(`http://localhost:3000/user/${id}`),
          fetch(`http://localhost:3000/address/user/${id}`),
        ]);

        const userData = await userRes.json();
        const addressData = await addressRes.json();

        if (userData.status && userData.data) {
          setUser(userData.data);
        } else {
          console.error("Lỗi lấy user:", userData.message);
        }

        if (addressData.status && Array.isArray(addressData.data)) {
          setAddresses(addressData.data);
        } else {
          console.error("Lỗi lấy địa chỉ:", addressData.message);
          setAddresses([]);
        }
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!user) return <p>Đang tải dữ liệu...</p>;

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.orderSummary}>
          <div className={styles.orderInfoLeft}>
            <h2 className={styles.usertitle}>
              Mã người dùng: {user.code || `#${user._id.slice(-4).toUpperCase()}`}
            </h2>
            <p className={styles.createdAt}>Ngày tạo: {user.createdAt}</p>
          </div>

          <div className={styles.leftPanel}>
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
              className={styles.userAvatar}
            />
            <h3 className={styles.name}>{user.name}</h3>
            <p className={styles.userId}>MÃ khách hàng: {user.code}</p>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{user.totalOrders || 0}</span>
                  <span className={styles.statLabel}>Đơn hàng</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {(user.totalSpent || 0).toLocaleString()}
                  </span>
                  <span className={styles.statLabel}>Đã chi</span>
                </div>
              </div>
            </div>

            <div className={styles.customerInfo}>
              <div className={styles.customerInfoTitle}>Thông tin khách hàng</div>
              <hr className={styles.customerInfoDivider} />
              <p><strong>Tên đăng nhập:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Số điện thoại:</strong> {user.phone || "Chưa có"}</p>
              <p><strong>Giới tính:</strong> {user.gender || "Chưa xác định"}</p>
              <p><strong>Vai trò:</strong> {user.role || "user"}</p>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.addressList}>
              <div className={styles.addressTitle}>Địa chỉ</div>
              {addresses.length > 0 ? (
                addresses.map((item, index) => (
                  <div className={styles.addressItem} key={item._id}>
                    <div className={styles.addressItemRow}>
                      <div>
                        <p className={styles.addressInfo}>
                          <strong className={styles.addressName}>{item.name}</strong>
                          <span className={styles.addressPhone}> | {item.phone}</span>
                          <br />
                          <span className={styles.addressText}>{item.address}</span>
                        </p>
                        {item.is_default && (
                          <div className={styles.defaultBadge}>Mặc định</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có địa chỉ nào</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
