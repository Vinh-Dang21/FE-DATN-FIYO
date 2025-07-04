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
  Shirt,
  CheckCircle2,
} from "lucide-react";
import React, { useState } from "react";
import styles from "./users.module.css";
const comments = [
  {
    id: 1,
    user: {
      name: "Nguyễn Văn A",
      email: "vana@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    product: {
      name: "Áo polo nam",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/qmG5gfFP9s8VDSPKAOK3D5Q9CLz26Bn8.jpg"
    },
    stars: 5,
    content: "Áo mặc rất mát, chất vải mềm, mặc đi làm hay đi chơi đều đẹp. Sẽ ủng hộ shop lần sau.",
    date: "12/06/2025",
    status: "Đang chờ",
  },
  {
    id: 2,
    user: {
      name: "Trần Thị Bình",
      email: "binh.tran@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    product: {
      name: "Áo sơ mi trắng",
      image: "https://1557691689.e.cdneverest.net/fast/180x0/filters:format(webp)/static.5sfashion.vn/storage/product/0wyTFhVjgZqOy8DDcmRYqbc4gmMzy4jW.webp"
    },
    stars: 4,
    content: "Áo đẹp, vải dày dặn, giao hàng nhanh. Tuy nhiên form hơi nhỏ, nên chọn size lớn hơn.",
    date: "10/06/2025",
    status: "Đã duyệt",
  },
  {
    id: 3,
    user: {
      name: "Lê Văn Cường",
      email: "cuong.le@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/31.jpg",
    },
    product: {
      name: "Áo khoác bomber",
      image:
        "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/VLi26eAecqORuPBXxXiYwM1HOu7FTOF8.webp",
    },
    stars: 3,
    content: "Áo khoác ổn, chất vải tốt nhưng giao hàng hơi chậm. Màu sắc giống hình.",
    date: "09/06/2025",
    status: "Đang chờ",
  },
  {
    id: 4,
    user: {
      name: "Phạm Thị Dung",
      email: "dung.pham@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    },
    product: {
      name: "Tất Nam Cổ Lửng",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/pDs6zgrE54mdZTAfrNLOYaK804IZOf3J.webp",
    },
    stars: 5,
    content: "Tất đi rất êm chân, không bị bí, chất vải co giãn tốt. Đóng gói cẩn thận.",
    date: "08/06/2025",
    status: "Đã duyệt",
  },
  {
    id: 5,
    user: {
      name: "Võ Minh Tuấn",
      email: "tuan.vo@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    },
    product: {
      name: "Áo thun basic",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/8wo2oe2X0LomZg4RUd9KUUtXQUGlq3lV.jpg",
    },
    stars: 4,
    content: "Áo thun mặc thoải mái, thấm hút mồ hôi tốt, giá hợp lý. Sẽ mua thêm màu khác.",
    date: "07/06/2025",
    status: "Đang chờ",
  },
  {
    id: 6,
    user: {
      name: "Ngô Thị Hạnh",
      email: "hanh.ngo@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/61.jpg",
    },
    product: {
      name: "Quần short kaki",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/YuZOZ6EGPsxznrIWu7Gk1fFd6Iqz1ECG.webp",
    },
    stars: 5,
    content: "Quần short mặc rất mát, màu sắc trẻ trung, giao hàng nhanh. Rất hài lòng.",
    date: "06/06/2025",
    status: "Đã duyệt",
  },
  {
    id: 7,
    user: {
      name: "Đỗ Văn Hùng",
      email: "hung.do@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    },
    product: {
      name: "Áo hoodie nỉ",
      image: "https://4menshop.com/images/thumbs/2023/06/ao-hoodie-ni-regular-minimalism-ah001-mau-be-17799-slide-products-649414449c9da.jpg",
    },
    stars: 4,
    content: "Áo hoodie dày dặn, giữ ấm tốt, mặc mùa đông rất thích. Đường may chắc chắn.",
    date: "05/06/2025",
    status: "Đang chờ",
  },
  {
    id: 8,
    user: {
      name: "Lý Thị Mai",
      email: "mai.ly@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/81.jpg",
    },
    product: {
      name: "Giày thể thao đen",
      image: "https://4menshop.com/images/thumbs/2019/01/giay-the-thao-den-g212-10615-slide-products-5c4140a0f10ae.jpg",
    },
    stars: 5,
    content: "Giày đẹp, đi êm chân, giao hàng nhanh. Đúng mẫu, đúng size.",
    date: "04/06/2025",
    status: "Đã duyệt",
  },
  {
    id: 9,
    user: {
      name: "Trần Quốc Dũng",
      email: "dung.tran@gmail.com",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    product: {
      name: "Áo thun basic",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/8wo2oe2X0LomZg4RUd9KUUtXQUGlq3lV.jpg",
    },
    stars: 3,
    content: "Áo thun mặc ổn, chất vải mềm, giá hợp lý. Đóng gói chắc chắn.",
    date: "03/06/2025",
    status: "Đang chờ",
  },
  {
    id: 10,
    user: {
      name: "Phan Thị Lan",
      email: "lan.phan@gmail.com",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    },
    product: {
      name: "Áo Sát Nách Nam",
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/cpQCdjDgCK98EPdATbxg13uwBwLsQGxV.webp",
    },
    stars: 4,
    content: "Áo sát nách mặc tập gym rất thoải mái, thấm hút mồ hôi tốt. Đã mua lần 2.",
    date: "02/06/2025",
    status: "Đã duyệt",
  },
];

export default function User() {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleToggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

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
          <li>
            <a href="/voucher" className={styles.menuItem}>
              <GraduationCap className={styles.icon} />
              <span className={styles.title}>Khuyến mãi</span>
            </a>
          </li>
          <li className={styles.activeItem}>
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
          <h2 className={styles.userListTitle}>Bảng Danh Sách Bình Luận</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Số sao</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td className={styles.userInfo}>
                    <div className={styles.userBox}>
                      <img
                        src={c.user.avatar}
                        alt="Hình SP"
                        className={styles.userImage}
                      />
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>{c.user.name}</div>
                        <div className={styles.userDesc}>{c.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.productInfo}>
                    <div className={styles.productBox}>
                      <img
                        src={c.product.image}
                        alt={c.product.name}
                        className={styles.productImage}
                      />
                      <span className={styles.productName}>{c.product.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.stars}>
                      {"★".repeat(c.stars)}
                      {"☆".repeat(5 - c.stars)}
                    </span>
                  </td>
                  <td className={styles.commentContent}>
                    {expandedRows.includes(c.id) ? (
                      <>
                        {c.content}
                        {c.content.length > 62 && (
                          <button
                            className={styles.seeMoreBtn}
                            onClick={() => handleToggleExpand(c.id)}
                          >
                            Thu gọn
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {c.content.length > 62
                          ? c.content.slice(0, 62) + "..."
                          : c.content}
                        {c.content.length > 62 && (
                          <button
                            className={styles.seeMoreBtn}
                            onClick={() => handleToggleExpand(c.id)}
                          >
                            Xem thêm
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td>{c.date}</td>
                  <td>
                    <span
                      className={
                        c.status === "Đã duyệt"
                          ? styles.statusApproved
                          : styles.statusPending
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn} title="Duyệt">
                      <CheckCircle2 size={22} />
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
