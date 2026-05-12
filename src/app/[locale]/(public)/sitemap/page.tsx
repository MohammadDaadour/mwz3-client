import { Text } from "@mantine/core";

type Props = { params: { locale: string } };

export default async function SiteMapPage({ params: { locale } }: Props) {
  if (locale === "en") {
    <>
      <Text fz='h1'>Site Map</Text>
      <Text>...</Text>
    </>;
  } else {
    return (
      <>
        <Text fz='h1'>خريطة الموقع</Text>
        <Text>...</Text>
      </>
    );
  }
}
