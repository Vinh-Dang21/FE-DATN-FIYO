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
  name: string;
  slug: string;
  parentId: string;
  type: string;
  images: File[]; // luôn là mảng, không undefined
}


export default function Categories() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    parentId: "",
    type: "",
    images: [], // luôn là mảng rỗng ban đầu
  });


  // Fetch parent categories
  useEffect(() => {
    fetch("http://localhost:3000/category/parents")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.result)
            ? data.result
            : Array.isArray(data.data)
              ? data.data
              : [];
        setParentCategories(list);
      })
      .catch((err) => console.error("Lỗi fetch parents:", err));
  }, []);

  // Fetch categories (children)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = "http://localhost:3000/category";
        const res = await fetch(url);
        const allCategories: Category[] = await res.json();

        // Đảm bảo allCategories là mảng
        const filtered = selectedParentId
          ? Array.isArray(allCategories)
            ? allCategories.filter((cate) => cate.parentId === selectedParentId)
            : []
          : Array.isArray(allCategories)
            ? allCategories.filter((cate) => cate.parentId)
            : [];
        setCategories(filtered);
      } catch (err) {
        console.error("Lỗi fetch danh mục:", err);
        setCategories([]); // Đảm bảo không bị lỗi filter
      }
    };

    fetchCategories();
  }, [selectedParentId]);

  const resetForm = () => {
    setShowAdd(false);
    setShowEdit(false);
    setEditingId(null);
    setFormData({ name: "", slug: "", parentId: "", type: "cloth", images: [] });
    setExistingImages([]);
  };

  const refreshCategories = async () => {
    const url = `http://localhost:3000/category/children/${selectedParentId}`;
    const res = await fetch(url);
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "name") {
        return {
          ...prev,
          name: value,
          slug: generateSlug(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setFormData((prev) => ({ ...prev, images: fileArray }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      alert("Vui lòng nhập tên và slug hợp lệ!");
      return;
    }

    const isDuplicate = Array.isArray(categories) &&
      categories.some((cate) => {
        const cateName = cate.name?.trim().toLowerCase() || "";
        const formName = formData.name?.trim().toLowerCase() || "";
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

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => {
        data.append("images", file);
      });
    } else {
      existingImages.forEach((img) => {
        data.append("existingImages", img);
      });
    }

    try {
      const res = await fetch(url, { method, body: data });
      const result = await res.json();
      if (res.ok) {
        alert(editingId ? "Cập nhật thành công!" : "Thêm thành công!");
        resetForm();
        // Nếu không chọn danh mục cha, load lại tất cả danh mục
        if (!selectedParentId) {
          // Lấy lại toàn bộ danh mục
          const resAll = await fetch("http://localhost:3000/category");
          const allCategories = await resAll.json();
          const filtered = Array.isArray(allCategories)
            ? allCategories.filter((cate) => cate.parentId)
            : [];
          setCategories(filtered);
        } else {
          // Nếu có chọn danh mục cha, chỉ load children
          refreshCategories();
        }
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
        setExistingImages(result.images || []);
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

    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

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
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <select
                className={styles.select}
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">Chọn danh mục cha</option>
                {Array.isArray(parentCategories) &&
                  parentCategories
                    .filter((cate) => cate.parentId === null)
                    .map((cate) => (
                      <option key={cate._id} value={cate._id}>
                        {cate.name}
                      </option>
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

        {/* Form thêm/sửa */}
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
              {Array.isArray(parentCategories) &&
                parentCategories
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

            <select
              className={styles.select}
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="cloth">Quần áo</option>
              <option value="accessory">Phụ kiện</option>
            </select>

            <input
              className={styles.input}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />

            {formData.images.length > 0 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {formData.images.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${i}`}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                ))}
              </div>
            )}


            {showEdit &&
              !formData.images?.length &&
              existingImages.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {existingImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`old-${i}`}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ))}
                </div>
              )}

            <button className={styles.addButton} onClick={handleSubmit}>
              {showEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
            </button>
            <button className={styles.closeBtn} onClick={resetForm}>
              Đóng
            </button>
          </div>
        )}

        {/* Danh sách */}
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
              {Array.isArray(categories) &&
                categories
                  .filter((cate) =>
                    cate.name
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase())
                  )
                  .map((cate, index) => (
                    <tr key={cate._id}>
                      <td>{index + 1}</td>
                      <td>
                        {cate.images?.length
                          ? cate.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={cate.name}
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                marginRight: 5,
                              }}
                            />
                          ))
                          : "Không có ảnh"}
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
