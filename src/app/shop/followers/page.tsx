"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/app/component/S-Sidebar";
import Topbar from "@/app/component/Topbar";
import styles from "./users.module.css";
import { useRouter } from "next/navigation";

type Follower = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://fiyo-be.onrender.com/api/";

const imgUrl = (src?: string) =>
  src ? (src.startsWith("http") ? src : `${API_BASE}images/${src}`) : "/placeholder-user.png";

export default function FollowersSimplePage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== Guard: login & role =====
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
    } catch {
      router.push("/warning-login");
    }
  }, [router]);

  // ===== Lấy shopId theo user_id =====
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
        const id = data?.shop?._id ?? data?.shopId ?? data?._id;
        if (id) setShopId(String(id));
      } catch (err) {
        console.error("Lỗi lấy shopId:", err);
      }
    })();
  }, []);

  // ===== Lấy toàn bộ followers (đơn giản) =====
  useEffect(() => {
    const run = async () => {
      if (!shopId) return;
      setLoading(true);
      setError(null);

      try {
        // Ưu tiên gọi all=true để nhận toàn bộ followers
        const urlAll = `${API_BASE}shop/${shopId}/followers?all=true`;
        let res = await fetch(urlAll, { cache: "no-store" });
        let data: any = await res.json();

        let items: Follower[] | undefined =
          data?.items ?? data?.followers;

        // Fallback nếu BE chưa hỗ trợ all=true
        if (!res.ok || (!Array.isArray(items) && !data?.total && !data?.followers_count)) {
          const url500 = `${API_BASE}shop/${shopId}/followers?page=1&limit=500`;
          res = await fetch(url500, { cache: "no-store" });
          data = await res.json();
          items = data?.items ?? data?.followers ?? [];
        }

        const list = Array.isArray(items) ? items : [];
        setFollowers(list);
        setTotal(
          data?.total ??
          data?.total_followers ??
          (Array.isArray(data?.followers) ? data.followers.length : list.length)
        );
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Lỗi tải followers");
        setFollowers([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [shopId]);

  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.content}>
        <Topbar />

        <div className={styles.usertList}>
          <h2 className={styles.userListTitle}>
            Danh sách Followers {total ? `(${total})` : ""}
          </h2>

          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2}>Đang tải…</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={2} style={{ color: "crimson" }}>{error}</td>
                </tr>
              ) : followers.length === 0 ? (
                <tr>
                  <td colSpan={2}>Shop hiện chưa có follower nào.</td>
                </tr>
              ) : (
                followers.map((u) => (
                  <tr key={u._id}>
                    <td className={styles.userInfo}>
                      <div className={styles.userBox}>
                        {u.avatar ? (
                          <img
                            src={imgUrl(u.avatar)}
                            alt={u.name || "Follower"}
                            className={styles.avatar}
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder-user.png";
                            }}
                          />
                        ) : (
                          <div className={styles.avatarFallback}>
                            {(() => {
                              const name = u.name || "U";
                              return name
                                .trim()
                                .split(/\s+/)
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            })()}
                          </div>
                        )}

                        <div className={styles.userMeta}>
                          <div className={styles.userName} title={u.name || "Follower"}>
                            {u.name || "Follower"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.email ? (
                        <span className={styles.userEmail} title={u.email}>
                          {u.email}
                        </span>
                      ) : (
                        "-"
                      )}
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
