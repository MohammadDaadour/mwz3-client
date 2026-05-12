"use client";

import { ProfileImage } from "@/components/ProfilePicture";
import { UpdatePassModal } from "@/components/Modals";
import { IUser } from "@/interfaces";
import { deleteImageAction, updateUserImageAction } from "@/libs/actions";
import { privateFetcher } from "@/libs/functions";
import { AppContext } from "@/providers";
import { Button, Flex, Group, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import useSWR from "swr";

type Props = { params: { locale: string } };

export default function AdminPage({ params: { locale } }: Props) {
  const context = useContext(AppContext);
  const t = useTranslations("UserProfile");
  const imageInput = useRef<HTMLInputElement>(null);

  const { data, error, isLoading } = useSWR<IUser>(`${process.env.API_URL}/users/${context?.user.id}`, privateFetcher, {
    revalidateOnFocus: false,
  });

  console.log(data?.id)

  function selectImage() {
    imageInput.current?.click();
  }

  async function updateImage(files: FileList | null) {
    if (files && files.length > 0 && context.user.id > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      const status = await updateUserImageAction(context.user.id, formData);
      if (status === 200) {
        window.location.reload();
      }
    }
  } 

  async function deleteImage() {
    await deleteImageAction(data?.image);
    window.location.reload();
  }

  if (context.user.id > 0 && data) {
    return (
      <Flex direction='column' p='xs' gap='xs'>
        <Text fz='h1'>{t("title")}</Text>
        <Group>
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
            <div className='hidden'>
              <input type='file' ref={imageInput} accept='image/*' onChange={(e) => updateImage(e.target.files)} />
            </div>
          </Stack>
          <UpdatePassModal />
        </Group>
      </Flex>
    );
  }
}
