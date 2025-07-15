"use client";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./products.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  type?: string;
}
interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  material: string;
  shop_id: number;
  create_at: string; // hoặc Date
  description: string;
  sale_count?: number;
  isHidden: boolean;
  category_id: {
    categoryName: string;
    categoryId: string;
  };
}
interface Variant {
  color: string; // mã hex hoặc tên màu
  sizes: { size: string; quantity: number }[];
}




export default function Product() {
  const [showAdd, setShowAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [noProduct, setNoProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [sizeInput, setSizeInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([]);
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<string[]>(["", "", "", ""]);

  const handleToggleDesc = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...previews];
      newPreviews[index] = reader.result as string;
      setPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = () => {
  const validImages = images.filter(Boolean);
  if (validImages.length < 4) {
    alert("Vui lòng chọn đủ 4 ảnh!");
    return;
  }

  const formData = new FormData();
  validImages.forEach((img, i) => {
    if (img) formData.append("images", img); // hoặc `images[]` tùy API
  });

  // append các trường khác (name, price,...)

  // Gửi qua fetch hoặc axios
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

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch("http://localhost:3000/category/parents");
        const data = await res.json();

        // Lọc bỏ phần tử có status (nếu là object không có _id)
        const validCategories = data.filter((item: any) => item._id);
        setParentCategories(validCategories);

      } catch (error) {
        console.error("Lỗi khi lấy danh mục cha:", error);
      }
    };
    fetchParents();
  }, []);


  useEffect(() => {
    const fetchChildren = async () => {
      if (!selectedParent) {
        setChildCategories([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/category/children/${selectedParent}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setChildCategories(data); // ✅ OK
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục con:", error);
      }
    };

    fetchChildren();
  }, [selectedParent]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "http://localhost:3000/products";

        // Nếu chọn danh mục con thì lọc theo danh mục con
        if (selectedChild) {
          url = `http://localhost:3000/products/category/${selectedChild}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 1 && data[0].status === true) {
          const products = data.slice(1);
          setProducts(products);
          setNoProduct(false);
        } else if (data.products) {
          // Trường hợp khi gọi toàn bộ sản phẩm từ /products
          setProducts(data.products);
          setNoProduct(false);
        } else {
          setProducts([]);
          setNoProduct(true);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setProducts([]);
        setNoProduct(true);
      }
    };

    fetchProducts();
  }, [selectedChild]);

  const handleToggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/products/update/${id}`, {
        method: "PUT", // hoặc PATCH, tuỳ theo backend bạn đang dùng
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: !currentHidden }),
      });

      const result = await response.json();

      if (result.status) {
        // Cập nhật UI ngay sau khi thay đổi
        setProducts((prev) =>
          prev.map((product) =>
            product._id === id ? { ...product, isHidden: !currentHidden } : product
          )
        );
      } else {
        console.error("Cập nhật thất bại:", result.message || result);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái sản phẩm:", error);
    }
  };
  const handlePickColor = async () => {
    if (!("EyeDropper" in window)) {
      alert("Trình duyệt không hỗ trợ EyeDropper");
      return;
    }
    const eyeDropper = new (window as any).EyeDropper();
    try {
      const result = await eyeDropper.open();
      setCurrentColor(result.sRGBHex);
    } catch (err) {
      console.error("Lỗi EyeDropper:", err);
    }
  };

  const handleAddSize = () => {
    const trimmedSize = sizeInput.trim();
    if (!trimmedSize || quantityInput <= 0) return;

    const isDuplicate = sizes.some(s => s.size.toLowerCase() === trimmedSize.toLowerCase());
    if (isDuplicate) {
      alert("Size này đã được thêm rồi!");
      return;
    }

    setSizes([...sizes, { size: trimmedSize, quantity: quantityInput }]);
    setSizeInput("");
    setQuantityInput(1);
  };

  const handleAddVariant = () => {
    if (!currentColor) {
      alert("Chưa chọn màu");
      return;
    }
    if (sizes.length === 0) {
      alert("Chưa thêm size");
      return;
    }

    const newVariant: Variant = {
      color: currentColor,
      sizes,
    };

    console.log("✅ Biến thể mới được thêm:", newVariant);

    setVariants(prev => {
      const updated = [...prev, newVariant];
      console.log("📦 Danh sách biến thể hiện tại:", updated);
      return updated;
    });

    // Reset tạm
    setCurrentColor("");
    setSizes([]);
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
              <select
                className={styles.select}
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="">Tình trạng</option>
                <option value="available">Còn hàng</option>
                <option value="low">Sắp hết</option>
                <option value="out">Hết hàng</option>
              </select>
              <select
                className={styles.select}
                value={selectedParent}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSelectedParent(selected);

                  if (!selected) {
                    // Nếu chọn "Danh mục" rỗng => reset danh mục con + gọi tất cả sản phẩm
                    setSelectedChild("");
                    setChildCategories([]);
                  }
                }}
              >

                <option value="">Danh mục</option>
                {parentCategories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                value={selectedChild}
                onChange={(e) => { console.log("Chọn danh mục con:", e.target.value); setSelectedChild(e.target.value) }}
              >
                <option value="">Danh mục con</option>
                {childCategories.map((child: any) => (
                  <option key={child._id} value={child._id}>
                    {child.name}
                  </option>
                ))}
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
              <label>Chọn 4 ảnh sản phẩm:</label>
              <div className={styles.imageGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.imageSlot}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, i)}
                    />
                    {previews[i] && (
                      <img src={previews[i]} alt={`Preview ${i + 1}`} className={styles.imagePreview} />
                    )}
                  </div>
                ))}
              </div>
            </div>


            {/* Hàng 5: Variants (gợi ý nhập JSON thủ công) */}
            <div className={styles.variantSection}>
              <h3>Thêm biến thể sản phẩm</h3>
              {/* Chọn màu */}
              <div className={styles.rowvarian}>
                <label>Màu sắc:</label>
                <input type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} />
                <button type="button" onClick={handlePickColor}>Chọn màu</button>
              </div>

              {/* Nhập size và số lượng */}
              <div className={styles.rowvarian}>
                <input
                  type="text"
                  placeholder="Size (VD: M)"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Số lượng"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(Number(e.target.value))}
                />
                <button type="button" onClick={handleAddSize}>Thêm size</button>
              </div>

              {/* Danh sách size đã thêm */}
              <div className={styles.showvarian}>
                {sizes.map((s, index) => (
                  <div key={index}>
                    Size: {s.size} - Số lượng: {s.quantity}
                  </div>
                ))}
              </div>

              {/* Thêm variant */}
              <button className={styles.addvarian} type="button" onClick={handleAddVariant}>+ Thêm biến thể</button>

              {/* Hiển thị các variant đã thêm */}
              <div className={styles.showvarian}>
                {variants.map((v, index) => (
                  <div className={styles.listvarian} key={index} style={{ marginTop: 10 }}>
                    <div className={styles.colorvarian}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor: v.color,
                          border: "1px solid #e4e4e7",
                          marginRight: 8,
                        }}
                      ></span>
                    </div>
                    <ul>
                      {v.sizes.map((s, i) => (
                        <li key={i}>
                          Size: {s.size} - Số lượng : {s.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>


            {/* Hàng 6: Mô tả sản phẩm */}
            <div className={styles.row}>
              <textarea className={styles.input} placeholder="Mô tả" name="description" rows={3} />
            </div>

            {/* Hàng 7: Sale count */}
            <div className={styles.row}>
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
                <th>Đóng/Mở bán</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tình trạng</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {products.filter((product: any) => {
                const totalQty = getTotalQuantity(product.variants);

                if (stockFilter === "available") return totalQty >= 50;
                if (stockFilter === "low") return totalQty > 0 && totalQty < 50;
                if (stockFilter === "out") return totalQty === 0;
                return true;
              }).length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                    Không có sản phẩm nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                products
                  .filter((product: any) => {
                    const totalQty = getTotalQuantity(product.variants);

                    if (stockFilter === "available") return totalQty >= 50;
                    if (stockFilter === "low") return totalQty > 0 && totalQty < 50;
                    if (stockFilter === "out") return totalQty === 0;
                    return true;
                  })
                  .map((product: any) => (
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
                      <td>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={!product.isHidden}
                            onChange={() => handleToggleVisibility(product._id, product.isHidden)}
                          />

                          <span className={styles.slider}></span>
                        </label>
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
                      </td>
                    </tr>
                  ))
              )}
            </tbody>

          </table>
        </div>
      </section>
    </main>
  );
}
