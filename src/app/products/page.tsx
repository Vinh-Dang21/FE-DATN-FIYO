"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./products.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

export default function Product() {
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleToggleDesc = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/products/");
        const result = await response.json();
        if (result.status) {
          setProducts(result.products);
        } else {
          console.error("Dữ liệu trả về không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getTotalQuantity = (variants: any[]) => {
    return variants.reduce((total: number, variant: any) => {
      const variantQty = variant.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0);
      return total + variantQty;
    }, 0);
  };

  const isAvailable = (variants: any[]) => {
    return getTotalQuantity(variants) > 0;
  };

  const getProductStatus = (variants: any[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return "Hết hàng";
    if (totalQty < 50) return "Sắp hết";
    return "Còn hàng";
  };

  const getProductStatusClass = (variants: any[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return styles.statusOut;
    if (totalQty < 50) return styles.statusLow;
    return styles.statusAvailable;
  };



  return (
    <main className={styles.main}>
      <Sidebar />

      <section className={styles.content}>
        <Topbar />

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

            {/* Hàng 1: Tên sản phẩm & Giá */}
            <div className={styles.row}>
              <input className={styles.input} type="text" placeholder="Tên sản phẩm" name="name" />
              <input className={styles.input} type="number" placeholder="Giá (price)" name="price" />
            </div>

            {/* Hàng 2: Giảm giá & Chất liệu */}
            <div className={styles.row}>
              <input className={styles.input} type="number" placeholder="Giảm giá (%)" name="sale" />
              <input className={styles.input} type="text" placeholder="Chất liệu (material)" name="material" />
            </div>

            {/* Hàng 3: Danh mục & Shop */}
            <div className={styles.row}>
              <input className={styles.input} type="text" placeholder="ID danh mục (category_id)" name="category_id" />
              <input className={styles.input} type="text" placeholder="ID cửa hàng (shop_id)" name="shop_id" />
            </div>

            {/* Hàng 4: Ảnh chính */}
            <div className={styles.rowColumn}>
              <input
                className={styles.input}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                name="images"
                style={{ width: "100%" }}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              )}
            </div>

            {/* Hàng 5: Variants (gợi ý nhập JSON thủ công) */}
            <div className={styles.rowColumn}>
              <textarea
                className={styles.input}
                placeholder='Variants (ví dụ: [{"color":"Đen","sizes":[{"size":"M","quantity":10}]}])'
                name="variants"
                rows={4}
              />
            </div>

            {/* Hàng 6: Mô tả sản phẩm */}
            <div className={styles.rowColumn}>
              <textarea className={styles.input} placeholder="Mô tả" name="description" rows={3} />
            </div>

            {/* Hàng 7: Sale count */}
            <div className={styles.rowColumn}>
              <input
                className={styles.input}
                type="number"
                placeholder="Số lượt bán (sale_count)"
                name="sale_count"
              />
            </div>

            {/* Hàng 8: Nút Thêm bên phải */}
            <div className={styles.row} style={{ justifyContent: "flex-end" }}>
              <button className={styles.addButton}>Thêm</button>
            </div>

            {/* Hàng 9: Nút Đóng ở giữa */}
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
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tình trạng</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product._id}>
                  <td className={styles.productInfo}>
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <div className={styles.productDetails}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productDesc}>
                        {expandedRows.includes(product._id) ? (
                          <>
                            {product.description}
                            <button
                              className={styles.descBtn}
                              onClick={() => handleToggleDesc(product._id)}
                            >
                              Thu gọn
                            </button>
                          </>
                        ) : (
                          <>
                            {product.description.length > 80
                              ? product.description.slice(0, 80) + "..."
                              : product.description}
                            {product.description.length > 80 && (
                              <button
                                className={styles.descBtn}
                                onClick={() => handleToggleDesc(product._id)}
                              >
                                Xem thêm
                              </button>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  </td>
                  <td>{product.category_id?.categoryName}</td>
                  <td>{product.price.toLocaleString()} VND</td>
                  <td>{getTotalQuantity(product.variants)}</td>
                  <td>
                    <span className={getProductStatusClass(product.variants)}>
                      {getProductStatus(product.variants)}
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
