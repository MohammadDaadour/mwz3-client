"use client";

import { Stack, Text, Flex, Box, LoadingOverlay } from "@mantine/core";
import { useTranslations } from "next-intl";
import { IAdsResult, IArea } from "@/interfaces";
import { AppContext } from "@/providers";
import { useContext } from "react";
import useSWR from "swr";
import { SideBanner } from "@/components/Banners";
import classes from "../styles.module.css";
import { AdCardSquare, AdCardWide } from "@/components/AdsCards";
import { privateFetcher, publicFetcher } from "@/libs/functions";
import Error from "../../error";

type Props = { params: { locale: string } };

export default function UserFavoritsPage({ params: { locale } }: Props) {
  const context = useContext(AppContext);
  const t = useTranslations("Results");

  function handleRemove(id: string) {
    try {
      document.getElementById(id.toString())!.style.display = "none";
    } catch (err) {}
  }

  const { data, error, isLoading } = useSWR<IAdsResult>(
    `${process.env.API_URL}/ads/user/${context.user.id}/favs`,
    privateFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const { data: areas } = useSWR<IArea[]>(`${process.env.API_URL}/areas/view/`, publicFetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  if (context.user.id > 0 && error) {
    return <Error />;
  }

  if (context.user.id > 0 && data && areas) {
    const modData = data?.rows?.map((ad) => ({
      ...ad,
      areaLbl:
        locale === "en"
          ? areas.find((zone) => zone.id === ad.areaFK)?.labelEn
          : areas.find((zone) => zone.id === ad.areaFK)?.labelAr,
    }));

    return (
      <Flex direction='row' gap='sm' wrap='wrap'>
        <Flex direction='column' p='xs' gap='xs' classNames={{ root: classes.mainSection }}>
          <Text fz='h1' fw={700}>
            {t("titleFavs")}
          </Text>
          <Stack classNames={{ root: classes.wideCards }}>
            {modData.map((ad) => (
              <AdCardWide
                key={ad?.id}
                locale={locale}
                labels={{ adCert: t("adCert"), adSpecial: t("adSpecial") }}
                ad={ad}
                withUser={true}
                favType={false}
                favFn={() => handleRemove(`ad${ad.id}`)}
              />
            ))}
          </Stack>
          <Stack classNames={{ root: classes.squareCards }}>
            {modData.map((ad) => (
              <AdCardSquare
                key={ad?.id}
                locale={locale}
                labels={{ adCert: t("adCert"), adSpecial: t("adSpecial") }}
                ad={ad}
                favType={false}
                favFn={() => handleRemove(`ad${ad.id}`)}
              />
            ))}
          </Stack>
        </Flex>
        <Flex direction='column' classNames={{ root: classes.side }} gap='xs'>
          <SideBanner />
        </Flex>
      </Flex>
    );
  }
}
