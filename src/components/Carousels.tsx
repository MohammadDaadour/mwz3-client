"use client";

import "@mantine/carousel/styles.css";
import { Carousel } from "@mantine/carousel";
import classes from "./Carousels.module.css";
import { useContext, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import NextImage from "next/image";
import { Anchor, Badge, Card, Group, Image, Stack, Text, TextInput } from "@mantine/core";
import { IconFlame, IconSearch } from "@tabler/icons-react";
import { IAdsResult, IArea, IImage, IAd, LimitedCtgGridData } from "@/interfaces";
import useSWR from "swr";
import { AppContext } from "@/providers";
import { Link, useRouter } from "@/navigation";
import { useFormatter } from "next-intl";
import { publicFetcher } from "@/libs/functions";
import { incAdVisitsAction } from "@/libs/actions";
import { Icon } from "@iconify/react";
export const landingBg = "/images/landingBg.jpeg";
import { Button } from "@mantine/core";

export function WideCarousel({ images }: { images: IImage[] }) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

  return (
    <Carousel
      withIndicators
      withControls={false}
      height={180}
      slideSize='100%'
      slideGap='md'
      loop
      containScroll='trimSnaps'
      plugins={[autoplay.current]}
      onMouseEnter={() => autoplay.current.stop()}
      onMouseLeave={() => autoplay.current.play()}
      classNames={classes}
      my='lg'
    >
      {images.map((img, key) => (
        <Carousel.Slide key={key}>
          <Image
            component={NextImage}
            src={`${process.env.API_URL}/images/banners/wide/${img.id}`}
            alt='website banner'
            fill
            fit='scale-down'
            priority={true}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

export function SpecialAdCarousel({ ads, locale, initialAreas }: { ads: IAd[]; locale: string; initialAreas: IArea[] }) {
  const context = useContext(AppContext);
  const autoplay = useRef(Autoplay({ delay: 5000 }));


  const userLocationId = context?.country?.toString();

  const areas = initialAreas;

  if (!ads || !areas) return null;

  const filteredAndModifiedData = ads

    .filter((ad) => {

      if (!userLocationId) return true;

      let currentArea = areas.find((zone) => String(zone.id) === String(ad.areaFK));

      if (!currentArea) return false;

      let topLevelArea = currentArea;

      while (topLevelArea.parent !== 0) {
        const parentArea = areas.find((zone) => zone.id === topLevelArea.parent);
        if (!parentArea) break;
        topLevelArea = parentArea;
      }

      return String(topLevelArea.id) === String(userLocationId);
    })

    .map((ad) => ({
      ...ad,
      areaLbl: locale === "en"
        ? areas.find((zone) => String(zone.id) === String(ad.areaFK))?.labelEn
        : areas.find((zone) => String(zone.id) === String(ad.areaFK))?.labelAr,
    }));

  if (filteredAndModifiedData.length === 0) {
    return null;
  }

  return (
    <Carousel
      // withIndicators
      withControls={false}
      height={280}
      slideSize={//ads.length === 1 ? "300px" : "100%" \\
        "270px"
      }
      slideGap='md'
      loop={ads.length > 1}
      containScroll='trimSnaps'
      plugins={[autoplay.current]}
      onMouseEnter={() => autoplay.current.stop()}
      onMouseLeave={() => autoplay.current.play()}
      classNames={classes}
      className=" max-w-[300px] border border-1 border-amber-500 p-4 rounded-lg ml-6 bg-white"
      my='lg'
    >
      {filteredAndModifiedData.map((item, key) => (
        <Carousel.Slide key={key}>
          <Link className="flex w-full flex-col items-center" href={`/ads/${item.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(item?.id)}>
            <div className="relative w-full h-60">
              <Image
                component={NextImage}
                src={item?.image ? `${process.env.API_URL}/images/ads/${item.id}/${item.image}` : undefined}
                alt='website banner'
                className="object-cover rounded-lg"
                fill
                fit='scale-down'
                priority={true}
              />
            </div>
            <p className="mt-2 p-2 text-amber-400 text-semibold rounded-lg">{item?.label}</p>
          </Link>
        </Carousel.Slide>
      ))}
    </Carousel>
  )
}

export function LandingPageHeader({ categoriesData, dict }: { categoriesData: LimitedCtgGridData; dict: { title: string; subtitle: string; searchPlaceholder: string; searchBtn: string; categoriesTitle: string } }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const query = searchRef.current?.value || "";
    const params = new URLSearchParams();
    if (query) params.set('q', query);

    if (query) {
      router.push(`/results?${params.toString()}`);
    }
  }

  return (
    <div
      className="w-full flex justify-center items-center relative h-[450px] md:h-[500px] rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url('${landingBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        marginTop: 0,
        paddingTop: 0,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #f5f5f5 80%)',
        }}
      />
      <div className="relative z-10 text-center">
        <form
          onSubmit={(e) => {
            e.preventDefault(), handleSearch();
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl my-4 md:text-4xl font-bold text-gray-800 mb-2">{dict.title}</h1>
            <p className="text-lg my-4 md:text-xl text-gray-600">{dict.subtitle}</p>
          </div>
          <div className="flex justify-center gap-4 p-4 bg-white bg-opacity-90 rounded-md shadow-md mb-6">
            <TextInput
              ref={searchRef}
              placeholder={dict.searchPlaceholder}
              size='sm'
              className="min-w-[200px] md:min-w-[500px]"
            />
            <Button onClick={handleSearch}>{dict.searchBtn}</Button>
          </div>

          {/* Categories Section */}
          <p>{dict.categoriesTitle}</p>
          <div className="flex justify-start">
            <div className="flex justify-start items-start gap-6 px-4 my-4 bg-white rounded-md shadow-md py-2 overflow-x-scroll md:overflow-auto max-w-[300px] md:max-w-[900px] mx-auto">

              {categoriesData?.slice(0, 7).map((cat, key) => (
                <div key={key} className="flex items-center gap-6">
                  <Link
                    href={cat.link}
                    className="flex flex-col items-center gap-2 p-3 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all duration-200 hover:bg-gray-100"
                  >
                    <Icon icon={cat.icon} className='text-3xl text-blue-900' />
                    <span className="text-xs font-semibold text-gray-800">{cat.label}</span>
                  </Link>
                  {key < categoriesData.slice(0, 7).length - 1 && (
                    <div className="h-6 border-l border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <input type='submit' style={{ display: "none" }} />
        </form>
      </div>
    </div>
  )
}

type CtgCarouselProps = {
  params: {
    locale: string;
    ctg: {
      id: number;
      label: string;
      link: string;
    };
  };
  dict: { btnViewMore: string; adSpecial: string };
};

export function CategoriesCarousel({ params: { locale, ctg }, dict }: CtgCarouselProps) {
  const context = useContext(AppContext);
  const format = useFormatter();
  const country = context?.country?.toString();

  // const { data } = useSWR<IAdsResult>(
  //   `${process.env.API_URL}/ads/filter?c=${ctg.id}&a=${country}&lmt=5&filter=bst`,
  //   publicFetcher
  // );

  const { data } = useSWR<IAdsResult>(
    `${process.env.API_URL}/ads/filter?c=${ctg.id}&a=${country}&lmt=5`,
    publicFetcher
  );

  const { data: areas } = useSWR<IArea[]>(`${process.env.API_URL}/areas/view/`, publicFetcher, {
    revalidateOnFocus: false,
  });

  if (data && areas) {
    const modData = data.rows.map((ad) => ({
      ...ad,
      areaLbl:
        locale === "en"
          ? areas.find((zone) => zone.id === ad.areaFK)?.labelEn
          : areas.find((zone) => zone.id === ad.areaFK)?.labelAr,
    }));

    return (
      <Stack my='lg'>
        <Group justify='space-between' wrap='nowrap'>
          <Group align='baseline'>
            <Text fz='h2' fw={700}>
              {ctg.label}
            </Text>
            <CtgCounter locale={locale} ctgId={ctg.id} />
          </Group>
          <Anchor component={Link} href={ctg.link}>
            {dict.btnViewMore}
          </Anchor>
        </Group>
        <Carousel
          dragFree
          slideGap='md'
          align='start'
          slideSize={316}
          containScroll='trimSnaps'
          withControls={false}
          classNames={classes}
        >
          {modData.map((item, key) => (
            <Carousel.Slide key={key} maw={316}>
              <Card shadow='sm' padding='md' radius='md' withBorder>
                <Card.Section className='relative'>
                  <Anchor component={Link} unstyled href={`/ads/${item?.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(item?.id)}>
                    <Image
                      component={NextImage}
                      src={item?.image ? `${process.env.API_URL}/images/ads/${item.id}/${item.image}` : undefined}
                      fallbackSrc='/images/nocover300x150.svg'
                      alt='ad image'
                      height={170}
                      width={300}
                      fit='cover'
                      style={{ objectFit: "cover", width: "100%", height: "170px" }}
                      priority={false}
                    />
                  </Anchor>
                  {/* <Box className='absolute top-2 end-2'>
                    <BtnAddFavs params={{ locale: locale, adId: item.id, iconSz: 30 }} />
                  </Box> */}
                  {item.boosted ? <Badge size='lg' color='red' className='absolute top-2 start-2' rightSection={<IconFlame />}>
                    {dict.adSpecial}
                  </Badge> : undefined}
                </Card.Section>

                <Card.Section inheritPadding my='xs'>
                  {/* <Group justify='flex-start' gap={4}> */}
                  <Text fw={600}>
                    {format.number(item?.value, {
                      numberingSystem: "latn",
                      style: "currency",
                      currency: item?.currency,
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                  {/* </Group> */}
                </Card.Section>

                <Card.Section inheritPadding mb={0} h={100}>
                  <Anchor component={Link} unstyled href={`/ads/${item?.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(item?.id)}>
                    <Stack gap='xs' justify='flex-start' h='100%'>
                      <Text fz='sm' fw={500} lineClamp={2}>
                        {item.description}
                      </Text>
                      <Group justify='space-between' wrap='nowrap' gap={8} className='grow-0 mt-auto'>
                        <Text size='xs' c='dimmed' fw={600} className='min-w-fit'>
                          {format.relativeTime(Date.parse(item?.activatedAt), {
                            now: new Date(),
                            numberingSystem: "latn",
                          })}
                        </Text>
                        <Text size='xs' c='dimmed' fw={600} truncate>
                          {item?.areaLbl?.slice(item?.areaLbl?.indexOf(" ") + 1)}
                        </Text>
                      </Group>
                    </Stack>
                  </Anchor>
                </Card.Section>
              </Card>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Stack>
    );
  }
}

function CtgCounter({ locale, ctgId }: { locale: string; ctgId: number }) {
  const { data } = useSWR(`${process.env.API_URL}/ads/count/${ctgId}`, publicFetcher, { revalidateOnFocus: false });
  return <Text fz='lg' fw={600}>{`${data} ${locale === "en" ? "Ads" : "إعلان"}`}</Text>;
}
