"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../component/Sidebar";
import Topbar from "../../component/Topbar";
import styles from "../userdetail.module.css";
import dayjs from "dayjs";

interface Address {
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

interface User {
  name: string;
  email: string;
  phone: string;
  gender: string;
  createdAt: string;
  rank: string;
  point: number;
  totalOrders: number;
  totalSpent: number;
}

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
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!/^[a-f\d]{24}$/i.test(String(id))) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, addressRes] = await Promise.all([
          fetch(`/user/${id}`),
          fetch(`/address?user_id=${id}`),
        ]);

        if (!userRes.ok || !addressRes.ok) {
          throw new Error("Lỗi khi fetch dữ liệu");
        }

        const userData = await userRes.json();
        const addressData = await addressRes.json();

        setUser(userData);
        setAddresses(addressData);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? "U";

  const defaultAddress = addresses.find(addr => addr.is_default);
  const genderVN = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  }[user?.gender ?? ""] || "Không xác định";

  if (loading) return <p>Đang tải dữ liệu người dùng...</p>;
  if (!user) return <p>Không tìm thấy người dùng.</p>;

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Topbar />
        <h1 className={styles.title}>Chi tiết người dùng</h1>

        <div className={styles.profile}>
          <div className={styles.avatarCircle}>
            {getInitial(user.name)}
          </div>
          <div>
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email ?? "Chưa có"}</p>
            <p><strong>SĐT:</strong> {user.phone ?? "Chưa có"}</p>
            <p><strong>Giới tính:</strong> {genderVN}</p>
            <p><strong>Ngày tham gia:</strong> {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")}</p>
            <p><strong>Hạng:</strong> {user.rank}</p>
            <p><strong>Điểm tích lũy:</strong> {user.point?.toLocaleString() || 0}</p>
            <p><strong>Tổng đơn hàng:</strong> {user.totalOrders?.toLocaleString() || 0}</p>
            <p><strong>Tổng tiền đã chi:</strong> {user.totalSpent?.toLocaleString()}₫</p>
          </div>
        </div>

        <h2 className={styles.subtitle}>Địa chỉ mặc định</h2>
        {defaultAddress ? (
          <div className={styles.addressCard}>
            <p><strong>Người nhận:</strong> {defaultAddress.name}</p>
            <p><strong>SĐT:</strong> {defaultAddress.phone}</p>
            <p><strong>Địa chỉ:</strong> {defaultAddress.address}</p>
          </div>
        ) : (
          <p>Người dùng chưa có địa chỉ mặc định.</p>
        )}
      </div>
    </div>
  );
}
