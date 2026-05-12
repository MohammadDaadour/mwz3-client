import { Image, Paper } from "@mantine/core";
import NextImage from "next/image";

type props = {
  height: number;
  width: number;
  source?: string;
};

export function ProfileImage({ source, width, height }: props) {
  return (
    <Paper shadow='lg' radius='100%' bg='var(--mantine-color-gray-light)'>
      <Image
        component={NextImage}
        src={source ? source : undefined}
        alt='profile image'
        height={height}
        width={width}
        fallbackSrc='/images/profile.svg'
        style={{
          borderRadius: "100%",
          width: `${width}px`,
          height: `${height}px`,
          // backgroundColor: "var(--mantine-color-gray-light)",
          backgroundColor: 'transparent',
          fill: "currentcolor",
        }}
      />
    </Paper>
  );
}
