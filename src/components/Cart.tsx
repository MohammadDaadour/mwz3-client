"use client";

import { Box, Button, Flex, Group, Image, Stack, Text, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { CheckoutButton } from "./CheckoutButton";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { IImage } from "@/interfaces";
import { modals } from "@mantine/modals";

type CartItem = {
  adId: number;
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  product?: {
    id: number;
    title: string;
    value: number;
    image: string;
  }
};

type ServerCartResponse = {
  id: number;
  userId: number;
  items: CartItem[];
};

type CartProps = {
  auth: {
    success: boolean;
    user?: {
      id: number;
    };
  };
};


async function getImages(id: number) {
  const result = await fetch(`${process.env.API_URL}/images/ads/${id}/meta`);
  return result.json();
}

export function Cart({ auth }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.user?.id;

  useEffect(() => {
    const fetchCart = async () => {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(Array.isArray(localCart) ? localCart : []);
      setLoading(false);
      console.log('local cart', localCart);
      return;
      // if (auth.user?.id == 0) {
      //   const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      //   setCartItems(Array.isArray(localCart) ? localCart : []);
      //   setLoading(false);
      //   return;
      // } else {
      //   try {
      //     const response = await fetch(`${process.env.API_URL}/cart/${userId}`, {
      //       credentials: 'include'
      //     });

      //     if (response.ok) {
      //       const data: ServerCartResponse = await response.json();
      //       const items = await Promise.all(data.items.map(async (item) => {
      //         const images: IImage[] = await getImages(item.adId);
      //         const imgId = images[0].id;
      //         return {
      //           id: item.id,
      //           title: item.title || 'title',
      //           price: item.price,
      //           quantity: item.quantity,
      //           image: `${process.env.API_URL}/images/ads/${item.adId}/${imgId}` || 'https://placehold.co/80x80'
      //         };
      //       }));

      //       setCartItems(items.map(item => ({
      //         ...item,
      //         adId: item.id 
      //       })));
      //     } else {
      //       const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      //       setCartItems(Array.isArray(localCart) ? localCart : []);
      //     }
      //   } catch (error) {
      //     console.error('Error fetching cart:', error);
      //     const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      //     setCartItems(Array.isArray(localCart) ? localCart : []);
      //   }

      //   setLoading(false);
      // }
    }

    fetchCart();
  }, [auth.user?.id]);

  const removeItem = async (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cartItems.filter((item: { id: number }) => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

    // if (auth.user?.id == 0) {
    //   setCartItems(prev => prev.filter(item => item.id !== itemId));
    //   const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    //   const updatedCart = cartItems.filter((item: { id: number }) => item.id !== itemId);
    //   localStorage.setItem('cart', JSON.stringify(updatedCart));
    // }
    // else {
    //   try {
    //     const userId = auth.user?.id || 0;

    //     const response = await fetch(`${process.env.API_URL}/cart/remove/${userId}/${itemId}`, {
    //       method: 'DELETE',
    //       credentials: 'include'
    //     });

    //     if (!response.ok) {
    //       throw new Error('Failed to remove item from cart');
    //     }

    //     // Update local state and localStorage
    //     setCartItems(prev => prev.filter(item => item.id !== itemId));
    //     const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    //     const updatedCart = cartItems.filter((item: { id: number }) => item.id !== itemId);
    //     localStorage.setItem('cart', JSON.stringify(updatedCart));

    //     // Show success notification
    //     notifications.show({
    //       title: 'Success',
    //       message: 'Item removed from cart',
    //       color: 'green'
    //     });
    //   } catch (error) {
    //     console.error('Error removing item:', error);
    //     notifications.show({
    //       title: 'Error',
    //       message: 'Failed to remove item from cart',
    //       color: 'red'
    //     });
    //   }
    // }
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  return (
    <Stack gap="md">
      <Title order={4}>Shopping Cart</Title>

      {loading ? (
        <Text>Loading cart...</Text>
      ) : (
        <>
          {/* Cart Items */}
          <Box>
            {safeCartItems.length === 0 ? (
              <Text c="dimmed">Your cart is empty</Text>
            ) : (
              safeCartItems.map((item) => (
                <Flex key={item.id} gap="md" align="center" mb="md" justify="space-between">
                  <Image
                    src={item.image}
                    height={80} // Adjusted height
                    width={80}  // Adjusted width
                    fallbackSrc="https://placehold.co/80x80" // Adjusted fallback size
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <Stack gap="xs" style={{ flexGrow: 1 }}>
                    <Text fw={500}>{item.title}</Text>
                    <Text size="sm" c="dimmed">Quantity: {item.quantity}</Text>
                    <Text>EGP {item.price}</Text>
                  </Stack>
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => removeItem(item.id)}
                  >
                    <IconTrash size={20} />
                  </Button>
                </Flex>
              ))
            )}
          </Box>

          {/* Cart Summary */}
          {safeCartItems.length > 0 && (
            <Box>
              <Group justify="space-between" mb="xs">
                <Text>Subtotal:</Text>
                <Text fw={500}>
                  EGP {safeCartItems.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                  }, 0).toFixed(2)}
                </Text>
              </Group>
              <Link href={userId ? '/checkout' : '/login'} passHref>
                <Button
                  fullWidth
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    modals.closeAll(); // This will close the modal
                    if (!userId) {
                      notifications.show({
                        title: 'Login Required',
                        message: 'Please log in to proceed to checkout.',
                        color: 'red',
                      });
                    }
                  }}
                >
                  Checkout
                </Button>
              </Link>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}