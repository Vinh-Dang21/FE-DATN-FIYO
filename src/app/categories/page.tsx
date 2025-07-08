"use client";
import {
  BarChart as BarChartIcon,
  Search,
  Bell,
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./categories.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
// gọi api ngen
  useEffect(() => {
    fetch("http://localhost:3000/category/")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const parents = data.filter((c) => !c.parentId).map((c) => c.name);
        setParentCategories(parents);
      })
      .catch((err) => console.error("Lỗi khi load danh mục:", err));
  }, []);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.searchProduct}>
          <div className={styles.spaceBetween}>
            <div className={styles.searchAndFillterBar}>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className={styles.searchInput}
              />
              <select className={styles.select}>
                <option>Chọn danh mục cha</option>
                {parentCategories.map((cate, idx) => (
                  <option key={idx}>{cate}</option>
                ))}
              </select>
            </div>
            <button
              className={styles.addButton}
              onClick={() => setShowAdd(true)}
            >
              + Thêm danh mục
            </button>
          </div>
        </div>

        {showAdd && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>Thêm Danh Mục</h2>
            <select className={styles.select}>
              <option value="">Chọn danh mục cha</option>
              {parentCategories.map((cate, idx) => (
                <option key={idx}>{cate}</option>
              ))}
            </select>
            <input
              className={styles.input}
              type="text"
              placeholder="Tên danh mục mới"
            />
            <textarea
              className={styles.input}
              placeholder="Mô tả danh mục"
              rows={3}
            />
            <button className={styles.addButton}>Thêm danh mục</button>
            <button
              className={styles.closeBtn}
              onClick={() => setShowAdd(false)}
              style={{ marginTop: 10 }}
            >
              Đóng
            </button>
          </div>
        )}

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Danh Sách Danh Mục</h2>
          <table className={styles.cateTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Tên danh mục cha</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cate, index) => (
                <tr key={cate._id || index}>
                  <td>{cate._id}</td>
                  <td>{cate.name}</td>
                  <td>{cate.desc || "..."}</td>
                  <td>
                    {cate.parentId
                      ? categories.find((c) => c._id === cate.parentId)?.name ||
                        "Không rõ"
                      : "Không có"}
                  </td>
                  <td>
                    <button className={styles.actionBtn} title="Sửa">
                      <Pencil size={18} />
                    </button>
                    <button className={styles.actionBtn} title="Xóa">
                      <Trash2 size={18} />
                    </button>
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
