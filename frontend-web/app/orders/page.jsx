"use client";

import { useRouter } from "next/navigation";
import "../styles.css"; // Adjust the path based on the actual location of styles.css

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="container">
      <h1>Orders Page</h1>
      <button onClick={() => router.push("/")}>Go to Home</button>
    </div>
  );
}
