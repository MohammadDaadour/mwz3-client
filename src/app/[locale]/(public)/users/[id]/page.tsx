import { Badge, Flex, Text, Stack } from "@mantine/core";
import classes from "./styles.module.css";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { BtnShowNumber } from "@/components/Buttons";
import { SideBannerServer } from "@/components/BannersServer";
import { IAdsResult, IArea, IUser } from "@/interfaces";
import { AdCardSquare, AdCardWide } from "@/components/AdsCards";
import { getTranslations } from "next-intl/server";
import { ProfileImage } from "@/components/ProfilePicture";
import { RatingDynamic } from "@/components/Rating";
import { Link } from "@/navigation";
import { SendMessageModal } from "@/components/Messages";

type Props = { params: { locale: string; id: string } };

async function getData(userId: number) {
  const result = await fetch(`${process.env.API_URL}/ads/user/${userId}/public`);
  return result.json();
}

async function getAreas() {
  const result = await fetch(`${process.env.API_URL}/areas/view`);
  return result.json();
}

async function getUserRating(id: number) {
  const result = await fetch(`${process.env.API_URL}/ratings/user/${id}`);
  return result.json();
}

async function getUserData(id: number) {
  const result = await fetch(`${process.env.API_URL}/users/${id}`);
  return result.json();
}

export default async function UserPage({ params: { locale, id } }: Props) {
  const t = await getTranslations("Results");
  const data: IAdsResult = await getData(parseInt(id, 16));
  const areas: IArea[] = await getAreas();
  const user: IUser = await getUserData(parseInt(id, 16));
  const userRating = await getUserRating(parseInt(id, 16));
  const labels = { adCert: t("adCert"), adSpecial: t("adSpecial") };

  if (data && areas && user) {
    const modData = data.rows.map((ad) => ({
      ...ad,
      areaLbl:
        locale === "en"
          ? areas.find((zone) => zone.id === ad.areaFK)?.labelEn
          : areas.find((zone) => zone.id === ad.areaFK)?.labelAr,
    }));

    console.log(user)

    return (
      <div>
        <div className='w-full pb-2'>
          <Link href='/'>الصفحة الرئيسية</Link>
        </div>

        <Flex direction='row' gap='sm' classNames={{ root: classes.parent }}>
          <Stack align='stretch' gap='lg' p='xs' classNames={{ root: classes.topCard }}>
            <Stack align='center' gap='xs'>
              <ProfileImage
                source={user.image ? `${process.env.API_URL}/images/users/${user.id}/${user.image}` : undefined}
                height={84}
                width={84}
              />
              <Text fw={600}>{user?.label}</Text>
              {user.certified ? (
                <Badge size='lg' rightSection={<IconRosetteDiscountCheckFilled />}>
                  {t("lblCertified")}
                </Badge>
              ) : undefined}
            </Stack>
            <BtnShowNumber params={{ locale: locale, phone: user.phone }} />
            <SendMessageModal params={{ locale: locale, rx: user.id, partner: user.label }} />
          </Stack>
          <Flex direction='column' p='xs' gap='xs' classNames={{ root: classes.mainSection }}>
            <Stack classNames={{ root: classes.wideCards }}>
              {modData.map((ad) => (
                <AdCardWide
                  key={ad?.id}
                  locale={locale}
                  labels={labels}
                  ad={JSON.parse(JSON.stringify(ad))}
                  withUser={false}
                  favType={true}
                />
              ))}
            </Stack>
            <Stack align='stretch' classNames={{ root: classes.squareCards }}>
              {modData.map((ad) => (
                <AdCardSquare
                  key={ad.id}
                  locale={locale}
                  labels={labels}
                  ad={JSON.parse(JSON.stringify(ad))}
                  favType={true}
                />
              ))}
            </Stack>
          </Flex>
          <Flex direction='column' classNames={{ root: classes.side }} gap='xs'>
            <Stack align='stretch' gap='lg' p='xs' classNames={{ root: classes.sideCard }}>
              <Stack align='center' gap='xs'>
                <ProfileImage
                  source={user.image ? `${process.env.API_URL}/images/users/${user.id}/${user.image}` : undefined}
                  height={84}
                  width={84}
                />
                <span className='inline-flex'>
                  <Text fw={600}>{user?.label}</Text>
                  {user.certified ? <IconRosetteDiscountCheckFilled /> : null}
                </span>
                {user.type === "merch" ? <Badge size='lg'>{t("adCert")}</Badge> : undefined}
                <RatingDynamic type='user' id={user.id} value={userRating} locale={locale} />
              </Stack>
              <BtnShowNumber params={{ locale: locale, phone: user.phone }} />
              <SendMessageModal params={{ locale: locale, rx: user.id, partner: user.label }} />
            </Stack>
            <SideBannerServer />
          </Flex>
        </Flex>
      </div>
    );
  }
}
