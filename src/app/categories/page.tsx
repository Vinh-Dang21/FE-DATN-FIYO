"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
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
}
interface CategoryForm {
  _id?: string;
  name: string;
  slug: string;
  parentId: string;
  type?: string;
}


export default function Categories() {111
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);



  useEffect(() => {
    fetch("http://localhost:3000/category/parents")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setParentCategories(data);
      })
      .catch((err) => console.error("Lỗi fetch parents:", err));
  }, []);

  // Gọi danh mục con khi chọn danh mục cha
  useEffect(() => {
    // Gọi lại danh sách
    const url = selectedParentId
      ? `http://localhost:3000/category/children/${selectedParentId}`
      : `http://localhost:3000/category/`;

    fetch(url)
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch((err) => console.error("Lỗi fetch lại sau khi thêm:", err));

  }, [selectedParentId]);

  const getParentName = (parentId: string | null) => {
    const parent = parentCategories.find((item) => item._id === parentId);
    return parent ? parent.name : "Không có";
  };

const [formData, setFormData] = useState<CategoryForm>({
  name: "",
  slug: "",
  parentId: "",
  type: "cloth", // default để đảm bảo luôn có
});




  const resetForm = () => {
  setShowAdd(false);
  setShowEdit(false);
  setEditingId(null);
  setFormData({ name: "", slug: "", parentId: ""});
};

const refreshCategories = async () => {
  const url = selectedParentId
    ? `http://localhost:3000/category/children/${selectedParentId}`
    : `http://localhost:3000/category/`;

  const res = await fetch(url);
  const data: Category[] = await res.json();
  setCategories(data);
};




  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async () => {
  if (!formData.name || !formData.slug) {
    alert("Vui lòng nhập tên và slug!");
    return;
  }

const payload = {
  ...formData,
  type: formData.type || "cloth", // 👈 dòng này giúp backend không lỗi
  parentId: formData.parentId || null,
};
const method = editingId ? "PUT" : "POST";
  const url = editingId
    ? `http://localhost:3000/category/${editingId}`
    : `http://localhost:3000/category/create`;

  console.log("🚀 Gửi yêu cầu:", { method, url, payload });

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("📦 Phản hồi từ server:", result);

    if (res.ok) {
      alert(editingId ? "✅ Cập nhật thành công!" : "✅ Thêm thành công!");

      // Reset lại form
      setEditingId(null);
      setShowAdd(false);
      setShowEdit(false);
      setFormData({ name: "", slug: "", parentId: "" });


      // Refresh lại danh sách
      const refreshUrl = selectedParentId
        ? `http://localhost:3000/category/children/${selectedParentId}`
        : `http://localhost:3000/category/`;

      const refreshed = await fetch(refreshUrl);
      const newData: Category[] = await refreshed.json();
      setCategories(newData);
    } else {
      console.warn("❌ Lỗi cập nhật:", result);
      alert(result.message || "Có lỗi khi xử lý danh mục.");
    }
  } catch (err) {
    console.error("🚨 Lỗi khi gửi request:", err);
    alert("Lỗi mạng hoặc server.");
  }
};



  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa danh mục này?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:3000/category/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        alert("Xóa thành công!");

        // Gọi lại danh sách danh mục
        const url = selectedParentId
          ? `http://localhost:3000/category/children/${selectedParentId}`
          : `http://localhost:3000/category/`;

        const refreshed = await fetch(url);
        const data: Category[] = await refreshed.json();
        setCategories(data);

      } else {
        alert(result.message || "Xóa thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xóa danh mục.");
    }
  };

  const handleEdit = async (id: string) => {
  try {
    console.log("👉 Bắt đầu handleEdit với ID:", id);

    const res = await fetch(`http://localhost:3000/category/${id}`);
    console.log("🔄 Trạng thái HTTP:", res.status);

    const data = await res.json();
    console.log("📦 Dữ liệu trả về từ API:", data);

    const result = data.result;

    if (res.ok && result) {
      console.log("✅ Dữ liệu hợp lệ, đang set formData...");

      setEditingId(id);
      setFormData({
  name: result.name || "",
  slug: result.slug || "",
  parentId: result.parentId || "",
});


      setShowEdit(true);
      console.log("✅ Đã mở form sửa, formData:", {
        name: result.name || "",
        slug: result.slug || "",
parentId: result.parentId || "",
        type: result.type || "cloth",
      });
    } else {
      alert("Không tìm thấy danh mục.");
      console.warn("❌ Server trả về lỗi:", data.message || data);
    }
  } catch (err) {
    console.error("🚨 Lỗi khi lấy dữ liệu danh mục:", err);
  }
};

  useEffect(() => {
    if (showEdit) {
      console.log("Form sửa đang hiện");
      console.log("Giá trị đang được bind:", formData);
    }
  }, [showEdit, formData]);



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
                {parentCategories.map((cate) => (
                  <option key={cate._id} value={cate._id}>
                    {cate.name}
                  </option>
                ))}
              </select>


            </div>
            <button
              className={styles.addButton}
              onClick={() => setShowAdd(true)}>
              + Thêm danh mục
            </button>
          </div>
        </div>
        {(showAdd || showEdit) && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>
              {showEdit ? "Cập nhật Danh Mục" : "Thêm Danh Mục"}
            </h2>

            {/* Danh mục cha */}
            <select
              className={styles.select}
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục cha</option>
              {parentCategories.map((cate) => (
                <option key={cate._id} value={cate._id}>
                  {cate.name}
                </option>
              ))}
            </select>



            {/* Tên danh mục */}
            <input
              className={styles.input}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />


            <input
              className={styles.input}
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
            />


            <button className={styles.addButton} onClick={handleSubmit}>
              {showEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
            </button>

            <button
              className={styles.closeBtn}
onClick={() => {
                setShowAdd(false);
                setShowEdit(false);
                setEditingId(null);
                setFormData({ name: "", slug: "", parentId: ""});
              }}
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
                <th>Slug</th>
                <th>Danh mục cha</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cate) => (
                <tr key={cate._id}>
                  <td>{cate._id}</td>
                  <td>{cate.name}</td>
                  <td>{cate.slug}</td>
                  <td>{getParentName(cate.parentId)}</td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      title="Sửa"
                      onClick={() => handleEdit(cate._id)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className={styles.actionBtn}
                      title="Xóa"
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