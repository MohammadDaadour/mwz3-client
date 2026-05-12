"use client";

import { IImage } from "@/interfaces";
import { publicFetcher } from "@/libs/functions";
import { Image } from "@mantine/core";
import NextImage from "next/image";
import { useEffect, useState } from "react";

export function SideBanner() {
  const [imageSrc, SetImageSrc] = useState<number>();

  useEffect(() => {
    async function getImage() {
      const result: IImage[] = await publicFetcher(`${process.env.API_URL}/images/banners/side/meta`);
      if (result.length > 0) {
        SetImageSrc(result[0].id);
      }
    }

    getImage();
  }, []);

  return (
    <Image
      component={NextImage}
      src={imageSrc ? `${process.env.API_URL}/images/banners/side/${imageSrc}` : undefined}
      fallbackSrc='/images/sidebanner240x400.svg'
      alt='side banner'
      width={240}
      height={400}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    />
  );
}
