import { IImage } from "@/interfaces";
import { Image } from "@mantine/core";
import NextImage from "next/image";

async function getImage() {
  const result = await fetch(`${process.env.API_URL}/images/banners/side/meta`);
  return result.json();
}

export async function SideBannerServer() {
  const imageSrc: IImage[] = await getImage();
  return (
    <Image
      component={NextImage}
      src={`${process.env.API_URL}/images/banners/side/${imageSrc[0]?.id}`}
      fallbackSrc='/images/sidebanner240x400.svg'
      alt='side banner'
      width={240}
      height={400}
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    />
  );
}
