"use client";
import {
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
  const [newCate, setNewCate] = useState({ name: "", desc: "", parentId: "" });
  const [editCate, setEditCate] = useState(null);

  // Lấy danh mục từ API
  const fetchCategories = () => {
    fetch("http://localhost:3000/category/")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const parents = data.filter((c) => !c.parentId);
        setParentCategories(parents);
      })
      .catch((err) => console.error("Lỗi khi load danh mục:", err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    fetch("http://localhost:3000/category/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCate.name,
        desc: newCate.desc,
        parentId: newCate.parentId || null,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchCategories();
        setShowAdd(false);
        setNewCate({ name: "", desc: "", parentId: "" });
      });
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    fetch(`http://localhost:3000/category/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => fetchCategories());
  };

  const handleUpdateCategory = () => {
    fetch(`http://localhost:3000/category/${editCate._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editCate.name,
        desc: editCate.desc,
        parentId: editCate.parentId || null,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setEditCate(null);
        fetchCategories();
      });
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />
        <div className={styles.spaceBetween}>
          <h2 className={styles.userListTitle}>Danh Sách Danh Mục</h2>
          <button className={styles.addButton} onClick={() => setShowAdd(true)}>
            + Thêm danh mục
          </button>
        </div>

        {/* Form thêm danh mục */}
        {showAdd && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>Thêm Danh Mục</h2>
            <select
              className={styles.select}
              value={newCate.parentId}
              onChange={(e) => setNewCate({ ...newCate, parentId: e.target.value })}>
              <option value="">Chọn danh mục cha</option>
              {parentCategories.map((cate) => (
                <option key={cate._id} value={cate._id}>
                  {cate.name}
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              type="text"
              placeholder="Tên danh mục"
              value={newCate.name}
              onChange={(e) => setNewCate({ ...newCate, name: e.target.value })}
            />
            <textarea
              className={styles.input}
              placeholder="Mô tả danh mục"
              rows={3}
              value={newCate.desc}
              onChange={(e) => setNewCate({ ...newCate, desc: e.target.value })}
            />
            <button className={styles.addButton} onClick={handleAddCategory}>
              Lưu danh mục
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => setShowAdd(false)}
              style={{ marginTop: 10 }}>
              Đóng
            </button>
          </div>
        )}

        {/* Danh sách danh mục */}
        <table className={styles.cateTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Danh mục cha</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cate) => (
              <tr key={cate._id}>
                <td>{cate._id}</td>
                <td>{cate.name}</td>
                <td>{cate.desc || ""}</td>
                <td>
                  {cate.parentId
                    ? categories.find((c) => c._id === cate.parentId)?.name || "Không rõ"
                    : "Không có"}
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    title="Sửa"
                    onClick={() => setEditCate(cate)}>
                    <Pencil size={18} />
                  </button>
                  <button
                    className={styles.actionBtn}
                    title="Xóa"
                    onClick={() => handleDeleteCategory(cate._id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Form sửa danh mục */}
        {editCate && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>Cập nhật Danh Mục</h2>
            <select
              className={styles.select}
              value={editCate.parentId || ""}
              onChange={(e) => setEditCate({ ...editCate, parentId: e.target.value })}>
              <option value="">Chọn danh mục cha</option>
              {parentCategories.map((cate) => (
                <option key={cate._id} value={cate._id}>
                  {cate.name}
                </option>
              ))}
            </select>
            <input
              className={styles.input}
              type="text"
              placeholder="Tên danh mục"
              value={editCate.name}
              onChange={(e) => setEditCate({ ...editCate, name: e.target.value })}
            />
            <textarea
              className={styles.input}
              placeholder="Mô tả danh mục"
              rows={3}
              value={editCate.desc || ""}
              onChange={(e) => setEditCate({ ...editCate, desc: e.target.value })}
            />
            <button className={styles.addButton} onClick={handleUpdateCategory}>
              Cập nhật
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => setEditCate(null)}
              style={{ marginTop: 10 }}>
              Hủy
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
