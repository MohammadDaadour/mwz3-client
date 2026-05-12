"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrdersAction, updateOrderStatusAction } from "@/libs/actions";
import { Modal, Button } from "@mantine/core"; // Added Button import
import { useDisclosure } from "@mantine/hooks";

import { OrderStatus } from "@/components/order-status";

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
};

type Props = { params: { locale: string } };

// OrderStatusForm component with proper error handling
type OrderStatusFormProps = {
  orderId: number;
  currentStatus: OrderStatus;
  onUpdate: (orderId: number, newStatus: OrderStatus) => Promise<void>;
};

function OrderStatusForm({ orderId, currentStatus, onUpdate }: OrderStatusFormProps) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: OrderStatus) => {
    if (status === currentStatus) return; // Don't update if same status
    
    setUpdating(true);
    try {
      await onUpdate(orderId, status);
    } catch (error) {
      console.error("Error in OrderStatusForm:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <p>Current Status: <strong>{currentStatus}</strong></p>
      <p>Select new status:</p>
      {Object.values(OrderStatus).map((status) => (
        <Button
          key={status}
          onClick={() => handleStatusChange(status)}
          variant={status === currentStatus ? 'filled' : 'outline'}
          style={{ margin: '4px' }}
          disabled={updating || status === currentStatus}
          loading={updating}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}

export default function UserOrders({ params }: Props) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orders = await getAllOrdersAction();
        console.log("Fetched orders:", orders); // Debug log
        setOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateClick = (order: Order) => {
    console.log("Opening modal for order:", order); // Debug log
    setSelectedOrder(order);
    setUpdateError(null);
    open();
  };

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus): Promise<void> => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`); // Debug log
    
    try {
      // Call the update action
      const result = await updateOrderStatusAction(orderId, newStatus);
      console.log("Update result:", result); // Debug log

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      console.log("Local state updated successfully"); // Debug log
      close();
    } catch (error) {
      console.error("Error updating order status:", error);
      setUpdateError(error instanceof Error ? error.message : "Failed to update order status");
      throw error; // Re-throw to handle in OrderStatusForm
    }
  };

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
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Order Status</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
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
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: getStatusColor(item.status),
                    color: 'white',
                    textTransform: 'capitalize'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td 
                  style={{ 
                    border: "1px solid #ddd", 
                    padding: "8px", 
                    backgroundColor: "darkorange", 
                    color: "white", 
                    cursor: "pointer",
                    textAlign: "center"
                  }} 
                  onClick={() => handleUpdateClick(item)}
                >
                  Update
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal opened={opened} onClose={close} title="Update Order Status" size="md">
        {updateError && (
          <div style={{ 
            color: 'red', 
            backgroundColor: '#ffebee', 
            padding: '8px', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            Error: {updateError}
          </div>
        )}
        {selectedOrder && (
          <OrderStatusForm
            orderId={selectedOrder.id}
            currentStatus={selectedOrder.status}
            onUpdate={handleStatusUpdate}
          />
        )}
      </Modal>
    </div>
  );
}

// Helper function to get status colors
function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return '#ff9800';
    case OrderStatus.PROCESSING:
      return '#2196f3';
    case OrderStatus.SHIPPED:
      return '#9c27b0';
    case OrderStatus.COMPLETED:
      return '#4caf50';
    case OrderStatus.DELIVERED:
      return '#4caf50';
    case OrderStatus.CANCELLED:
      return '#f44336';
    default:
      return '#757575';
  }
}