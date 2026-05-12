"use client";

import { Button } from "@mantine/core";
import { useContext } from "react";
import { AppContext } from "@/providers";
import { notifications } from "@mantine/notifications";

type CartItem = {
  id: number;
  price: number;
  quantity: number;
  image: string;
  title: string;
};

type Props = {
  item: {
    id: number;
    title: string;
    value: number;
    image: string;
  }
};

export function AddToCartButton({ item }: Props) {
  const context = useContext(AppContext);

  const userId = context.user?.id;

  const handleAddToCart = async () => {

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    const existingItemIndex = cartItems.findIndex((i: CartItem) => i.id === item.id);

    if (existingItemIndex !== -1) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id: item.id,
        price: item.value,
        quantity: 1,
        image: item.image,
        title: item.title,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));

    notifications.show({
      title: 'Success',
      message: 'Item added to cart',
      color: 'green'
    });
    // if (userId != 0) {
    //   try {
    //     const response = await fetch(`${process.env.API_URL}/cart/add`, { // http://localhost:3200
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       credentials: 'include',
    //       body: JSON.stringify({
    //         userId: userId,
    //         ad_id: item.id,
    //         quantity: 1
    //       })
    //     });

    //     if (!response.ok) {
    //       const errorData = await response.json().catch(() => ({}));
    //       throw new Error(errorData.message || 'Failed to add item to cart');
    //     }

    //     const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    //     const existingItemIndex = cartItems.findIndex((i: CartItem) => i.id === item.id);

    //     if (existingItemIndex !== -1) {
    //       cartItems[existingItemIndex].quantity += 1;
    //     } else {
    //       cartItems.push({
    //         id: item.id,
    //         price: item.value,
    //         quantity: 1
    //       });
    //     }

    //     localStorage.setItem('cart', JSON.stringify(cartItems));

    //     notifications.show({
    //       title: 'Success',
    //       message: 'Item added to cart',
    //       color: 'green'
    //     });
    //   } catch (error) {
    //     console.error('Cart error:', error);
    //     notifications.show({
    //       title: 'Error',
    //       message: error instanceof Error ? error.message : 'Failed to add item to cart',
    //       color: 'red'
    //     });
    //   }
    // }
    // else {
    //   const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    //   const existingItemIndex = cartItems.findIndex((i: CartItem) => i.id === item.id);

    //   if (existingItemIndex !== -1) {
    //     cartItems[existingItemIndex].quantity += 1;
    //   } else {
    //     cartItems.push({
    //       id: item.id,
    //       price: item.value,
    //       quantity: 1
    //     });
    //   }

    //   localStorage.setItem('cart', JSON.stringify(cartItems));

    //   notifications.show({
    //     title: 'Success',
    //     message: 'Item added to cart',
    //     color: 'green'
    //   });
    // }

  };

  return (
    <Button onClick={handleAddToCart}>أضف للعربة</Button>
  );
}