"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import styles from "./users.module.css"; // dùng chung styles

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
      image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/qmG5gfFP9s8VDSPKAOK3D5Q9CLz26Bn8.jpg",
    },
    stars: 5,
    content: "Áo mặc rất mát, chất vải mềm, mặc đi làm hay đi chơi đều đẹp. Sẽ ủng hộ shop lần sau.",
    image: "https://link-to-uploaded-image.jpg",
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
      image: "https://1557691689.e.cdneverest.net/fast/180x0/filters:format(webp)/static.5sfashion.vn/storage/product/0wyTFhVjgZqOy8DDcmRYqbc4gmMzy4jW.webp",
    },
    stars: 4,
    content: "Áo đẹp, vải dày dặn, giao hàng nhanh. Tuy nhiên form hơi nhỏ, nên chọn size lớn hơn.",
    image: "https://link-to-uploaded-image.jpg",
    date: "10/06/2025",
    status: "Đã duyệt",
  },
  // ... thêm các bình luận khác tương tự ở đây
];

comments.forEach((c) => {
  c.image = c.product.image;
});

export default function CommentsPage() {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleToggleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>Bảng Danh Sách Bình Luận</h2>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Sản phẩm</th>
                <th>Số sao</th>
                <th>Nội dung</th>
                <th>Hình ảnh</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td className={styles.userInfo}>
                    <div className={styles.userBox}>
                      <img
                        src={c.user.avatar}
                        alt="Avatar"
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
                  <td>
                    <img
                      src={c.image}
                      className={styles.productImage}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </td>
                  <td>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
