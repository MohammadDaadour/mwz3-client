import { Text } from "@mantine/core";

type Props = { params: { locale: string } };

export default async function AboutPage({ params: { locale } }: Props) {
  if (locale === "en") {
    <>
      <Text fz='h1'>About MWZ3</Text>
      <Text>A website for posted ads</Text>
    </>;
  } else {
    return (
      <>
        <Text fz='h1'>نبذة عن MWZ3</Text>
        <Text>موقع MWZ3 هو موقع للإعلانات المبوبة</Text>
      </>
    );
  }
}
