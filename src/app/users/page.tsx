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
  Eye,
  MoreVertical,
  Shirt,
} from "lucide-react";
import styles from "./users.module.css";
import Link from "next/link";

const users = [
  {
    id: "U001",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0901234567",
    role: "Admin",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: "U002",
    name: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    phone: "0902345678",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: "U003",
    name: "Lê Văn Cường",
    email: "cuong.le@gmail.com",
    phone: "0903456789",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
  },
  {
    id: "U004",
    name: "Phạm Thị Dung",
    email: "dung.pham@gmail.com",
    phone: "0904567890",
    role: "Admin",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
  },
  {
    id: "U005",
    name: "Võ Minh Tuấn",
    email: "tuan.vo@gmail.com",
    phone: "0905678901",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
  },
  {
    id: "U006",
    name: "Ngô Thị Hạnh",
    email: "hanh.ngo@gmail.com",
    phone: "0906789012",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/women/61.jpg",
  },
  {
    id: "U007",
    name: "Đỗ Văn Hùng",
    email: "hung.do@gmail.com",
    phone: "0907890123",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
  },
  {
    id: "U008",
    name: "Lý Thị Mai",
    email: "mai.ly@gmail.com",
    phone: "0908901234",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/women/81.jpg",
  },
  {
    id: "U009",
    name: "Trần Quốc Dũng",
    email: "dung.tran@gmail.com",
    phone: "0909012345",
    role: "Admin",
    avatar: "https://randomuser.me/api/portraits/men/91.jpg",
  },
  {
    id: "U010",
    name: "Phan Thị Lan",
    email: "lan.phan@gmail.com",
    phone: "0910123456",
    role: "User",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

export default function User() {
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
          <li className={styles.activeItem}>
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
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm ..."
              className={styles.searchInput}
            />

            <select className={styles.select}>
              <option>Tất cả vai trò</option>
              <option>Admin</option>
              <option>User</option>
            </select>
          </div>
        </div>
        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Users</h2>
          {/* Bảng user */}
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link href={`/userdetail`}>
                      {user.id}
                    </Link></td>
                  <td>
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className={styles.userImage}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <select className={styles.selectRole} defaultValue={user.role}>
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                    </select>
                  </td>
                  <td>
                    <Link href={`/userdetail`}>
                      <button className={styles.actionBtn} title="Xem">
                        <Eye size={20} />
                      </button>
                    </Link>

                    <button className={styles.actionBtn} title="Sửa">
                      <Pencil size={20} />
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
