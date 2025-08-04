"use client";
import { Pencil, Trash2 } from "lucide-react";
import styles from "./categories.module.css";
import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  type?: string;
  images?: string[];
}

interface CategoryForm {
  _id?: string;
  name: string;
  slug: string;
  parentId: string;
  type?: string;
  images?: File[];
}

export default function Categories() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    parentId: "",
    type: "cloth",
    images: [],
  });

  useEffect(() => {
    fetch("http://localhost:3000/category/parents")
      .then((res) => res.json())
      .then((data) => setParentCategories(data))
      .catch((err) => console.error("Lỗi fetch parents:", err));
  }, []);

  useEffect(() => {
    const url = selectedParentId
      ? `http://localhost:3000/category/children/${selectedParentId}`
      : `http://localhost:3000/category/`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Lỗi fetch danh mục:", err));
  }, [selectedParentId]);

  const resetForm = () => {
    setShowAdd(false);
    setShowEdit(false);
    setEditingId(null);
    setFormData({ name: "", slug: "", parentId: "", type: "cloth", images: [] });
  };

  const refreshCategories = async () => {
    const url = selectedParentId
      ? `http://localhost:3000/category/children/${selectedParentId}`
      : `http://localhost:3000/category/`;
    const res = await fetch(url);
    const data = await res.json();
    setCategories(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      images: fileArray,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      alert("Vui lòng nhập tên và slug hợp lệ!");
      return;
    }

    const isDuplicate = categories.some((cate) => {
      const cateName = typeof cate?.name === "string" ? cate.name.trim().toLowerCase() : "";
      const formName = typeof formData?.name === "string" ? formData.name.trim().toLowerCase() : "";
      return (
        cateName === formName &&
        cate._id !== editingId &&
        (cate.parentId || "") === (formData.parentId || "")
      );
    });

    if (isDuplicate) {
      alert("Tên danh mục đã tồn tại trong cùng danh mục cha!");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3000/category/${editingId}`
      : `http://localhost:3000/category/create`;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("type", formData.type || "cloth");
    data.append("parentId", formData.parentId || "");
    formData.images?.forEach((file) => {
      data.append("images", file);
    });

    try {
      const res = await fetch(url, {
        method,
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        alert(editingId ? "Cập nhật thành công!" : "Thêm thành công!");
        resetForm();
        refreshCategories();
      } else {
        alert(result.message || "Có lỗi khi xử lý.");
      }
    } catch (err) {
      console.error("Lỗi khi gửi request:", err);
      alert("Lỗi mạng hoặc server.");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/category/${id}`);
      const data = await res.json();
      const result = data.result;

      if (res.ok && result) {
        setEditingId(id);
        setFormData({
          name: result.name || "",
          slug: result.slug || "",
          parentId: result.parentId || "",
          type: result.type || "cloth",
          images: [],
        });
        setShowEdit(true);
      } else {
        alert("Không tìm thấy danh mục.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu danh mục:", err);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      alert("ID không hợp lệ hoặc chưa có!");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/category/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        alert("Xóa thành công!");
        refreshCategories();
      } else {
        alert(result.message || "Xóa thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  const getParentName = (parentId: string | null) => {
    const parent = parentCategories.find((item) => item._id === parentId);
    return parent ? parent.name : "Không có";
  };

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
              <select
                className={styles.select}
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">Tất cả danh mục cha</option>
                {parentCategories
                  .filter((cate) => cate.parentId === null)
                  .map((cate) => (
                    <option key={cate._id} value={cate._id}>
                      {cate.name}
                    </option>
                  ))}
              </select>
            </div>
            <button className={styles.addButton} onClick={() => setShowAdd(true)}>
              + Thêm danh mục
            </button>
          </div>
        </div>

        {(showAdd || showEdit) && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>
              {showEdit ? "Cập nhật Danh Mục" : "Thêm Danh Mục"}
            </h2>

            <select
              className={styles.select}
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục cha</option>
              {parentCategories
                .filter((cate) => cate.parentId === null)
                .map((cate) => (
                  <option key={cate._id} value={cate._id}>
                    {cate.name}
                  </option>
                ))}
            </select>

            <input
              className={styles.input}
              type="text"
              name="name"
              placeholder="Tên danh mục"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              className={styles.input}
              type="text"
              name="slug"
              placeholder="Slug"
              value={formData.slug}
              onChange={handleChange}
            />

            <input
              className={styles.input}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />

            {formData.images && formData.images.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {formData.images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                  />
                ))}
              </div>
            )}

            <button className={styles.addButton} onClick={handleSubmit}>
              {showEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
            </button>

            <button
              className={styles.closeBtn}
              onClick={resetForm}
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
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Danh mục cha</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter((cate) => cate.parentId !== null)
                .map((cate) => (
                  <tr key={cate._id}>
                    <td>{cate._id}</td>
                    <td>
                      {cate.images?.map((imgUrl, i) => (
                        <img
                          key={i}
                          src={imgUrl}
                          alt={cate.name}
                          style={{ width: 50, height: 50, objectFit: "cover", marginRight: 5 }}
                        />
                      ))}
                    </td>
                    <td>{cate.name}</td>
                    <td>{cate.slug}</td>
                    <td>{getParentName(cate.parentId)}</td>
                    <td>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleEdit(cate._id)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDelete(cate._id)}
                      >
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
