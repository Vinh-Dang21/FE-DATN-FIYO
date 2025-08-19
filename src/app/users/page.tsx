"use client";
import {
  Eye,
} from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useEffect, useState } from "react";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Users</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
