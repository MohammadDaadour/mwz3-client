import { getTranslations } from "next-intl/server";
import { CategoriesCarousel, LandingPageHeader, WideCarousel, SpecialAdCarousel } from "@/components/Carousels";
import { LimitedCategoriesGrid } from "@/components/SiteMap";
import { ICategory, IImage, IAd } from "@/interfaces";
import SpecialAdSlider from "@/components/SpecialAdsSlider";

async function getBannersRefs() {
  const res = await fetch(`${process.env.API_URL}/images/banners/wide/meta`);
  return res.json();
}

async function getCtgRaw() {
  const res = await fetch(`${process.env.API_URL}/categories`);
  return res.json();
}

type Props = { params: { locale: string } };

export default async function LandingPage({ params: { locale } }: Props) {
  const t = await getTranslations("Misc");

  const bannersRefs: IImage[] = await getBannersRefs();
  const rawCtgData: ICategory[] = await getCtgRaw();

  const ctgData = rawCtgData
    .filter((item) => item.level === 1)
    .map((item, key) => ({
      order: item.order === 0 ? 100 + key : item.order,
      label: locale === "en" ? item.labelEn : item.labelAr,
      link: "/results?c=" + item.id.toString(),
      icon: item.icon,
      subs: rawCtgData
        .filter((sItem) => sItem.parent === item.id)
        .map((sItem, sKey) => ({
          order: sItem.order === 0 ? 100 + sKey : sItem.order,
          label: locale === "en" ? sItem.labelEn : sItem.labelAr,
          link: "/results?c=" + sItem.id.toString(),
        }))
        .sort((a, b) => a.order - b.order)
        .slice(0, 2),
    }))
    .sort((a, b) => a.order - b.order);

  const ctgPromoted = rawCtgData
    .filter((item) => item.promote === true)
    .map((item, key) => ({
      order: item.order === 0 ? 100 + key : item.order,
      id: item.id,
      label: locale === "en" ? item.labelEn : item.labelAr,
      link: `/results?c=${item.id.toString()}`,
    }))
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {/* <WideCarousel images={bannersRefs} /> */}
      <LandingPageHeader
        categoriesData={ctgData}
        dict={{
          title: locale === "en" ? "Buy and Sell Anything" : "بيع و اشتري أي حاجة",
          subtitle: locale === "en" ? "Search thousands of classified ads" : "ابحث في الآلاف من الاعلانات المبوبة",
          searchPlaceholder: locale === "en" ? "Search..." : "بحث...",
          searchBtn: locale === "en" ? "Search" : "بحث",
          categoriesTitle: locale === "en" ? "Browse Featured Categories" : "استعرض الفئات المميزة"
        }}
      />
      <SpecialAdSlider params={{ locale }} />
      {/* <LimitedCategoriesGrid data={ctgData} dict={{ allSubsBtn: t("btnViewSubs") }} /> */}
      {ctgPromoted?.map((item, key) => (
        <CategoriesCarousel
          key={key}
          params={{ locale: locale, ctg: { ...item } }}
          dict={{ adSpecial: t("adSpecial"), btnViewMore: t("btnViewMore") }}
        />
      ))}
    </>
  );
}
