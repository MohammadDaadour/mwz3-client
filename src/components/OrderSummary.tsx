"use client";

import { useEffect, useState } from "react";
import { Paper, Title, Stack, Group, Text, Divider, Loader, Center } from "@mantine/core";
import { useTranslations } from "next-intl";

type CartItem = {
    id: number;
    title: string;
    price: number;
    quantity: number;
    image: string;
};

type Props = {
    locale: string;
};

export function OrderSummary({ locale }: Props) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("Checkout");

    useEffect(() => {
        // Load cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(cartItems);
        setLoading(false);
    }, []);



    if (loading) {
        return (
            <Paper withBorder p="md">
                <Center h={200}>
                    <Loader />
                </Center>
            </Paper>
        );
    }

    if (items.length === 0) {
        return (
            <Paper withBorder p="md">
                <Stack align="center" gap="md" py="xl">
                    <Text size="lg">{t("emptyCart") || "Your cart is empty"}</Text>
                </Stack>
            </Paper>
        );
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 10; // Example shipping cost
    const total = subtotal + shipping;

    return (
        <Paper withBorder p="md">
            <Title order={3} mb="lg">{t("orderSummary") || "Order Summary"}</Title>

            <Stack gap="sm">
                {items.map((item) => (
                    <Group key={item.id} justify="apart">
                        <Text>
                            {item.title} x {item.quantity}
                        </Text>
                        <Text>{item.price * item.quantity}</Text>
                    </Group>
                ))}

                <Divider my="sm" />

                <Group justify="apart">
                    <Text>{t("subtotal") || "Subtotal"}</Text>
                    <Text>{subtotal}</Text>
                </Group>

                <Group justify="apart">
                    <Text>{t("shipping") || "Shipping"}</Text>
                    <Text>{shipping}</Text>
                </Group>

                <Divider my="sm" />

                <Group justify="apart">
                    <Text fw={700}>{t("total") || "Total"}</Text>
                    <Text fw={700} size="lg">{total}</Text>
                </Group>
            </Stack>
        </Paper>
    );
}