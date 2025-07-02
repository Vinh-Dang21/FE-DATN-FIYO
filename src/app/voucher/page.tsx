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
import styles from "./voucher.module.css";
import { useState } from "react";
const vouchers = [
  {
    id: "V001",
    code: "SALE50",
    minOrder: 500000,
    maxDiscount: 100000,
    quantity: 20,
    active: true,
    startDate: "01/06/2025",
    endDate: "30/06/2025",
  },
  {
    id: "V002",
    code: "FREESHIP",
    minOrder: 300000,
    maxDiscount: 30000,
    quantity: 50,
    active: true,
    startDate: "05/06/2025",
    endDate: "20/06/2025",
  },
  {
    id: "V003",
    code: "SUMMER10",
    minOrder: 200000,
    maxDiscount: 50000,
    quantity: 100,
    active: false,
    startDate: "10/06/2025",
    endDate: "15/07/2025",
  },
  {
    id: "V004",
    code: "WELCOME20",
    minOrder: 100000,
    maxDiscount: 20000,
    quantity: 150,
    active: true,
    startDate: "01/07/2025",
    endDate: "31/07/2025",
  },
  {
    id: "V005",
    code: "VIP100",
    minOrder: 1000000,
    maxDiscount: 200000,
    quantity: 10,
    active: false,
    startDate: "01/06/2025",
    endDate: "01/08/2025",
  },
  {
    id: "V006",
    code: "NEWUSER",
    minOrder: 0,
    maxDiscount: 50000,
    quantity: 500,
    active: true,
    startDate: "01/06/2025",
    endDate: "31/12/2025",
  },
  {
    id: "V007",
    code: "WEEKEND15",
    minOrder: 150000,
    maxDiscount: 15000,
    quantity: 80,
    active: true,
    startDate: "15/06/2025",
    endDate: "17/06/2025",
  },
  {
    id: "V008",
    code: "BIRTHDAY",
    minOrder: 0,
    maxDiscount: 100000,
    quantity: 1000,
    active: true,
    startDate: "01/06/2025",
    endDate: "31/12/2025",
  },
  {
    id: "V009",
    code: "FLASHSALE",
    minOrder: 100000,
    maxDiscount: 70000,
    quantity: 30,
    active: false,
    startDate: "20/06/2025",
    endDate: "21/06/2025",
  },
  {
    id: "V010",
    code: "SHOP20K",
    minOrder: 200000,
    maxDiscount: 20000,
    quantity: 200,
    active: true,
    startDate: "01/07/2025",
    endDate: "31/07/2025",
  },
];

export default function Voucher() {
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
          <li>
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
          <li className={styles.activeItem}>
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
          <div className={styles.searchAddBar}>
            <div className={styles.spaceBetween}>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className={styles.searchInput}
              />

              <button
                className={styles.addButton}
                onClick={() => setShowAdd(true)}>
                + Thêm mã giảm giá
              </button>
            </div>
          </div>
        </div>
        {showAdd && (
          <div className={styles.addAside}>
            <h2 className={styles.addAsideTitle}>Thêm Voucher</h2>
            <input
              className={styles.input}
              type="text"
              placeholder="Mã voucher"
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Giá trị đơn hàng tối thiểu"
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Giảm giá tối đa"
            />
            <input
              className={styles.input}
              type="number"
              placeholder="Số lượng"
            />
            <div className={styles.dateRow}>
              <label className={styles.label}>Ngày phát hành</label>
              <input className={styles.input} type="date" />
            </div>
            <div className={styles.dateRow}>
              <label className={styles.label}>Ngày kết thúc</label>
              <input className={styles.input} type="date" />
            </div>
            <button className={styles.addButton}>Thêm voucher</button>
            <button
              className={styles.closeBtn}
              onClick={() => setShowAdd(false)}
              style={{ marginTop: 10 }}>
              Đóng
            </button>
          </div>
        )}
        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Voucher</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã giảm giá</th>
                <th>Đơn hàng tối thiểu</th>
                <th>Giảm giá tối đa</th>
                <th>Số lượng</th>
                <th>Phát hành</th>
                <th>Thời gian áp dụng</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.code}</td>
                  <td>{v.minOrder.toLocaleString()}đ</td>
                  <td>{v.maxDiscount.toLocaleString()}đ</td>
                  <td>{v.quantity}</td>
                  <td>
                    <label className={styles.switch}>
                      <input type="checkbox" checked={v.active} readOnly />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    {v.startDate} - {v.endDate}
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
