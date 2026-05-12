"use client";

import { SideBanner } from "@/components/Banners";
import { IUser } from "@/interfaces";
import { AppContext } from "@/providers";
import { Box, Button, Flex, Group, LoadingOverlay, Stack, Text } from "@mantine/core";
import { useContext, useRef } from "react";
import useSWR, { mutate } from "swr";
import classes from "./styles.module.css";
import { UpdateCountryModal, UpdatePassModal, UpdateUserModal } from "@/components/Modals";
import { useTranslations } from "next-intl";
import { privateFetcher } from "@/libs/functions";
import { deleteImageAction, updateUserImageAction } from "@/libs/actions";
import { ProfileImage } from "@/components/ProfilePicture";
import Error from "../error";
import { IconBrandFacebookFilled, IconBrandGoogleFilled } from "@tabler/icons-react";

type Props = { params: { locale: string } };

export default function ProfilePage({ params: { locale } }: Props) {
  const context = useContext(AppContext);
  const t = useTranslations("UserProfile");
  const imageInput = useRef<HTMLInputElement>(null);

  const { data, error, isLoading, mutate } = useSWR<IUser>(
    `${process.env.API_URL}/users/${context?.user.id}`,
    privateFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  function selectImage() {
    imageInput.current?.click();
  }

  async function updateImage(files: FileList | null) {
    if (files && files.length > 0 && context.user.id > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      const status = await updateUserImageAction(context.user.id, formData);
      if (status === 200) {
        // window.location.reload();
        mutate();
      }
    }
  }

  async function deleteImage() {
    await deleteImageAction(data?.image);
    mutate();
    // window.location.reload();
  }

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

  if (context.user.id > 0 && data) {
    return (
      <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
        <Flex direction='column' p='xs' gap='xs' classNames={{ root: classes.mainSection }}>
          <Text fz='h1'>{t("title")}</Text>
          <Group align='start' justify='space-around' p='md'>
            <Stack>
              <Group>
                <Text fz='lg' w={132}>
                  {t("lblEmail")}
                </Text>
                <Text fz='lg'>{data.email}</Text>
              </Group>
              <Group>
                <Text fz='lg' w={132}>
                  {t("lblName")}
                </Text>
                <Text fz='lg'>{data.label}</Text>
              </Group>
              <Group>
                <Text fz='lg' w={132}>
                  {t("lblPhone")}
                </Text>
                <Text fz='lg'>{data.phone}</Text>
              </Group>
              <Group>
                <Text fz='lg' w={132}>
                  {t("lblCountry")}
                </Text>
                {data.areaFK ? (
                  <Text fz='lg'>{locale === "en" ? data.area.labelEn : data.area.labelAr}</Text>
                ) : (
                  <UpdateCountryModal userId={data.id} locale={locale} emit={() => mutate()} />
                )}
              </Group>
              <Group>
                <Text fz='lg' w={132}>
                  {t("lblSocial")}
                </Text>
                <Box className='inline-flex'>
                  {data.facebook ? <IconBrandFacebookFilled size={32} color='#1877F2' /> : undefined}
                  {data.google ? <IconBrandGoogleFilled size={32} color='#CD201F' /> : undefined}
                </Box>
              </Group>
              <UpdateUserModal user={{ id: data.id, name: data.label, phone: data.phone }} locale={locale as "ar" | "en"}  />
              <UpdatePassModal />
            </Stack>

            <Stack align='center'>
              <ProfileImage
                source={data.image ? `${process.env.API_URL}/images/users/${data.id}/${data.image}` : undefined}
                height={160}
                width={160}
              />
              <Button onClick={selectImage}>{t("btnUpdate")}</Button>
              <Button onClick={deleteImage} disabled={data.image ? false : true}>
                {t("btnRemove")}
              </Button>
            </Stack>
          </Group>
          <div className='hidden'>
            <input type='file' ref={imageInput} accept='image/*' onChange={(e) => updateImage(e.target.files)} />
          </div>
        </Flex>
        <Flex direction='column' gap='xs' classNames={{ root: classes.side }}>
          <SideBanner />
        </Flex>
      </Flex>
    );
  }
}
