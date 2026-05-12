"use client";

import { AddToCartButton } from "./AddToCartButton";

type Props = {
    ctgFk: number;
    filteredCategories: { id: number }[];
    childCategories: { id: number }[];
    id: number;
    title: string;
    value: number;
    image: string;
};

export default function MarketChecker({ ctgFk, filteredCategories, childCategories, id, title, value, image }: Props) {
    const isParentCategory = filteredCategories.some((item) => item.id === ctgFk);
    const isChildCategory = childCategories.some((item) => item.id === ctgFk);
    if (isParentCategory || isChildCategory) {
        return <AddToCartButton
            item={
                {
                    id: id,
                    title: title,
                    value: value,
                    image: image
                }
            }
        />;
    }
    else {
        return null;
    }
}

