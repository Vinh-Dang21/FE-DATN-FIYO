"use client";
import { useEffect, useState } from "react";
import styles from "./stockentry.module.css";
import Sidebar from "@/app/component/S-Sidebar";
import { useRouter } from "next/navigation";
import Topbar from "@/app/component/Topbar";


interface Variant {
  _id?: string;
  color: string;
  parentVariantId?: string; // Thêm dòng này
  sizes: {
    size: string;
    quantity: number;
    sku?: string; // nếu có dùng SKU
  }[];
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
  sizes: {
    size: string;
    quantity: number;
    sku?: string; // nếu có dùng SKU
  }[];
}

interface VariantWrapper {
  _id: string;
  variants: VariantColor[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://fiyo-be.onrender.com/api/";

export default function InventoryPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [noProduct, setNoProduct] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [currentColor, setCurrentColor] = useState<string>("");
  const [sizeInput, setSizeInput] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/warning-login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 2) {
        router.push("/warning-login");
        return;
      }
    } catch (err) {
      router.push("/warning-login");
    }
  }, [router]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    (async () => {
      try {
        const user = JSON.parse(userStr);
        const userId = user?._id;
        if (!userId) return;

        const res = await fetch(`${API_BASE}shop/user/${userId}`, { cache: "no-store" });
        const data = await res.json();

        // Đúng cấu trúc trả về
        const id =
          data?.shop?._id   // ✅ trường hợp hiện tại
          ?? data?.shopId   // fallback nếu BE đổi
          ?? data?._id;     // fallback khác

        if (id) {
          setShopId(String(id));
          console.log("Shop ID:", id);
        } else {
          console.warn("Không tìm được shopId trong payload:", data);
        }
      } catch (err) {
        console.error("Lỗi lấy shopId:", err);
      }
    })();
  }, []);

  // Helper: kiểm tra ObjectId (24 hex chars)
  function isValidObjectId(id: string) {
    return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
  }

  // --- HÀM HỖ TRỢ ---
  const getTotalQuantity = (variants: Variant[]) => {
    return variants.reduce((total, variant) => {
      if (!variant || !Array.isArray(variant.sizes)) return total;
      const variantQty = variant.sizes.reduce(
        (sum, size) => sum + (size?.quantity || 0),
        0
      );
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
        const res = await fetch(`${API_BASE}category/parents`);
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
        const res = await fetch(`${API_BASE}category/children/${selectedParent}`);
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
  // const loadProducts = async (opts?: { child?: string }) => {
  //   try {
  //     let url = `${API_BASE}products`;
  //     const childToUse = opts?.child ?? (filterChild || selectedChild);
  //     if (childToUse) url = `${API_BASE}products/category/${childToUse}`;

  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error("Lỗi khi gọi API sản phẩm");
  //     const data = await res.json();

  //     // Nhiều API trả về cấu trúc khác nhau - xử lý linh hoạt
  //     let loaded: Product[] = [];
  //     if (Array.isArray(data) && data.length > 1 && (data[0] as any).status === true) {
  //       loaded = data.slice(1);
  //     } else if (data.products) {
  //       loaded = data.products;
  //     } else if (Array.isArray(data)) {
  //       loaded = data;
  //     } else {
  //       loaded = [];
  //     }

  //     // đảm bảo mỗi product có variants mảng
  //     const normalized = loaded.map((p: any) => ({ ...p, variants: p.variants ?? [] }));
  //     setProducts(normalized);
  //     setNoProduct(normalized.length === 0);
  //     setCurrentPage(1); // reset page mỗi khi load
  //   } catch (error) {
  //     console.error("Lỗi khi lấy sản phẩm:", error);
  //     setProducts([]);
  //     setNoProduct(true);
  //   }
  // };

  // // gọi loadProducts khi filterChild hoặc selectedChild thay đổi
  // useEffect(() => {
  //   loadProducts();
  // }, [filterChild, selectedChild]);

  // Flatten variants nếu BE trả dạng bọc
  const normalizeProducts = (items: any[]) =>
    items.map((p: any) => ({
      ...p,
      variants: Array.isArray(p?.variants?.[0]?.variants)
        ? p.variants.flatMap((vw: any) => vw.variants || [])
        : (p.variants || []),
    }));

  const loadProducts = async () => {
    // ❗️Đợi có shopId rồi mới gọi
    if (!shopId) {
      setProducts([]);
      setNoProduct(true);
      return;
    }

    try {
      // ✅ GHÉP URL ĐÚNG: có dấu /
      // Lấy tất cả sản phẩm của shop, kể cả bị ẩn
      let url = `${API_BASE}products/shop/${encodeURIComponent(shopId)}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Hỗ trợ nhiều format trả về
      let loaded: any[] = [];
      if (Array.isArray(data) && data.length > 1 && data[0]?.status === true) {
        loaded = data.slice(1);
      } else if (Array.isArray(data?.products)) {
        loaded = data.products;
      } else if (Array.isArray(data)) {
        loaded = data;
      }

      // Chuẩn hoá variants
      let list = normalizeProducts(loaded);

      // Nếu có chọn danh mục con → lọc ở FE
      const childToUse = filterChild || selectedChild;
      if (childToUse) {
        list = list.filter(
          (p: any) => String(p?.category_id?.categoryId) === String(childToUse)
        );
      }

      setProducts(list);
      setNoProduct(list.length === 0);
      setCurrentPage(1);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
      setNoProduct(true);
    }
  };

  // 👉 Gọi khi shopId sẵn sàng (và khi đổi bộ lọc)
  useEffect(() => {
    if (!shopId) return;         // quan trọng: tránh gọi khi null
    loadProducts();
  }, [shopId, filterChild, selectedChild]);

  // --- TÌM KIẾM ---
  // const handleSearch = async () => {
  //   if (!searchKeyword.trim()) {
  //     await loadProducts();
  //     return;
  //   }
  //   try {
  //     const encodedKeyword = encodeURIComponent(searchKeyword.trim());
  //     const url = `${API_BASE}products/search?name=${encodedKeyword}`;
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error("Lỗi khi tìm kiếm");
  //     const data = await res.json();
  //     // nhiều API trả về mảng trực tiếp
  //     const found = Array.isArray(data) ? data : data.products ?? [];
  //     const updatedData = (found || []).map((product: any) => ({
  //       ...product,
  //       variants: product.variants ?? [],
  //     }));
  //     setProducts(updatedData);
  //     setNoProduct(updatedData.length === 0);
  //     setCurrentPage(1);
  //   } catch (error) {
  //     console.error("Lỗi khi tìm kiếm sản phẩm:", error);
  //     setProducts([]);
  //     setNoProduct(true);
  //   }
  // };
  function extractProducts(data: any): Product[] {
    if (Array.isArray(data) && data.length > 1 && data[0]?.status === true) return data.slice(1);
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data)) return data;
    return [];
  }
  const normalize = (s: string = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const tokenize = (kw: string) =>
    normalize(kw).split(/\s+/).filter(Boolean);


  const loadShopProducts = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}products/shop/${shopId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const list = extractProducts(raw).map(p => ({ ...p, variants: p.variants ?? [] }));
      setAllProducts(list);
      // áp bộ lọc lần đầu
      applyFilters(list);
    } catch (e) {
      console.error(e);
      setAllProducts([]);
      setProducts([]);
      setNoProduct(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (src = allProducts) => {
    const catId = filterChild || selectedChild;
    const tokens = tokenize(searchKeyword.trim());

    let list = src;

    if (catId) {
      list = list.filter(p => String(p?.category_id?.categoryId) === String(catId));
    }

    if (tokens.length) {
      list = list.filter(p => {
        const text = normalize(
          `${p?.name || ""} ${p?.description || ""} ${p?.category_id?.categoryName || ""} ${p?.material || ""}`
        );
        // tất cả token đều xuất hiện (không cần liền nhau)
        return tokens.every(t => text.includes(t));
      });
    }

    setProducts(list);
    setNoProduct(list.length === 0);
    setCurrentPage(1); // về trang đầu khi đổi kết quả
  };


  useEffect(() => { if (shopId) loadShopProducts(); }, [shopId]);
  useEffect(() => { applyFilters(); }, [filterChild, selectedChild, searchKeyword, allProducts]);


  const handleSearch = () => {
    applyFilters(); // không fetch, chỉ lọc từ allProducts
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
      const res = await fetch(`${API_BASE}products/${productId}`);
      if (!res.ok) throw new Error("Không lấy được chi tiết sản phẩm");
      const data = await res.json();
      setSelectedProduct(data);
      setShowStockForm(true);
    } catch (err) {
      alert("Lỗi khi lấy chi tiết sản phẩm");
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

  const handleSaveSize = () => {
    const trimmedSize = sizeInput.trim();
    if (!trimmedSize || quantityInput <= 0) return;

    const isDuplicate = sizes.some(
      (s, i) =>
        s.size.toLowerCase() === trimmedSize.toLowerCase() &&
        i !== editingSizeIndex
    );
    if (isDuplicate) {
      alert("Size này đã được thêm rồi!");
      return;
    }

    let updatedSizes = [...sizes];

    if (editingSizeIndex !== null) {
      updatedSizes[editingSizeIndex] = { size: trimmedSize, quantity: quantityInput };
    } else {
      updatedSizes.push({ size: trimmedSize, quantity: quantityInput });
    }

    setSizes(updatedSizes);
    setSizeInput("");
    setQuantityInput(1);
    setEditingSizeIndex(null); // reset mode sửa
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

    // Lấy mã màu từ chuỗi "TênMàu MãMàu" → ví dụ: "Trắng SW001"
    const colorParts = currentColor.trim().split(" ");
    const colorCode = colorParts[colorParts.length - 1]; // SW001

    // Thêm sku cho từng size
    const updatedSizes = sizes.map((s) => ({
      ...s,
      sku: `${colorCode}-${s.size}`, // ví dụ: SW001-104
    }));

    const newVariant: Variant = {
      color: currentColor,
      sizes: updatedSizes,
    };

    console.log("Biến thể mới được thêm:", newVariant);

    setVariants((prev) => {
      const updated = [...prev, newVariant];
      console.log("Danh sách biến thể hiện tại:", updated);
      return updated;
    });

    // Reset sau khi thêm
    setCurrentColor("");
    setSizes([]);
  };

function updateProductLocal(productId: string, newVariants: any[]) {
  // cập nhật list đang hiển thị
  setProducts(prev =>
    prev.map(p => (p._id === productId ? { ...p, variants: newVariants } : p))
  );

  // nếu bạn có allProducts dùng để lọc/ tìm kiếm
  setAllProducts(prev =>
    prev.map(p => (p._id === productId ? { ...p, variants: newVariants } : p))
  );

  // nếu đang mở form chi tiết của sản phẩm
  setSelectedProduct(prev =>
    prev && prev._id === productId ? { ...prev, variants: newVariants } : prev
  );

  // nếu bạn có hàm applyFilters dựa trên allProducts thì gọi lại
  // applyFilters([...]) // không bắt buộc nếu useEffect đã theo dõi allProducts
}


  // Hàm xử lý lưu thay đổi số lượng nhập hàng
async function handleSaveStockChange() {
  if (!selectedProduct) return;

  // 1) GHÉP variants mới từ số lượng thêm
  const updatedVariants =
    selectedProduct.variants?.flatMap((vw: any) =>
      (vw.variants ?? [vw]).map((v: any) => ({
        ...v,
        sizes: (v.sizes ?? []).map((s: any) => {
          const key = `${v._id ?? v.color}-${s._id ?? s.size}`;
          const add = Number(addedQuantities[key]) || 0;
          return { ...s, quantity: (s.quantity || 0) + add };
        })
      }))
    ) ?? [];

  // 2) Biến thể mới đang tạo ở state `variants`
  const newVariants = variants || [];

  // 3) Hợp nhất để gửi lên BE
  const allVariants = [...updatedVariants, ...newVariants];
  const payload = { variants: allVariants };

  try {
    const res = await fetch(
      `${API_BASE}products/variants/${selectedProduct._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) throw new Error(await res.text());

    // (khuyến nghị) nếu BE trả về sản phẩm/variants mới → dùng luôn
    let mergedVariants = allVariants;
    try {
      const data = await res.json();
      mergedVariants =
        data?.product?.variants ??
        data?.variants ??
        mergedVariants;
    } catch (_) {
      // BE không trả JSON hoặc không có body → giữ mergedVariants như cũ
    }

    // ✅ Cập nhật UI ngay lập tức, không reload
    updateProductLocal(selectedProduct._id, mergedVariants);

    // reset form
    setAddedQuantities({});
    setVariants([]);
    setShowStockForm(false);

    // (tùy chọn) nếu bạn vẫn muốn đồng bộ lại từ server:
    // loadShopProducts(); // hoặc loadProducts() của bạn
    alert("Cập nhật thành công!");
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
              onClick={() => {
                setShowStockForm(false);
                setCurrentColor("");
                setSizes([]);
                setVariants([]); // reset danh sách biến thể mới
                setEditingSizeIndex(null);
                setSizeInput("");
                setQuantityInput(1);
              }} // Click ra ngoài để đóng
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
                <div className={styles.variantSectionadd}>
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
                    <button type="button" onClick={handleSaveSize}>
                      {editingSizeIndex !== null ? "Lưu size" : "Thêm size"}
                    </button>
                  </div>
                  <ul className={styles.sizePreviewList}>
                    {sizes.map((s, idx) => (
                      <li key={idx} className={styles.sizePreviewItem}>
                        <span className={styles.sizeText}>
                          Size: {s.size} - SL: {s.quantity}
                        </span>
                        <div className={styles.buttonGroup}>
                          <button
                            className={styles.editButton}
                            type="button"
                            onClick={() => {
                              setEditingSizeIndex(idx);
                              setSizeInput(s.size);
                              setQuantityInput(s.quantity);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className={styles.deleteButton}
                            type="button"
                            onClick={() => {
                              setSizes(prev => prev.filter((_, i) => i !== idx));
                              if (editingSizeIndex === idx) {
                                setEditingSizeIndex(null);
                                setSizeInput("");
                                setQuantityInput(1);
                              }
                            }}
                          >
                            Xóa
                          </button>
                        </div>

                      </li>
                    ))}
                  </ul>
                  <div className={styles.actionBtnadd}>
                    <button
                      className={styles.actionBtnaddvariant}
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!currentColor || sizes.length === 0}
                    >
                      Thêm biến thể mới
                    </button>
                  </div>
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
                  {variants.map((v, idx) => (
                    <div className={styles.variantRow} key={`new-${idx}`}>
                      <div className={styles.colorBlock}>
                        <span
                          className={styles.colorCircle}
                          style={{ backgroundColor: v.color }}
                        ></span>
                        <strong>Màu mới: {v.color}</strong>
                      </div>
                      <ul className={styles.sizeList}>
                        {v.sizes.map((s, i) => (
                          <li key={i} className={styles.sizeItem}>
                            <div className={styles.sizeItemOld}>
                              <strong>Size:</strong> {s.size} - <strong>SL:</strong> {s.quantity}
                            </div>
                            {/* Không cần nhập thêm vì đây là số lượng mới */}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.buttonGroupend}>
                <button className={styles.actionBtnclose} onClick={() => {
                  setShowStockForm(false);
                  setCurrentColor("");
                  setSizes([]);
                  setVariants([]);
                  setEditingSizeIndex(null);
                  setSizeInput("");
                  setQuantityInput(1);
                }}>Đóng</button>
                <button
                  className={styles.actionBtnend}
                  onClick={handleSaveStockChange}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </>
        )}

      </section>
    </main>
  );
}
