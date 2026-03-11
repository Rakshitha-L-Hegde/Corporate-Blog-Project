"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHome() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const res = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            credentials: "include"
          }
        );

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (data.user.role !== "ADMIN") {
          router.push("/login");
          return;
        }

        setLoading(false);

      } catch {
        router.push("/login");
      }

    };

    checkAuth();

  }, [router]);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the Corporate Blog CMS.</p>
    </div>
  );
}