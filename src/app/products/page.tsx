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
import styles from "./products.module.css";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Áo sơ mi trắng",
    desc: "Áo sơ mi trắng cổ điển, chất liệu cotton cao cấp, thấm hút mồ hôi tốt, phù hợp đi làm, đi học hoặc dự tiệc. Thiết kế form slimfit trẻ trung, dễ phối đồ với nhiều loại quần.",
    category: "Áo",
    status: true,
    price: 100000,
    quantity: 1234,
    available: true,
    image:
      "https://1557691689.e.cdneverest.net/fast/180x0/filters:format(webp)/static.5sfashion.vn/storage/product/0wyTFhVjgZqOy8DDcmRYqbc4gmMzy4jW.webp",
  },
  {
    id: 2,
    name: "Quần jeans xanh",
    desc: "Quần jeans xanh nam nữ, vải dày dặn, co giãn tốt, bền màu, phù hợp mặc hàng ngày hoặc đi chơi. Kiểu dáng basic, dễ phối với áo thun, sơ mi, áo khoác.",
    category: "Quần",
    status: true,
    price: 250000,
    quantity: 800,
    available: true,
    image:
      "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/XjuznF9TOo2H6wf2rRPjuxSjRPhrQmjh.webp",
  },
  {
    id: 3,
    name: "Áo thun basic",
    desc: "Áo thun trơn nhiều màu sắc, chất liệu cotton mềm mại, thấm hút mồ hôi, phù hợp mặc ở nhà, đi chơi, tập thể thao. Dễ phối với quần jeans, quần short.",
    category: "Áo",
    status: false,
    price: 90000,
    quantity: 0,
    available: false,
    image:
      "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/8wo2oe2X0LomZg4RUd9KUUtXQUGlq3lV.jpg",
  },
  {
    id: 4,
    name: "Tất Nam Cổ Lửng",
    desc: "Tất Nam Cổ Lửng 5S Fashion Phối Dệt Kẻ TAT24131, kiểu dáng trẻ trung, năng động, phù hợp đi học, đi làm, đi chơi. Dễ phối với nhiều loại trang phục khác nhau.",
    category: "Giày",
    status: true,
    price: 350000,
    quantity: 120,
    available: true,
    image:
      "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/pDs6zgrE54mdZTAfrNLOYaK804IZOf3J.webp",
  },
  {
    id: 5,
    name: "Áo khoác bomber",
    desc: "Áo khoác bomber nam nữ, chất liệu dày dặn, chống gió tốt, giữ ấm hiệu quả. Thiết kế trẻ trung, cá tính, phù hợp đi học, đi chơi, dạo phố.",
    category: "Áo",
    status: true,
    price: 420000,
    quantity: 60,
    available: true,
    image:
      "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/VLi26eAecqORuPBXxXiYwM1HOu7FTOF8.webp",
  },
  {
    id: 6,
    name: "Quần short kaki",
    desc: "Quần short kaki nam, chất liệu thoáng mát, thích hợp mặc mùa hè, đi biển, dã ngoại hoặc ở nhà. Kiểu dáng trẻ trung, dễ phối đồ.",
    category: "Quần",
    status: true,
    price: 150000,
    quantity: 300,
    available: true,
    image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/YuZOZ6EGPsxznrIWu7Gk1fFd6Iqz1ECG.webp",
  },
  {
    id: 7,
    name: "Áo hoodie nỉ",
    desc: "Áo hoodie nỉ dày dặn, giữ ấm tốt, thích hợp mặc mùa đông hoặc khi đi du lịch vùng lạnh. Thiết kế trẻ trung, có mũ, túi trước tiện lợi.",
    category: "Áo",
    status: false,
    price: 280000,
    quantity: 0,
    available: false,
    image:
      "https://4menshop.com/images/thumbs/2023/06/ao-hoodie-ni-regular-minimalism-ah001-mau-be-17799-slide-products-649414449c9da.jpg",
  },
  {
    id: 8,
    name: "Giày thể thao đen",
    desc: "Giày thể thao màu đen, đế cao su chống trơn trượt, phù hợp tập gym, chạy bộ hoặc đi học, đi chơi. Thiết kế năng động, dễ phối đồ.",
    category: "Giày",
    status: true,
    price: 370000,
    quantity: 75,
    available: true,
    image:
      "https://4menshop.com/images/thumbs/2019/01/giay-the-thao-den-g212-10615-slide-products-5c4140a0f10ae.jpg",
  },
  {
    id: 9,
    name: "Áo polo nam",
    desc: "Áo polo nam lịch sự, trẻ trung, chất liệu cotton co giãn, thấm hút mồ hôi tốt. Phù hợp đi làm, đi học, đi chơi hoặc chơi thể thao.",
    category: "Áo",
    status: true,
    price: 180000,
    quantity: 210,
    available: true,
    image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/qmG5gfFP9s8VDSPKAOK3D5Q9CLz26Bn8.jpg",
  },
  {
    id: 10,
    name: "Áo Sát Nách Nam",
    desc: "Áo Sát Nách Nam, chất liệu co giãn, thoải mái, phù hợp tập luyện, chạy bộ hoặc mặc ở nhà. Kiểu dáng hiện đại, trẻ trung.",
    category: "Áo",
    status: true,
    price: 220000,
    quantity: 95,
    available: true,
    image: "https://1557691689.e.cdneverest.net/fast/1325x0/filters:format(webp)/static.5sfashion.vn/storage/product_color/cpQCdjDgCK98EPdATbxg13uwBwLsQGxV.webp",
  },
];

export default function Product() {
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleToggleDesc = (id: number) => {
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
          <li className={styles.activeItem}>
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

        {/* Bộ lọc */}
        <div className={styles.filterProduct}>
          <div className={styles.filterBar}>
            <h2 className={styles.sectionTitle}>Lọc sản phẩm </h2>
            <div className={styles.selectRow}>
              <select className={styles.select}>
                <option value="">Tình trạng </option>
                <option value="available">Còn hàng</option>
                <option value="out">Hết hàng</option>
              </select>
              <select className={styles.select}>
                <option value="">Danh mục </option>
                <option value="ao">Áo</option>
                <option value="quan">Quần</option>
                <option value="giay">Giày</option>
              </select>
              <select className={styles.select}>
                <option value="">Trạng thái</option>
                <option value="">Đang mở bán </option>
                <option value="">Đã ngưng bán </option>
              </select>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm + Thêm sản phẩm */}
        <div className={styles.searchProduct}>
          <div className={styles.searchAddBar}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
            />
            <button
              className={styles.addButton}
              onClick={() => setShowAdd(true)}
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>
        {showAdd && (
          <div className={styles.addProductForm}>
            <h2 className={styles.addProductTitle}>Thêm sản phẩm mới</h2>
            {/* Hàng 1: Tên và Giá */}
            <div className={styles.row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Tên sản phẩm"
              />
              <input className={styles.input} type="number" placeholder="Giá" />
            </div>
            {/* Hàng 2: Danh mục cha và con */}
            <div className={styles.row}>
              <select className={styles.select} style={{ width: "50%" }}>
                <option>Chọn danh mục cha</option>
                <option>Áo</option>
                <option>Quần</option>
                <option>Giày</option>
                <option>Phụ kiện</option>
              </select>
              <select className={styles.select} style={{ width: "50%" }}>
                <option>Chọn danh mục con</option>
                <option>Sơ mi</option>
                <option>Thun</option>
                <option>Jeans</option>
                <option>Thể thao</option>
              </select>
            </div>
            {/* Hàng 3: Hình ảnh */}
            <div className={styles.rowColumn}>
              <input
                className={styles.input}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: "100%" }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.imagePreview}
                />
              )}
            </div>
            {/* Hàng 4: Số lượng */}
            <div className={styles.rowColumn}>
              <input
                className={styles.input}
                type="number"
                placeholder="Số lượng"
              />
            </div>
            {/* Hàng 5: Mô tả */}
            <div className={styles.rowColumn}>
              <textarea className={styles.input} placeholder="Mô tả" />
            </div>
            {/* Hàng 6: Nút Thêm bên phải */}
            <div className={styles.row} style={{ justifyContent: "flex-end" }}>
              <button className={styles.addButton}>Thêm</button>
            </div>
            {/* Hàng 7: Nút Đóng căn giữa */}
            <div className={styles.row} style={{ justifyContent: "center" }}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAdd(false)}
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
<div className={styles.productList}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tình trạng</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className={styles.productInfo}>
                  <img
                    src={product.image}
                    alt="Hình SP"
                    className={styles.productImage}
                  />
                  <div className={styles.productDetails}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productDesc}>
                      {expandedRows.includes(product.id) ? (
                        <>
                          {product.desc}
                          <button
                            className={styles.descBtn}
                            onClick={() => handleToggleDesc(product.id)}
                          >
                            Thu gọn
                          </button>
                        </>
                      ) : (
                        <>
                          {product.desc.length > 80
                            ? product.desc.slice(0, 80) + "..."
                            : product.desc}
                          {product.desc.length > 80 && (
                            <button
                              className={styles.descBtn}
                              onClick={() => handleToggleDesc(product.id)}
                            >
                              Xem thêm
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={product.status} readOnly />
                    <span className={styles.slider}></span>
                  </label>
                </td>
                <td>{product.price.toLocaleString()} VND</td>
                <td>{product.quantity}</td>
                <td>
                  <span className={product.available ? styles.statusAvailable : styles.statusOut}>
                    {product.available ? "Còn hàng" : "Hết hàng"}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn} title="Sửa">
                    <Pencil size={20} />
                  </button>
                  <button className={styles.actionBtn} title="Xóa">
                    <Trash2 size={20} />
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
