"use client";

import { Button } from "@mantine/core";
import { useContext } from "react";
import { AppContext } from "@/providers";
import { notifications } from "@mantine/notifications";

type Props = {
  cartItems: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
};

export function CheckoutButton({ cartItems }: Props) {
  const context = useContext(AppContext);

  // const handleCheckout = async () => {
    // try {
    //   const userId = context.user?.id || 0;
    //   const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Initialize payment with Paymob
    //   const response = await fetch('http://localhost:3200/payment/initiate', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     credentials: 'include',
    //     body: JSON.stringify({
    //       amount: totalAmount * 100, // Convert to cents
    //       userId: userId,
    //       cartItems: cartItems,
    //       billingData: {
    //         first_name: context.user?.name || 'Guest',
    //         last_name: '',
    //         email:  'guest@example.com',  // context.user?.email 
    //         phone_number:'', // context.user?.phone 
    //         apartment: 'NA',
    //         floor: 'NA',
    //         street: 'NA',
    //         building: 'NA',
    //         shipping_method: 'NA',
    //         postal_code: 'NA',
    //         city: 'NA',
    //         country: 'NA',
    //         state: 'NA'
    //       }
    //     })
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json().catch(() => ({}));
    //     throw new Error(errorData.message || 'Failed to initialize payment');
    //   }

    //   const data = await response.json();
      
    //   // Redirect to Paymob iframe
    //   if (data.iframeUrl) {
    //     window.location.href = data.iframeUrl;
    //   } else {
    //     throw new Error('No payment URL received');
    //   }

    // } catch (error) {
    //   console.error('Checkout error:', error);
    //   notifications.show({
    //     title: 'Error',
    //     message: error instanceof Error ? error.message : 'Failed to process checkout',
    //     color: 'red'
    //   });
    // }
  
    let e
  return (
    <Button 
      fullWidth 
      onClick={e}
      disabled={cartItems.length === 0}
    >
      Checkout
    </Button>
  );
} 