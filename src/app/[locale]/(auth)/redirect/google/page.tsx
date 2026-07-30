"use client";

import { googleAuth } from "@/libs/actions";
import { Box, Center, LoadingOverlay, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleRedirect() {  
  const [error, setError] = useState(false);
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  // const currentParam = searchParams?.get("code") ?? undefined;

  const code = searchParams?.get("code") ?? undefined;
  const state = searchParams?.get("state") ?? undefined;

  async function handleLogin(token: string, state?: string) {
    const res = await googleAuth(token, state);
    if (res === 200) {
      router.push("/");
      router.refresh();
    }
    else 
    {
      setError(true);
    }
  }

  useEffect(() => {
    if (code) {
      handleLogin(code, state || '');
    }
  }, []);

  return (
    <>
      <Center>
        <Text fw={500} fz='h3' my='xl'>
          {t("googleLoading")}
        </Text>
      </Center>
      {error ? (
        <Text c="red">{t("googleLoginFailed")}</Text>
      ) : (
        <Box pos='relative' w='full' h='100px' mx='auto'>
          <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
        </Box>
      )}
    </>
  );
}
