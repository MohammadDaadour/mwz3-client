"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderByIdAction, updateOrderStatusAction, getAdByIdAction, getAdImage } from "@/libs/actions";

type Props = { params: { locale: string } };

type OrderDetails = {
    id: number;
    createdAt: string;
    totalAmount: number;
    items: { productId: number; quantity: number; price: number }[];
    status: string;
};

type OrderAds = {
    id: number;
    label: string;
    description: string;
    image: number;
    imageUrl?: string; // Add imageUrl to store the fetched image URL
}

export default function OrderPage({ params: { locale } }: Props) {
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [ads, setAds] = useState<OrderAds[]>([]);
    const params = useParams<{ id: string }>();

    // Move the early return AFTER all hooks
    useEffect(() => {
        // Guard clause inside useEffect instead
        if (!params || !params.id) {
            return;
        }

        const { id } = params;

        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const orderDetails = await getOrderByIdAction(id);
                setOrder(orderDetails);
                console.log(order)
                const adDetailsPromises = orderDetails.items.map(async (item: any) => {
                    const adDetails = await getAdByIdAction(item.productId);
                    const imageUrl = await getAdImage(adDetails.image);
                    return { ...adDetails, imageUrl };
                });

                const adDetails = await Promise.all(adDetailsPromises);
                setAds(adDetails);
                console.log(adDetails);

            } catch (error) {
                console.error("Error fetching order or ad details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [params]);

    // Now the early return comes after all hooks
    if (!params || !params.id) {
        return <div>Invalid order ID</div>;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {loading ? (
                <p>Loading...</p>
            ) : order ? (
                <div>
                    <div>Order ID: {order.id}</div>
                    <div>Order Date: {order.createdAt}</div>
                    <div>Order Total: {order.totalAmount} EGP</div>
                    <ul>
                        {order?.items?.map((item: any, index) => (
                            <li key={index}>
                                <div style={{ display: "flex", justifyContent: "center", border: "solid 1px gray", padding: "10px", borderRadius: "20px", maxWidth: "500px" }}>
                                    {ads[index] && (
                                        <>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <div>{ads[index].label} </div>
                                                <div>Quantity: {item.quantity}</div>
                                                <div> Price: {item.price * item.quantity} EGP</div>
                                                <div>Order Status: {order.status}</div>
                                            </div>
                                            <img style={{ width: "200px" }} src={`${process.env.API_URL}/images/ads/${ads[index].id}/${ads[index].image}`} alt={ads[index].label} />
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            ) : (
                <p>Order not found.</p>
            )}
        </div>
    );
}