"use client";

import { Box, Stack, Text, Group, Anchor, Badge, Image, Tooltip, Card } from "@mantine/core";
import { Link } from "@/navigation";
import NextImage from "next/image";
import { useFormatter } from "next-intl";
import { BtnAddFavs, BtnRemoveFavs } from "./Buttons";
import { IconFlame, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { IAd } from "@/interfaces";
import classes from "./AdsCard.module.css";
import React from "react";
import { ProfileImage } from "./ProfilePicture";
import { RatingStatic } from "./Rating";
import useSWR from "swr";
import { publicFetcher } from "@/libs/functions";
import { SendMessageModal } from "./Messages";
import { incAdVisitsAction } from "@/libs/actions";

type AdCardWideProps = {
  locale: string;
  labels: { adCert: string; adSpecial: string };
  ad: IAd;
  withUser: boolean;
  favType: boolean;
  favFn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export function AdCardWide({ locale, labels, ad, withUser, favType, favFn }: AdCardWideProps) {
  const format = useFormatter();
  const { data: rating } = useSWR(`${process.env.API_URL}/ratings/ad/${ad.id}`, publicFetcher);

  return (
    <Group id={`ad${ad?.id}`} grow wrap='nowrap' preventGrowOverflow={false} classNames={{ root: classes.card }}>
      <Box h={200} w={300} className='shrink-0 grow-0 relative' bg='gray.2'>
        <Anchor component={Link} unstyled href={`/ads/${ad?.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(ad?.id)}>
          <Image
            component={NextImage}
            src={ad?.image ? `${process.env.API_URL}/images/ads/${ad.id}/${ad.image}` : undefined}
            fallbackSrc='/images/nocover600x400.svg'
            alt='ad image'
            height={200}
            width={300}
            style={{ objectFit: "cover", width: "300px", height: "200px" }}
            priority={false}
          />
        </Anchor>
        {favType ? (
          <Box className='absolute top-2 end-2'>
            <BtnAddFavs params={{ locale: locale, adId: ad?.id, iconSz: 30 }} />
          </Box>
        ) : (
          <Box className='absolute top-2 end-2' onClick={favFn}>
            <BtnRemoveFavs params={{ locale: locale, iconSz: 36, adId: ad?.id }} />
          </Box>
        )}
        {ad?.boosted ? (
          <Badge size='lg' color='red' className='absolute top-2 start-2' rightSection={<IconFlame />}>
            {labels.adSpecial}
          </Badge>
        ) : undefined}
      </Box>

      <Stack h={200} py='xs' pe='xs' gap='xs' align='flex-start' justify='stretch'>
        <Anchor component={Link} underline='never' href={`/ads/${ad?.id.toString(16).padStart(6, "0")}`} w='100%' onClick={() => incAdVisitsAction(ad?.id)}>
          <Group>
            <Text fw={600}>{ad?.label}</Text>
            <Text fw={600} c={"gray"}>
              {format.number(ad?.value, {
                numberingSystem: "latn",
                style: "currency",
                currency: ad?.currency,
                maximumFractionDigits: 0,
              })}
            </Text>
            <Box ms='auto'>
              <RatingStatic value={rating} />
            </Box>
          </Group>
        </Anchor>
        <Text lineClamp={2}>{ad?.description}</Text>
        <Group mt='auto' justify='space-between' w='100%'>
          <Tooltip label={format.dateTime(Date.parse(ad?.activatedAt), { dateStyle: "long", timeStyle: "medium" })}>
            <Text fz='sm' fw={600}>
              {format.relativeTime(Date.parse(ad?.activatedAt), { now: new Date(), numberingSystem: "latn" })}
            </Text>
          </Tooltip>
          <Text>{ad.areaLbl}</Text>
        </Group>
      </Stack>

      {withUser && (
        <Box
          h={200}
          w={180}
          style={{
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <Stack h='100%' justify='end' align='stretch' gap='xs' p='xs'>
            <Anchor component={Link} unstyled href={`/users/${ad?.user?.id.toString(16).padStart(6, "0")}`}>
              <Stack align='center' gap='xs'>
                <ProfileImage
                  source={
                    ad.user.image ? `${process.env.API_URL}/images/users/${ad.user.id}/${ad.user.image}` : undefined
                  }
                  height={56}
                  width={56}
                />
                <span className="inline-flex">
                  <Text fw={600}>{ad?.user?.label}</Text>
                  {ad?.user?.certified ? <IconRosetteDiscountCheckFilled /> : null}
                </span>
                {ad?.user?.type === 'merch' ? (
                  <Badge size='lg'>
                    {labels.adCert}
                  </Badge>
                ) : undefined}
              </Stack>
            </Anchor>
            {/* <BtnShowNumber params={{ locale: locale, phone: ad?.user?.phone }} /> */}
            <SendMessageModal params={{ locale: locale, rx: ad.userFK, partner: ad.user.label }} />
          </Stack>
        </Box>
      )}
    </Group>
  );
}

type AdCardSquareProps = {
  locale: string;
  labels: { adCert: string; adSpecial: string };
  ad: IAd;
  favType: boolean;
  favFn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  withFav?: boolean;
  withSpecial?: boolean;
};

export function AdCardSquare({
  locale,
  labels,
  ad,
  favType,
  favFn,
  withFav = true,
  withSpecial = true,
}: AdCardSquareProps) {
  const format = useFormatter();

  return (
    <Card id={`ad${ad?.id}`} shadow='sm' padding='md' radius='md' withBorder h="100%">
      <Card.Section className='relative'>
        <Anchor component={Link} unstyled href={`/ads/${ad.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(ad?.id)}>
          <Image
            component={NextImage}
            src={ad.image ? `${process.env.API_URL}/images/ads/${ad.id}/${ad.image}` : undefined}
            fallbackSrc='/images/nocover300x150.svg'
            alt='ad image'
            height={170}
            width={300}
            fit='cover'
            style={{ objectFit: "cover", width: "100%", height: "170px" }}
            priority={false}
          />
        </Anchor>
        {/* <Box className='absolute top-2 end-2' onClick={favFn}>
          <BtnAddFavs params={{ locale: locale, adId: ad.id, iconSz: 30 }} />
        </Box> */}
        {withFav &&
          (favType ? (
            <Box className='absolute top-2 end-2'>
              <BtnAddFavs params={{ locale: locale, adId: ad?.id, iconSz: 30 }} />
            </Box>
          ) : (
            <Box className='absolute top-2 end-2' onClick={favFn}>
              <BtnRemoveFavs params={{ locale: locale, iconSz: 36, adId: ad?.id }} />
            </Box>
          ))}
        {withSpecial && ad?.boosted ? (
          <Badge size='lg' color='red' className='absolute top-2 start-2' rightSection={<IconFlame />}>
            {labels.adSpecial}
          </Badge>
        ) : undefined}
      </Card.Section>

      <Card.Section inheritPadding my='xs'>
        <Anchor component={Link} underline='never' href={`/ads/${ad?.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(ad?.id)}>
          <Group justify='space-between' wrap='nowrap'>
            <Text fw={600}>{ad.label}</Text>
            <Text fw={600} c='gray'>
              {format.number(ad.value, {
                numberingSystem: "latn",
                style: "currency",
                currency: ad.currency,
                maximumFractionDigits: 0,
              })}
            </Text>
          </Group>
        </Anchor>
      </Card.Section>

      <Card.Section inheritPadding mb={0} h={100}>
        <Anchor component={Link} unstyled href={`/ads/${ad.id.toString(16).padStart(6, "0")}`} onClick={() => incAdVisitsAction(ad?.id)}>
          <Stack gap='xs' justify='flex-start' h='100%'>
            <Text fz='sm' fw={500} lineClamp={2}>
              {ad.description}
            </Text>
            <Group justify='space-between' wrap='nowrap' gap={8} className='grow-0 mt-auto'>
              <Text size='xs' c='dimmed' fw={600} className='min-w-fit'>
                {format.relativeTime(Date.parse(ad.activatedAt), {
                  now: new Date(),
                  numberingSystem: "latn",
                })}
              </Text>
              <Text size='xs' c='dimmed' fw={600} truncate>
                {ad.areaLbl?.slice(ad.areaLbl?.indexOf(" ") + 1)}
              </Text>
            </Group>
          </Stack>
        </Anchor>
      </Card.Section>
    </Card>
  );
}
