"use client";
import {
  Eye,
  Store,
  CheckCircle,
  Lock,
  Clock,
} from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Address {
  _id: string;
  user_id: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  is_default: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: number;
  authType: "local" | "google" | "facebook";
  gender: "male" | "female" | "other";
  point: number;
  rank: "bronze" | "silver" | "gold" | "platinum";
  createdAt?: string;
  updatedAt?: string;
  addresses?: Address[];
}

export default function ShopPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://fiyo.click/api/user/");
        const data = await res.json();
        if (data.status) setUsers(data.result);
      } catch (error) {
        console.error("Lỗi fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.role === 0) ||
      (roleFilter === "user" && user.role === 1);

    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    return matchesRole && matchesSearch;
  });

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.shopSummary}>
          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>11</div>
              <div className={styles.shopLabel}>Tổng số shop</div>
            </div>
            <div className={styles.shopIcon}>
              <Store />
            </div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>7</div>
              <div className={styles.shopLabel}>Đang hoạt động</div>
            </div>
            <div className={styles.shopIcon}>
              <CheckCircle />
            </div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>1</div>
              <div className={styles.shopLabel}>Bị khóa</div>
            </div>
            <div className={styles.shopIcon}>
              <Lock />
            </div>
          </div>

          <div className={styles.shopItem}>
            <div className={styles.shopInfo}>
              <div className={styles.shopNumber}>3</div>
              <div className={styles.shopLabel}>Chờ duyệt</div>
            </div>
            <div className={styles.shopIcon}>
              <Clock />
            </div>
          </div>
        </div>


        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm ..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.select}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="admin">Đang hoạt động</option>
              <option value="user">Đang bị khóa</option>
            </select>
          </div>
        </div>

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Danh sách cửa hàng</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Cửa hàng</th>
                <th>Chủ cửa hàng</th>
                <th>Trạng thái</th>
                <th>Xác nhận</th>
                <th>Sản phẩm</th>
                <th>Đơn hàng</th>
                <th>Doanh thu</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "Chưa có"}</td>
                  <td>
                    <span>{user.role === 0 ? "Admin" : "User"}</span>
                  </td>
                  <td>
                    <Link href={`/userdetail/${user._id}`}>
                      <button className={styles.actionBtn} title="Xem">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </td>
                  <td>
                    <span>{user.role === 0 ? "Admin" : "User"}</span>
                  </td>
                  <td>
                    <Link href={`/userdetail/${user._id}`}>
                      <button className={styles.actionBtn} title="Xem">
                        <Eye size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
