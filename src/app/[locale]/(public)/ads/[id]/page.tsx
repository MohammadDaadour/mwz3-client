import { Box, Divider, Flex, Group, Stack, Text, Image, Button, Anchor, Badge } from "@mantine/core";
import classes from "./styles.module.css";
import { IAd, IArea, IImage, ICategory } from "@/interfaces";
import { getFormatter, getTranslations } from "next-intl/server";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import NextImage from "next/image";
import "@mantine/carousel/styles.css";
import {
  IconAlignJustified,
  IconEye,
  IconFlag,
  IconListDetails,
  IconMapPin,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react";
import { BtnAddFavs, BtnShare, BtnShowNumber } from "@/components/Buttons";
import { Link } from "@/navigation";
import { SideBannerServer } from "@/components/BannersServer";
import { ProfileImage } from "@/components/ProfilePicture";
import { RatingDynamic } from "@/components/Rating";
import { SendMessageModal } from "@/components/Messages";
import { AdComments } from "@/components/Comments";
import { AddToCartButton } from "@/components/AddToCartButton";
import MarketChecker from "@/components/MarketChecker";
import { isAuth } from "@/libs/functions";

type Props = { params: { locale: string; id: string } };

async function getData(id: number) {
  const result = await fetch(`${process.env.API_URL}/ads/${id}`, { cache: "no-store" });
  return result.json();
}

async function getCtgRaw() {
  const ctgRaw = await fetch(`${process.env.API_URL}/categories`); //${process.env.API_URL}
  return ctgRaw.json();
}

async function getArea(id: number) {
  const result = await fetch(`${process.env.API_URL}/areas/${id}/view`);
  return result.json();
}

async function getImages(id: number) {
  const result = await fetch(`${process.env.API_URL}/images/ads/${id}/meta`);
  return result.json();
}

async function getAdRating(id: number) {
  const result = await fetch(`${process.env.API_URL}/ratings/ad/${id}`, {
    cache: "no-store",
  });
  return result.json();
  // const { data } = await axios.get(`${process.env.API_URL}/ratings/ad/${id}`).then((res) => res);
  // return data;
}

async function getUserRating(id: number) {
  const result = await fetch(`${process.env.API_URL}/ratings/user/${id}`, {
    cache: "no-store",
  });
  return result.json();
  //   const { data } = await axios.get(`${process.env.API_URL}/ratings/user/${id}`).then((res) => res);
  //   return data;
}

export default async function AdPage({ params: { locale, id } }: Props) {
  const data: IAd = await getData(parseInt(id, 16));
  const adRating = await getAdRating(parseInt(id, 16));
  const userRating = await getUserRating(data.user.id);
  const images: IImage[] = await getImages(parseInt(id, 16));
  const area: IArea[] = await getArea(data.areaFK);
  const format = await getFormatter();
  const t = await getTranslations("SingleAd");
  const rawCtgData: ICategory[] = await getCtgRaw();

  const filteredCategories = rawCtgData.filter(item => item.labelEn === "supermarket");

  const filteredChildCategories = rawCtgData.filter(item => item.parent === filteredCategories[0]?.id);

  const ctgFk = data.categoryFK;

  const auth = await isAuth();
  const isOwner = auth.success && auth.meta?.id === data.user.id;
  const showViews = isOwner && data.user.type === "merch";


  return (
    <div>
      <div className='w-full pb-2'>
        {/* <Anchor> */}
        <Link href='/'>الصفحة الرئيسية</Link>
        {/* </Anchor> */}
      </div>

      <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
        <Flex direction='column' p='xs' gap='xs' classNames={{ root: classes.mainSection }}>
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
                  <CarouselSlide key={key}>
                    <Image
                      component={NextImage}
                      src={img.id ? `${process.env.API_URL}/images/ads/${parseInt(id, 16)}/${img.id}` : undefined}
                      fallbackSrc='/images/nocover600x400.svg'
                      alt={`ad ${key}`}
                      fill
                      sizes='900px'
                      fit='cover'
                      priority={true}
                    />
                  </CarouselSlide>
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
              {showViews && (
                <Group>
                  <IconEye />
                  <Text>{data.visits}</Text>
                </Group>
              )}
              <Box>
                <RatingDynamic type='ad' id={data.id} value={adRating} locale={locale} />
              </Box>
              <Group>
                <BtnAddFavs params={{ locale: locale, adId: data.id, iconSz: 40 }} />
                <BtnShare params={{ locale: locale, iconSz: 36 }} />
              </Group>
            </Group>
            {/* {
              <MarketChecker
                ctgFk={ctgFk}
                filteredCategories={filteredCategories}
                childCategories={filteredChildCategories}
                id={data.id}
                title={data.label}
                value={data.value}
                image={images.length > 0 ? `${process.env.API_URL}/images/ads/${parseInt(id, 16)}/${images[0].id}` : '/images/nocover600x400.svg'}
              />
              } */}
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
            <Text component='pre' style={{ textWrap: "pretty" }}>
              {data.description}
            </Text>
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
            <Group>
              <Text fz='h3' fw={700}>
                {t("lblComments")}
              </Text>
              {/* <IconMapPin /> */}
            </Group>
            <AdComments locale={locale} adId={parseInt(id, 16)} />
            <Divider />
            <Group justify='space-between'>
              <Text>ID{id}</Text>
              <Anchor underline='never' inline={true}>
                <Group>
                  <IconFlag />
                  <Text>{t("btnReport")}</Text>
                </Group>
              </Anchor>
            </Group>
          </Stack>
        </Flex>
        <Flex direction='column' classNames={{ root: classes.side }} gap='xs'>
          <Stack align='stretch' gap='lg' p='xs' classNames={{ root: classes.sideCard }}>
            {/* new */}
            {/* <Anchor component={Link} unstyled href={`/users/${data.user.id.toString(16).padStart(6, "0")}`}> */}

            {/* replaced */}
            <Link
              href={`/users/${data.user.id.toString(16).padStart(6, "0")}`}
              // unstyled
              className={classes.anchorLink}
            >
              {/* new */}
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
                <RatingDynamic type='user' id={data.user.id} value={userRating} locale={locale} />
              </Stack>
              {/* </Anchor> */}
            </Link>
            <BtnShowNumber params={{ locale: locale, phone: data.user.phone }} />
            <SendMessageModal params={{ locale: locale, rx: data.userFK, partner: data.user.label }} />
          </Stack>
          <SideBannerServer />
        </Flex>
      </Flex>
    </div>
  );
}


