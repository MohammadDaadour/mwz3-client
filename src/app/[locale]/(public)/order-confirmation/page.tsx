"use client";

import { useEffect, useState } from "react";
import { Container, Title, Paper, Text, Stack, Group, Button, Divider, ThemeIcon, Center, Loader } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { IconCheck, IconArrowLeft, IconShoppingCart } from "@tabler/icons-react";

type Props = {
  params: { locale: string };
};

export default function OrderConfirmationPage({ params: { locale } }: Props) {
  const t = useTranslations("OrderConfirmation");
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the order number from URL query params or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = searchParams.get("orderId");
    
    if (orderIdFromUrl) {
      setOrderNumber(orderIdFromUrl);
    } else {
      // If no order ID in URL, check localStorage for recently placed order
      const recentOrder = localStorage.getItem("recentOrder");
      if (recentOrder) {
        setOrderNumber(recentOrder);
        localStorage.removeItem("recentOrder"); // Clear after retrieving
      }
    }
    
    setLoading(false);
    
    // Simulate order processing delay for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center style={{ height: "60vh" }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg">{t("processingOrder") || "Processing your order..."}</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="xl">
          <ThemeIcon size={80} radius={100} color="green">
            <IconCheck size={50} />
          </ThemeIcon>
          
          <Title order={1} ta="center">
            {t("thankYou") || "Thank You for Your Order!"}
          </Title>
          
          {orderNumber && (
            <Text size="lg" ta="center">
              {t("orderNumber", { orderNumber }) || `Order #${orderNumber}`}
            </Text>
          )}
          
          <Text ta="center" c="dimmed" size="md">
            {t("confirmationMessage") || 
              "We've received your order and are processing it now. You'll receive a confirmation email shortly with your order details."}
          </Text>
          
          <Divider w="100%" />
          
          <Text fw={500} size="lg">
            {t("whatHappensNext") || "What happens next?"}
          </Text>
          
          <Stack gap="md" w="100%">
            <Group>
              <ThemeIcon radius="xl" size="md" color="blue">1</ThemeIcon>
              <Text>{t("step1") || "We're preparing your order for shipment."}</Text>
            </Group>
            
            <Group>
              <ThemeIcon radius="xl" size="md" color="blue">2</ThemeIcon>
              <Text>{t("step2") || "You'll receive updates on your order status via email."}</Text>
            </Group>
            
            <Group>
              <ThemeIcon radius="xl" size="md" color="blue">3</ThemeIcon>
              <Text>{t("step3") || "Once your order is on its way, we'll send you tracking information."}</Text>
            </Group>
          </Stack>
          
          <Group mt="xl">
            <Button 
              leftSection={<IconArrowLeft size={16} />} 
              variant="outline"
              onClick={() => router.push(`/${locale}`)}
            >
              {t("continueShopping") || "Continue Shopping"}
            </Button>
            
            <Button 
              leftSection={<IconShoppingCart size={16} />}
              onClick={() => router.push(`/user-orders`)}
            >
              {t("viewOrders") || "View My Orders"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}