"use client";

import { IImage } from "@/interfaces";
import { deleteImageAction, uploadBannerAction } from "@/libs/actions";
import { publicFetcher } from "@/libs/functions";
import { Button, Flex, Group, Image, Stack, Text } from "@mantine/core";
import NextImage from "next/image";
import useSWR from "swr";

type Props = { params: { locale: string } };

export default function AdminBannersPage({ params: { locale } }: Props) {
  const { data: wideBanners } = useSWR<IImage[]>(`${process.env.API_URL}/images/banners/wide/meta`, publicFetcher);
  const { data: sideBanners } = useSWR<IImage[]>(`${process.env.API_URL}/images/banners/side/meta`, publicFetcher);

  function selectImage(type: string) {
    if (type === "wide") {
      document.getElementById("WideBannerInput")?.click();
    } else if (type === "side") {
      document.getElementById("SideBannerInput")?.click();
    }
  }

  async function uploadBanner(type: string, files: FileList | null) {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      const status = await uploadBannerAction(type, formData);
      if (status === 200) {
        window.location.reload();
      }
    }
  }

  async function deleteBanner(id: number) {
    await deleteImageAction(id)
    window.location.reload();
  }

  return (
    <Flex direction='column' gap='xl'>
      <Group justify='space-between'>
        <Text fz='h2' fw={700}>
          الإعلانات الرئيسية
        </Text>
        <Text>أبعاد الصور 1280 بيكسل عرض × 180 بيكسل طول يفضل بصيغة SVG</Text>
        <Button onClick={() => selectImage("wide")}>إضافة</Button>
      </Group>
      <div className='hidden'>
        <input
          id='WideBannerInput'
          type='file'
          accept='image/*'
          onChange={(e) => uploadBanner("wide", e.target.files)}
        />
      </div>
      {wideBanners && wideBanners.length > 0 ? (
        <Stack gap='xl'>
          {wideBanners.map((img, key) => (
            <Group key={key}>
              <Image
                component={NextImage}
                src={`${process.env.API_URL}/images/banners/wide/${img.id}`}
                alt={img.id.toString()}
                height={180}
                width={1280}
                fit='scale-down'
                priority={true}
              />
              <Button color='red' onClick={() => deleteBanner(img.id)}>حذف</Button>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text>لا يوجد صور إعلانات عريضة</Text>
      )}
      <Group justify='space-between'>
        <Text fz='h2' fw={700}>
          الإعلانات الجانبية
        </Text>
        <Text>أبعاد الصور 240 بيكسل عرض × 400 بيكسل طول يفضل بصيغة SVG</Text>
        <Button onClick={() => selectImage("side")}>إضافة</Button>
      </Group>
      <div className='hidden'>
        <input
          id='SideBannerInput'
          type='file'
          accept='image/*'
          onChange={(e) => uploadBanner("side", e.target.files)}
        />
      </div>
      {sideBanners && sideBanners.length > 0 ? (
        <Stack gap='xs'>
          {sideBanners.map((img, key) => (
            <Group key={key}>
              <Image
                component={NextImage}
                src={`${process.env.API_URL}/images/banners/side/${img.id}`}
                alt={img.id.toString()}
                height={400}
                width={240}
                fit='scale-down'
                priority={true}
              />
              <Button color='red' onClick={() => deleteBanner(img.id)}>حذف</Button>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text>لا يوجد صور إعلانات جانبية</Text>
      )}
    </Flex>
  );
}
