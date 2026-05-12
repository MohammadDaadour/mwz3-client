import { getTranslations } from "next-intl/server";
import { CategoriesCarousel, WideCarousel } from "@/components/Carousels";
import { LimitedCategoriesGrid } from "@/components/SiteMap";
import { ICategory, IImage } from "@/interfaces";
import {ProductsGrid} from "@/components/MarketProducts";

async function getBannersRefs() {
    const res = await fetch(`${process.env.API_URL}/images/banners/wide/meta`);
    return res.json();
}

async function getCtgRaw() {
    const res = await fetch(`${process.env.API_URL}/categories`);
    return res.json();
}

type Props = { params: { locale: string } };

export default async function MarketPage({ params: { locale } }: Props) {
    const t = await getTranslations("Misc");

    const bannersRefs: IImage[] = await getBannersRefs();
    const rawCtgData: ICategory[] = await getCtgRaw();

    const ctgPromoted = rawCtgData
        .filter((item) => item.order > 9)
        .map((item, key) => ({
            order: item.order === 0 ? 100 + key : item.order,
            id: item.id,
            label: locale === "en" ? item.labelEn : item.labelAr,
            link: `/results?c=${item.id.toString()}`,
        }))
        .sort((a, b) => a.order - b.order);

    return (
        <>
            <WideCarousel images={bannersRefs} />
            {ctgPromoted?.map((item, key) => (
                <ProductsGrid
                    key={key}
                    params={{ locale: locale, ctg: { ...item } }}
                    dict={{ btnViewMore: t("btnViewMore") }}
                />
            ))}
        </>
    );
}
