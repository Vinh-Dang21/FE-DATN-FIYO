"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import styles from "../userdetail.module.css";
import { useRouter } from "next/navigation";

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
  addresses?: Address[];
  defaultAddress?: Address | null;
}

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 0) {
        router.push("/warning-login");
        return;
      }
    } catch (err) {
      router.push("/warning-login");
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://fiyo-be.onrender.com/api/user/${id}`);
        const json = await res.json();

        if (json.status && json.data) {
          setUser(json.data);
          setAddresses(json.data.addresses || []);
        } else {
          console.error("Lỗi lấy user:", json.message);
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
              Mã người dùng: {user._id ? `#${user._id}` : ""}
            </h2>
            <p className={styles.createdAt}>
              Ngày tạo: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Không xác định"}
            </p>



          </div>

          <div className={styles.leftPanel}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className={styles.userAvatar}
              />
            ) : (
              <div className={styles.userAvatarFallback}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className={styles.name}>{user.name}</h3>

            Mã khách hàng: {user._id ? `US${user._id.slice(-4).toUpperCase()}` : ""}

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
                        {(item.is_default || index === 0) && (
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
