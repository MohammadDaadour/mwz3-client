"use client";

import { facebookAuth } from "@/libs/actions";
import { Box, Center, LoadingOverlay, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function FacebookRedirect() {
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParam = searchParams?.get("code") ?? undefined;


  async function handleLogin(token: string) {
    const res = await facebookAuth(token);
    if (res === 200) {
      router.push("/");
      router.refresh();
    }
  }

  useEffect(() => {
    if (currentParam) {
      handleLogin(currentParam);
    }
  }, []);

  return (
    <>
      <Center>
        <Text fw={500} fz='h3' my='xl'>
          {t("fbLoading")}
        </Text>
      </Center>
      <Box pos='relative' w='full' h='100px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    </>
  );
}
