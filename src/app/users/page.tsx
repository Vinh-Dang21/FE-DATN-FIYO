"use client";
import {
  Eye,
  Search,
} from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả vai trò");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/user/");
      const data = await res.json();
      if (data.status) setUsers(data.result);
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === "Tất cả vai trò" ||
      (roleFilter === "Admin" && user.role === 0) ||
      (roleFilter === "User" && user.role === 1);
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
              <option>Tất cả vai trò</option>
              <option>Admin</option>
              <option>User</option>
            </select>
          </div>
        </div>

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Users</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <Link href={`/userdetail/${user._id}`}>{user._id}</Link>
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
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
