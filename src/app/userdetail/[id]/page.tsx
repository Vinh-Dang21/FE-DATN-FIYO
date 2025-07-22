"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import styles from "../userdetail.module.css";
import dayjs from 'dayjs';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  code?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}
interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function UserDetailPage() {
  const { id } = useParams(); // Lấy userId từ URL
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);


  // Lấy user theo ID
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3000/user/${id}`);
        const data = await res.json();
        if (data.status) setUser(data.result);
      } catch (err) {
        console.error("Lỗi fetch user detail:", err);
      }
    };

    fetchUser();
  }, [id]);

  // Lấy địa chỉ theo user_id
  useEffect(() => {
    if (!id) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`http://localhost:3000/address?user_id=${id}`);
        const data = await res.json();
        if (data.status) setAddresses(data.result);
      } catch (err) {
        console.error("Lỗi fetch địa chỉ:", err);
      }
    };

    fetchAddresses();
  }, [id]);

  if (!user) return <p>Đang tải dữ liệu người dùng...</p>;

  const getInitial = (name: string | undefined): string => {
    return name?.trim()?.split(" ").pop()?.charAt(0).toUpperCase() || "?";
  };



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
            <p className={styles.createdAt}>
              Ngày tạo: {dayjs(user.createdAt).format("DD-MM-YYYY HH:mm")}
            </p>
          </div>

          <div className={styles.leftPanel}>
            {/* Avatar bằng chữ cái đầu */}
            <div className={styles.avatarCircle}>
              {getInitial(user.name)}
            </div>

            <h3 className={styles.name}>{user.name}</h3>
            <p className={styles.userId}>Mã khách hàng: {user.code}</p>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{user.totalOrders.toLocaleString() || "0"}</span>
                  <span className={styles.statLabel}>Đơn hàng</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {user.totalSpent?.toLocaleString() || "0"}
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
              <p><strong>Số điện thoại:</strong> {user.phone}</p>
              <p><strong>Giới tính:</strong> {user.gender}</p>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.addressList}>
              <div className={styles.addressTitle}>Địa chỉ</div>
              {addresses.length > 0 ? addresses.map((item) => (
                <div className={styles.addressItem} key={item._id}>
                  <div className={styles.addressItemRow}>
                    <div>
                      <p className={styles.addressInfo}>
                        <span>
                          <strong className={styles.addressName}>{item.name}</strong>
                          <span className={styles.addressPhone}> | {item.phone}</span>
                        </span>
                        <br />
                        <span className={styles.addressText}>{item.address}</span>
                      </p>
                      {item.isDefault && (
                        <div className={styles.defaultBadge}>Mặc định</div>
                      )}

                    </div>
                  </div>
                </div>
              )) : <p>Chưa có địa chỉ nào</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
