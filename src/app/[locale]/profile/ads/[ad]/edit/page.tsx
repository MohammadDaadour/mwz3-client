"use client";

import { SideBanner } from "@/components/Banners";
import { Box, Flex, Group, LoadingOverlay, Stack, Image, Button, Badge, FileInput, Alert } from "@mantine/core";
import classes from "../../../styles.module.css";
import { IAd, IArea, ICategory, IImage } from "@/interfaces";
import { useContext } from "react";
import { AppContext } from "@/providers";
import useSWR from "swr";
import { privateFetcher, publicFetcher } from "@/libs/functions";
import { UserAdsItemForm } from "./form";
import Error from "../../../../error";
import NextImage from "next/image";
import { addAdImagesAction, deleteImageAction, updateAdAction } from "@/libs/actions";
import { modals } from "@mantine/modals";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string; ad: string };
};

export default function UserAdsItemEdit({ params: { locale, ad } }: Props) {
  const context = useContext(AppContext);
  const t = useTranslations("AdForm");

  const { data, error, isLoading } = useSWR<IAd>(
    `${process.env.API_URL}/ads/user/${context.user.id}/${parseInt(ad, 16)}`,
    privateFetcher
  );

  const { data: categories } = useSWR<ICategory[]>(`${process.env.API_URL}/categories`, publicFetcher, {
    revalidateOnFocus: false,
  });
  const { data: areas } = useSWR<IArea[]>(`${process.env.API_URL}/areas`, publicFetcher, {
    revalidateOnFocus: false,
  });

  const { data: images, mutate } = useSWR<IImage[]>(
    `${process.env.API_URL}/images/ads/${data?.id}/meta`,
    publicFetcher
  );

  async function deleteImage(img: number) {
    await deleteImageAction(img);
    mutate();
  }

  async function setCover(ad: number, img: number) {
    await updateAdAction(ad, { image: img });
    mutate();
  }

  async function handleImages(value: File[]) {
    if (value.length > 0 && images!.length + value.length > 5) {
      modals.open({
        withCloseButton: false,
        children: <Alert color='red'>{t("errImage")}</Alert>,
        styles: { body: { padding: 0 } },
      });
    } else {
      const formImages = new FormData();
      value.forEach((file) => formImages.append("files", file));
      await addAdImagesAction(data!.id, formImages);
      mutate();
    }
  }

  if (context.user.id > 0 && error) {
    return <Error />;
  }

  if (context.user.id > 0 && data && areas && categories && images) {
    return (
      <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
        <Flex direction='column' p='xs' gap='xl' pos='relative' classNames={{ root: classes.mainSection }}>
          <Stack gap='xl'>
            {images?.map((img, key) => (
              <Stack key={key}>
                <Image
                  component={NextImage}
                  src={`${process.env.API_URL}/images/ads/${data.id}/${img.id}`}
                  alt={img.id.toString()}
                  height={180}
                  width={1280}
                  fit='scale-down'
                  priority={true}
                />
                {img.id === data.image && <Badge size='lg'>{t("lblCover")}</Badge>}
                <Group>
                  <Button color='red' onClick={() => deleteImage(img.id)}>
                    {t("btnDelete")}
                  </Button>
                  <Button disabled={img.id === data.image} onClick={() => setCover(data.id, img.id)}>
                    {t("btnCover")}
                  </Button>
                </Group>
              </Stack>
            ))}
          </Stack>
          <Group>
            <FileInput
              multiple
              accept='image/*'
              clearable
              onChange={handleImages}
              label={t("lblImages")}
              description={t("descImages")}
              placeholder={t("btnImages")}
              disabled={images.length >= 5}
            />
          </Group>
          <UserAdsItemForm locale={locale} data={data} areas={areas} categories={categories} />
        </Flex>
        <Flex direction='column' gap='xs' classNames={{ root: classes.side }}>
          <SideBanner />
        </Flex>
      </Flex>
    );
  } else {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }
}
