// "use client";

// import { Box, Title, Container, Stack, Text, Button, Group, Divider, Paper, TextInput, Textarea, Select } from "@mantine/core";
// // import { useTranslations } from "next-intl";
// // import { Link, useRouter } from "@/navigation";
// import { CheckoutForm } from "@/components/CheckoutForm";
// import { OrderSummary } from "@/components/OrderSummary";
// import { use, useContext, useEffect } from "react";
// import { AppContext } from "@/providers";

// type Props = {
//   params: { locale: string };
// };

// export default async function CheckoutPage({ params: { locale } }: Props) {
//   // const t = useTranslations("Checkout");
//   // const router = useRouter();
//   const context = useContext(AppContext); // Custom hook to check authentication status

//   // useEffect(() => {
//   //   if (context.user.id === 0) {
//   //     router.push(`/login`); // Redirect to login page if not authenticated
//   //   }
//   // }, [context, locale, router]);

//   // if (context.user.id === 0) {
//   //   return null; // Optionally, render nothing or a loading spinner while redirecting
//   // }

//   return (
//     <Container size="lg" py="xl">
//       <Title order={1} mb="lg">
//         {/* {t("checkout") || "Checkout"} */}
//       </Title>

//       <Group align="flex-start" gap="xl" grow>
//         <CheckoutForm locale={locale} />
//         <OrderSummary locale={locale} />
//       </Group>
//     </Container>
//   );
// }

export default async function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
    </div>
  );
}