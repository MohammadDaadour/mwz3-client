"use client";

import { SideBanner } from "@/components/Banners";
import { AppContext } from "@/providers";
import { Anchor, Box, Button, Divider, Flex, Group, Stack, Image, Text, LoadingOverlay } from "@mantine/core";
import { useContext } from "react";
import classes from "../../styles.module.css";
import NextImage from "next/image";
import useSWR from "swr";
import { privateFetcher, publicFetcher } from "@/libs/functions";
import { Carousel } from "@mantine/carousel";
import { RatingStatic } from "@/components/Rating";
import { IconAlignJustified, IconListDetails, IconMapPin } from "@tabler/icons-react";
import { useFormatter, useTranslations } from "next-intl";
import { IAd, IArea, IImage } from "@/interfaces";
import "@mantine/carousel/styles.css";
import Error from "../../../error";
import { Link } from "@/navigation";
import { AdminAdForm } from "@/components/Forms";
import { SideBannerServer } from "@/components/BannersServer";
import { ProfileImage } from "@/components/ProfilePicture";
import { RatingDynamic } from "@/components/Rating";
import { SendMessageModal } from "@/components/Messages";
import { BtnAddFavs, BtnShare, BtnShowNumber } from "@/components/Buttons";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { Badge } from "@mantine/core";


type Props = {
  params: { locale: string; ad: string };
};

export default function UserAdsItem({ params: { locale, ad } }: Props) {
  const format = useFormatter();
  const t = useTranslations("SingleAd");

  const { data, error, isLoading } = useSWR<IAd>(
    `${process.env.API_URL}/ads/admin/${parseInt(ad, 16)}`,
    privateFetcher
  );
  const { data: area } = useSWR<IArea[]>(`${process.env.API_URL}/areas/${data?.areaFK}/view`, publicFetcher);
  const { data: images } = useSWR<IImage[]>(
    `${process.env.API_URL}/images/ads/${parseInt(ad, 16)}/meta`,
    publicFetcher
  );
  const { data: rating } = useSWR(`${process.env.API_URL}/ratings/ad/${data?.id}`, publicFetcher);

  if (error) {
    return <Error />;
  }

  if (data && area && images) {
    return (
      <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
        <Flex direction='column' p='xs' gap='xs' pos='relative' classNames={{ root: classes.mainSection }}>
          <Group justify='space-between' align='start' wrap='nowrap'>
            <Stack>
              <Text>{`${t("lblState")} ${locale === "en" ? data.state.labelEn : data.state.labelAr}`}</Text>
              <Text>{`${t("lblNote")} ${data.notes}`}</Text>
            </Stack>
            <AdminAdForm ad={data.id} state={data.stateFK} notes={data.notes} />
          </Group>
          <Box>
            {images.length > 0 ? (
              <Carousel
                withIndicators
                height={400}
                slideSize='100%'
                loop
                classNames={{ container: classes.carousel, control: classes.control }}
              >
                {images.map((img, key) => (
                  <Carousel.Slide key={key}>
                    <Image
                      component={NextImage}
                      src={img.id ? `${process.env.API_URL}/images/ads/${parseInt(ad, 16)}/${img.id}` : undefined}
                      fallbackSrc='/images/nocover600x400.svg'
                      alt={`ad ${key}`}
                      fill
                      sizes='900px'
                      fit='cover'
                      priority={true}
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            ) : (
              <Image
                component={NextImage}
                src='/images/nocover600x400.svg'
                alt='ad image'
                width={600}
                height={300}
                style={{ objectFit: "cover", width: "100%", height: "400px" }}
                priority={false}
              />
            )}
          </Box>
          <Stack px='md'>
            <Group justify='space-between' align='center'>
              <Group align='end' gap='xl'>
                <Text fz='h2' fw={700}>
                  {data.label}
                </Text>
                <Text fz='xl' fw={500}>
                  {format.number(data.value, {
                    numberingSystem: "latn",
                    style: "currency",
                    currency: data.currency,
                    maximumFractionDigits: 0,
                  })}
                </Text>
              </Group>
              <Box>
                <RatingStatic value={rating} />
              </Box>
            </Group>
            <Divider />
            {data.details && true ? (
              <>
                <Group>
                  <Text fz='h3' fw={700}>
                    {t("lblDetails")}
                  </Text>
                  <IconListDetails />
                </Group>
                <Text>{data.details}</Text>
                <Divider />
              </>
            ) : null}
            <Group>
              <Text fz='h3' fw={700}>
                {t("lblDesc")}
              </Text>
              <IconAlignJustified />
            </Group>
            <Text component='pre' style={{ textWrap: 'pretty' }}>{data.description}</Text>
            <Divider />
            <Group>
              <Text fz='h3' fw={700}>
                {t("lblLocation")}
              </Text>
              <IconMapPin />
            </Group>
            <Text>{locale === "en" ? area[0].labelEn : area[0].labelAr}</Text>
            <Box mah={300} className='relative'>
              <Image
                component={NextImage}
                src='/images/mapplaceholder.svg'
                alt='map'
                height={300}
                width={600}
                priority={false}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <Anchor href={`https://google.com/maps/search/${area[0].labelAr.replaceAll(" ", "+")}/`} target='_blank'>
                <Button variant='default' color='gray' className='absolute w-56 inset-0 m-auto'>
                  {t("btnCheckLocation")}
                </Button>
              </Anchor>
            </Box>
            <Divider />
            <Group justify='space-between'>
              <Text>ID{ad}</Text>
            </Group>
          </Stack>
        </Flex>
        <Flex direction='column' gap='xs' classNames={{ root: classes.side }}>
          <Flex direction='column' classNames={{ root: classes.side }} gap='xs'>
            <Stack align='stretch' gap='lg' p='xs' classNames={{ root: classes.sideCard }}>
              {/* new */}
              {/* <Anchor component={Link} unstyled href={`/users/${data.user.id.toString(16).padStart(6, "0")}`}> */}

              {/* replaced */}
              <Link
                href={`/users/${data.user.id.toString(16).padStart(6, "0")}`}
                className={classes.anchorLink}
              >
                <Stack align='center' gap='xs'>
                  <ProfileImage
                    source={
                      data.user.image
                        ? `${process.env.API_URL}/images/users/${data.user.id}/${data.user.image}`
                        : undefined
                    }
                    height={84}
                    width={84}
                  />
                  <span className='inline-flex'>
                    <Text fw={600}>{data.user.label}</Text>
                    {data.user.certified ? <IconRosetteDiscountCheckFilled /> : null}
                  </span>
                  {data.user.type === "merch" ? <Badge size='lg'>{t("lblMerchant")}</Badge> : undefined}
                </Stack>
              </Link>
              <BtnShowNumber params={{ locale: locale, phone: data.user.phone }} />
              <SendMessageModal params={{ locale: locale, rx: data.userFK, partner: data.user.label }} />
            </Stack>
          </Flex>
          <SideBanner />
        </Flex>
      </Flex>
    );
  } else {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }
}
