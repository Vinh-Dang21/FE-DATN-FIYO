"use client";
import { useEffect, useState } from "react";
import styles from "./stockentry.module.css";
import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";

interface SizeItem {
  _id: string;
  size: string;
  quantity: number;
}

interface Variant {
  _id?: string;
  color: string;
  sizes: SizeItem[];
  parentVariantId?: string; // Thêm dòng này
}

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
  create_at: string;
  description: string;
  sale_count?: number;
  isHidden: boolean;
  category_id: {
    categoryName: string;
    categoryId: string;
  };
  variants: VariantWrapper[];
}

interface VariantColor {
  _id: string;
  color: string;
  sizes: SizeItem[];
}

interface VariantWrapper {
  _id: string;
  variants: VariantColor[];
}

export default function InventoryPage() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [noProduct, setNoProduct] = useState(false);
  const [stockFilter, setStockFilter] = useState("");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [filterChild, setFilterChild] = useState(""); // cho bộ lọc
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // số sản phẩm mỗi trang
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [addedQuantities, setAddedQuantities] = useState<{ [key: string]: number }>({});

  // Helper: kiểm tra ObjectId (24 hex chars)
  function isValidObjectId(id: string) {
    return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
  }

  // --- HÀM HỖ TRỢ ---
  const getTotalQuantity = (variants: Variant[]) => {
    return variants.reduce((total: number, variant: Variant) => {
      if (!variant || !Array.isArray(variant.sizes)) return total;
      const variantQty = variant.sizes.reduce((sum: number, size: SizeItem) => {
        return sum + (size?.quantity || 0);
      }, 0);
      return total + variantQty;
    }, 0);
  };

  const getProductStatus = (variants: Variant[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return "Hết hàng";
    if (totalQty < 50) return "Sắp hết";
    return "Còn hàng";
  };

  const getProductStatusClass = (variants: Variant[]) => {
    const totalQty = getTotalQuantity(variants);
    if (totalQty === 0) return styles.statusOut;
    if (totalQty < 50) return styles.statusLow;
    return styles.statusAvailable;
  };

  // --- LẤY DANH MỤC CHA ---
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch("https://fiyo.click/api/category/parents");
        if (!res.ok) throw new Error("Lỗi khi gọi API danh mục cha");
        const data = await res.json();
        const validCategories = Array.isArray(data) ? data.filter((item: any) => item._id) : [];
        setParentCategories(validCategories);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục cha:", error);
      }
    };
    fetchParents();
  }, []);

  // --- LẤY DANH MỤC CON khi chọn parent ---
  useEffect(() => {
    const fetchChildren = async () => {
      if (!selectedParent) {
        setChildCategories([]);
        return;
      }
      try {
        const res = await fetch(`https://fiyo.click/api/category/children/${selectedParent}`);
        if (!res.ok) throw new Error("Lỗi khi gọi API danh mục con");
        const data = await res.json();
        if (Array.isArray(data)) setChildCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục con:", error);
      }
    };
    fetchChildren();
  }, [selectedParent]);

  // --- HÀM CHUNG LẤY SẢN PHẨM (dùng cho mọi chỗ) ---
  const loadProducts = async (opts?: { child?: string }) => {
    try {
      let url = "https://fiyo.click/api/products";
      const childToUse = opts?.child ?? (filterChild || selectedChild);
      if (childToUse) url = `https://fiyo.click/api/products/category/${childToUse}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Lỗi khi gọi API sản phẩm");
      const data = await res.json();

      // Nhiều API trả về cấu trúc khác nhau - xử lý linh hoạt
      let loaded: Product[] = [];
      if (Array.isArray(data) && data.length > 1 && (data[0] as any).status === true) {
        loaded = data.slice(1);
      } else if (data.products) {
        loaded = data.products;
      } else if (Array.isArray(data)) {
        loaded = data;
      } else {
        loaded = [];
      }

      // đảm bảo mỗi product có variants mảng
      const normalized = loaded.map((p: any) => ({ ...p, variants: p.variants ?? [] }));
      setProducts(normalized);
      setNoProduct(normalized.length === 0);
      setCurrentPage(1); // reset page mỗi khi load
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
      setNoProduct(true);
    }
  };

  // gọi loadProducts khi filterChild hoặc selectedChild thay đổi
  useEffect(() => {
    loadProducts();
  }, [filterChild, selectedChild]);

  // --- TÌM KIẾM ---
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      await loadProducts();
      return;
    }
    try {
      const encodedKeyword = encodeURIComponent(searchKeyword.trim());
      const url = `https://fiyo.click/api/products/search?name=${encodedKeyword}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Lỗi khi tìm kiếm");
      const data = await res.json();
      // nhiều API trả về mảng trực tiếp
      const found = Array.isArray(data) ? data : data.products ?? [];
      const updatedData = (found || []).map((product: any) => ({
        ...product,
        variants: product.variants ?? [],
      }));
      setProducts(updatedData);
      setNoProduct(updatedData.length === 0);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      setProducts([]);
      setNoProduct(true);
    }
  };

  // --- Toggle mô tả dài/ngắn ---
  const handleToggleDesc = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // --- Pagination helpers ---
  const indexOfLast = currentPage * limit;
  const indexOfFirst = indexOfLast - limit;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(products.length / limit));

  function getPaginationNumbers(totalPages: number, currentPage: number) {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const handleOpenStockForm = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${productId}`);
      if (!res.ok) throw new Error("Không lấy được chi tiết sản phẩm");
      const data = await res.json();
      setSelectedProduct(data);
      setShowStockForm(true);
    } catch (err) {
      alert("Lỗi khi lấy chi tiết sản phẩm");
    }
  };

  // Hàm xử lý lưu thay đổi số lượng nhập hàng
  async function handleSaveStockChange() {
    if (!selectedProduct) return;
    // Chuẩn bị payload
    const updatedVariants = selectedProduct.variants?.flatMap((vw: any) =>
      vw.variants.map((v: any) => ({
        ...v, // giữ lại toàn bộ thông tin variant (bao gồm color)
        sizes: v.sizes.map((s: any) => {
          const key = `${v._id}-${s._id}`;
          const add = Number(addedQuantities[key]) || 0;
          return {
            ...s, // giữ lại toàn bộ thông tin size (bao gồm sku)
            quantity: s.quantity + add
          };
        })
      }))
    );

    const payload = { variants: updatedVariants };

    // Log payload trước khi gửi API
    console.log("Payload gửi API:", payload);

    try {
      const res = await fetch(
        `http://localhost:3000/products/variants/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) throw new Error(await res.text());
      alert("Cập nhật thành công!");
      setShowStockForm(false);
      setAddedQuantities({});
      loadProducts();
    } catch (err: any) {
      alert("Lỗi khi cập nhật: " + err.message);
    }
  }

  // --- Render ---
  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.searchProduct}>
          <div className={styles.spaceBetween}>
            <h2 className={styles.userListTitle}> Trang nhập hàng </h2>
          </div>
        </div>

        <div className={styles.productManager}>
          {/* Bên trái */}
          <div className={styles.leftPanel}>
            <h3></h3>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <select
              className={styles.select}
              value={selectedParent}
              onChange={(e) => {
                const selected = e.target.value;
                setSelectedParent(selected);

                if (!selected) {
                  setSelectedChild("");
                  setChildCategories([]);
                  setFilterChild("");
                  loadProducts();
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
              value={filterChild}
              onChange={(e) => {
                setFilterChild(e.target.value);
              }}
            >
              <option value="">Danh mục con</option>
              {childCategories.map((child: any) => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 12 }}>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setSelectedParent("");
                  setSelectedChild("");
                  setFilterChild("");
                  setSearchKeyword("");
                  setChildCategories([]);
                  loadProducts(); // Gọi lại API lấy tất cả sản phẩm
                }}
              >
                Tải lại danh sách
              </button>
            </div>
          </div>

          {/* Bên phải */}
          <div className={styles.rightPanel}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Tình trạng</th>
                  <th>Số lượng</th>
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
                  currentProducts
                    .filter((product: any) => {
                      const totalQty = getTotalQuantity(product.variants);
                      if (stockFilter === "available") return totalQty >= 50;
                      if (stockFilter === "low") return totalQty > 0 && totalQty < 50;
                      if (stockFilter === "out") return totalQty === 0;
                      return true;
                    })
                    .map((product: any) => (
                      <tr key={product._id}>
                        <td>
                          <div className={styles.productInfo}>
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
                                    {product.description?.length > 80
                                      ? product.description.slice(0, 80) + "..."
                                      : product.description}
                                    {product.description?.length > 80 && (
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
                          </div>
                        </td>

                        <td>{product.category_id?.categoryName}</td>
                        <td>
                          <span className={getProductStatusClass(product.variants)}>
                            {getProductStatus(product.variants)}
                          </span>
                        </td>
                        <td>{getTotalQuantity(product.variants)}</td>
                        <td>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleOpenStockForm(product._id)}
                          >
                            Nhập hàng
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                Trang trước
              </button>

              {getPaginationNumbers(totalPages, currentPage).map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className={styles.ellipsis}>...</span>
                ) : (
                  <button
                    key={idx}
                    className={currentPage === page ? styles.activePage : ""}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </button>
                )
              )}

              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                Trang sau
              </button>
            </div>
          </div>
        </div>
        {showStockForm && selectedProduct && (
          <>

            {/* Lớp nền tối */}
            <div
              className={styles.modalOverlay}
              onClick={() => setShowStockForm(false)} // Click ra ngoài để đóng
            ></div>
            <div className={styles.formWrapper}>
              <h2>NHẬP SẢN PHẨM</h2>
              <div className={styles.imageSection}>
                <div className={styles.mainImage}>
                  <img
                    src={selectedProduct.images?.[0] || "https://via.placeholder.com/300x300"}
                    alt={selectedProduct.name}
                  />
                </div>
                <div className={styles.smallImages}>
                  {selectedProduct.images?.slice(1, 4).map((img, idx) => (
                    <img key={idx} src={img} alt={`Small ${idx + 1}`} />
                  ))}
                </div>
                <div className={styles.infoSection}>
                  <h3 className={styles.productNameadd}>{selectedProduct.name}</h3>
                  <p className={styles.productDescadd}>{selectedProduct.description}</p>
                </div>
              </div>



              <div className={styles.variantSection}>
                <div className={styles.variantHeader}>
                  <h3 className={styles.stocktitle}>Danh sách biến thể</h3>
                </div>
                <div className={styles.variantList}>
                  {selectedProduct.variants?.flatMap((vw: any) =>
                    vw.variants.map((v: any, index: number) => (
                      <div className={styles.variantRow} key={v._id || index}>
                        <div className={styles.colorBlock}>
                          <span
                            className={styles.colorCircle}
                            style={{ backgroundColor: v.color }}
                          ></span>
                          <strong>Màu: {v.color}</strong>
                        </div>
                        <ul className={styles.sizeList}>
                          {v.sizes.map((s: any, i: number) => {
                            const key = `${v._id}-${s._id}`;
                            return (
                              <li
                                key={s._id || i}
                                className={styles.sizeItem} // class cho li
                              >
                                <div className={styles.sizeItemOld}><strong>Size:</strong> {s.size} - <strong>SL:</strong> {s.quantity}</div>   Nhập thêm:
                                <input
                                  type="number"
                                  className={styles.sizeInput} // class cho input
                                  min={0}
                                  placeholder="Nhập SL"
                                  style={{ width: 80, marginLeft: 8 }}
                                  value={addedQuantities[key] ?? ""}
                                  onChange={e => {
                                    const value = Number(e.target.value);
                                    setAddedQuantities(prev => ({ ...prev, [key]: value }));
                                  }}
                                />
                              </li>

                            );
                          })}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <button onClick={() => setShowStockForm(false)}>Đóng</button>
              <button
                className={styles.actionBtn}
                onClick={handleSaveStockChange}
              >
                Lưu thay đổi
              </button>
            </div>
          </>
        )}

      </section>
    </main>
  );
}
