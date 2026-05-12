import { IAd } from "@/interfaces";
import { SpecialAdCarousel } from "@/components/Carousels";
import { Carousel } from "@mantine/carousel";
import classes from "./Carousels.module.css";
import { getAreas } from "@/libs/actions";

function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

type Props = { params: { locale: string } };

export default async function SpecialAdSlider({ params: { locale } }: Props) {

    const { data: areas } = await getAreas();
    async function getBoosted() {
        const res = await fetch(`${process.env.API_URL}/ads/boosted?limit=50`, {
            cache: "no-store",
        });
        return res.json();
    }

    const data = await getBoosted();
    const boostedAds: IAd[] = data.rows;

    if (boostedAds.length === 0) return null;

    const chunks = chunkArray(boostedAds, 5);

    return (
        <Carousel
            dragFree
            slideGap="md"
            align="start"
            slideSize={316}
            containScroll="keepSnaps"
            withControls={false}
            classNames={classes}
            className="w-full"
        >
            {chunks.map((chunk, idx) => (
                <SpecialAdCarousel locale={locale} key={idx} ads={chunk} initialAreas={areas} />
            ))}
        </Carousel>
    );
}
