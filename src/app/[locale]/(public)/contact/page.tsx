import { Text } from "@mantine/core";

type Props = { params: { locale: string } };

export default async function ContactUsPage({ params: { locale } }: Props) {
  if (locale === "en") {
    <>
      <Text fz='h1'>Contact Us</Text>
      <Text>...</Text>
    </>;
  } else {
    return (
      <>
        <Text fz='h1'>تواصل معنا</Text>
        <Text>...</Text>
      </>
    );
  }
}
