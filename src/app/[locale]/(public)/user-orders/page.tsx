"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ Next.js Link
import { getUserOrdersAction } from "@/libs/actions";
import { Table } from "@mantine/core";

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
};

type Props = { params: { locale: string } };

export default function UserOrders({ params }: Props) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const orders = await getUserOrdersAction();
      setOrders(orders);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>User Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Order ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Order Date</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Order Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <Link href={`/orders/${item.id}`} style={{ textDecoration: 'none', color: 'blue' }}>
                    #{item.id}
                  </Link>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  EGP{item.totalAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
