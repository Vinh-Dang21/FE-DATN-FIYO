"use client";
import {
  LayoutDashboard,
  BarChart as BarChartIcon, // Đổi tên để tránh trùng
  Users,
  ShoppingCart,
  GraduationCap,
  MessageCircle,
  Columns3,
  LogOut,
  Search,
  Bell,
  Pencil,
  Trash2,
  MoreVertical,
  Shirt,
} from "lucide-react";
import styles from "./categories.module.css";
import { useState } from "react";
const parentCategories = [
  "Nam",
  "Nữ",
  "Bé trai",
  "Bé gái",
  "Phụ kiện",
  "Giày dép",
];

const categories = [
  {
    id: "DM001",
    name: "Áo sơ mi nam",
    parent: "Nam",
    desc: "Áo sơ mi dài tay, ngắn tay, nhiều màu sắc, phù hợp đi làm, đi học.",
  },
  {
    id: "DM002",
    name: "Áo thun nữ",
    parent: "Nữ",
    desc: "Áo thun cotton, co giãn, nhiều kiểu dáng trẻ trung, năng động.",
  },
  {
    id: "DM003",
    name: "Quần jeans nam",
    parent: "Nam",
    desc: "Quần jeans xanh, đen, rách gối, form slimfit, dễ phối đồ.",
  },
  {
    id: "DM004",
    name: "Váy liền nữ",
    parent: "Nữ",
    desc: "Váy liền thân, váy xòe, váy ôm, phù hợp đi chơi, dự tiệc.",
  },
  {
    id: "DM005",
    name: "Áo khoác bé trai",
    parent: "Bé trai",
    desc: "Áo khoác gió, áo khoác nỉ cho bé trai từ 5-12 tuổi.",
  },
  {
    id: "DM006",
    name: "Quần short bé gái",
    parent: "Bé gái",
    desc: "Quần short vải, jeans, nhiều màu sắc, dễ thương cho bé gái.",
  },
  {
    id: "DM007",
    name: "Mũ lưỡi trai",
    parent: "Phụ kiện",
    desc: "Mũ lưỡi trai nam nữ, nhiều màu, phù hợp đi chơi, thể thao.",
  },
  {
    id: "DM008",
    name: "Thắt lưng da",
    parent: "Phụ kiện",
    desc: "Thắt lưng da thật, bản nhỏ, bản lớn, phù hợp mọi lứa tuổi.",
  },
  {
    id: "DM009",
    name: "Giày sneaker nam",
    parent: "Giày dép",
    desc: "Giày sneaker nam, đế cao su, kiểu dáng trẻ trung, dễ phối đồ.",
  },
  {
    id: "DM010",
    name: "Sandal nữ",
    parent: "Giày dép",
    desc: "Sandal quai hậu, đế bệt, phù hợp đi học, đi chơi, dạo phố.",
  },
];

export default function Categories() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <div className={styles.logo}>F I Y O</div>

        <ul className={styles.menuList}>
          <li>
            <a href="/" className={styles.menuItem}>
              <LayoutDashboard className={styles.icon} />
              <span className={styles.title}>Tổng quan</span>
            </a>
          </li>
          <li>
            <a href="/order" className={styles.menuItem}>
              <ShoppingCart className={styles.icon} />
              <span className={styles.title}>Đơn hàng</span>
            </a>
          </li>
          <li>
            <a href="/products" className={styles.menuItem}>
              <Shirt className={styles.icon} />
              <span className={styles.title}>Sản phẩm</span>
            </a>
          </li>
          <li className={styles.activeItem}>
            <a href="/categories" className={styles.menuItem}>
              <Columns3 className={styles.icon} />
              <span className={styles.title}>Danh mục</span>
            </a>
          </li>
          <li>
            <a href="/users" className={styles.menuItem}>
              <Users className={styles.icon} />
              <span className={styles.title}>Người dùng</span>
            </a>
          </li>
          <li>
            <a href="/voucher" className={styles.menuItem}>
              <GraduationCap className={styles.icon} />
              <span className={styles.title}>Khuyến mãi</span>
            </a>
          </li>
          <li>
            <a href="/comments" className={styles.menuItem}>
              <MessageCircle className={styles.icon} />
              <span className={styles.title}>Bình luận</span>
            </a>
          </li>
          <li>
            <a href="/logout" className={styles.menuItem}>
              <LogOut className={styles.icon} />
              <span className={styles.title}>Đăng xuất</span>
            </a>
          </li>
        </ul>
      </aside>

      <section className={styles.content}>
        <div className={styles.topbar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.actions}>
            <div className={styles.notification}>
              <Bell className={styles.icon} />
              <span className={styles.dot}></span>
            </div>
            <div className={styles.avatarWrapper}>
              <img
                src="https://phunugioi.com/wp-content/uploads/2022/06/Hinh-cho-cute.jpg"
                alt="Avatar"
                className={styles.avatar}
              />
              <span className={styles.onlineDot}></span>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm + Thêm sản phẩm */}
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
                {parentCategories.map((cate) => (
                  <option key={cate}>{cate}</option>
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
        {showAdd && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>Thêm Danh Mục</h2>
            <select className={styles.select}>
              <option>Chọn danh mục cha</option>
              <option>Áo nam</option>
              <option>Áo nữ</option>
              <option>Quần nam</option>
              <option>Quần nữ</option>
              <option>Phụ kiện</option>
              <option>Giày dép</option>
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
              style={{ marginTop: 10 }}>
              Đóng
            </button>
          </div>
        )}
        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Danh Sách Danh Mục</h2>
          {/* Bảng danh mục */}
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
              {categories.map((cate) => (
                <tr key={cate.id}>
                  <td>{cate.id}</td>
                  <td>{cate.name}</td>
                  <td>{cate.desc}</td>
                  <td>{cate.parent}</td>
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
