import { Text, Button } from "@mantine/core";
import { IconBrandWhatsapp } from "@tabler/icons-react";

type Props = { params: { locale: string } };

export default async function CareersPage({ params: { locale } }: Props) {
  const whatsappMessage = "مرحبا أود الانضمام الي فريق موزع كأحد ممثلي خدمة العملاء";
  const whatsappNumber = "+201228833747"; // Replace with actual phone number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (locale === "en") {
    return (
      <>
        <Text fz='h1'>Careers at MWZ3</Text>
        <Text>Join our team as a Customer Service Representative</Text>
        <Button
          component="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<IconBrandWhatsapp size={20} />}
          color="green"
          mt="md"
        >
          Apply via WhatsApp
        </Button>
      </>
    );
  } else {
    return (
      <>
        <Text fz='h1'>الوظائف في MWZ3</Text>
        <Text>انضم إلى فريقنا كممثل لخدمة العملاء</Text>
        <Button
          component="a"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<IconBrandWhatsapp size={20} />}
          color="green"
          mt="md"
        >
          التقديم عبر واتساب
        </Button>
      </>
    );
  }
}