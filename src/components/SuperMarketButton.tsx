"use client";

import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import Link from "next/link";

interface Category {
    id: number;
    labelEn: string;
    labelAr: string;
    parent?: number;
    [key: string]: any;
}

interface SupermarketButtonProps {
    variant?: "default" | "custom";
    onClick?: () => void;
    style?: React.CSSProperties;
}


export function SupermarketButton({ variant = "default", onClick, style }: SupermarketButtonProps) {
    const [supermarketId, setSupermarketId] = useState<number | null>(null);
    const [subCategories, setSubCategories] = useState<Category[]>([]);

    // useEffect(() => {
    //     async function fetchSupermarketCategory() {
    //         try {
    //             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    //             const data: Category[] = await res.json();

    //             const supermarketCategory = data.find(
    //                 (item) => item.labelEn?.toLowerCase() === "supermarket"
    //             );

    //             if (supermarketCategory) {
    //                 setSupermarketId(supermarketCategory.id);

    //                 const children = data.filter((item) => item.parent === supermarketCategory.id);
    //                 setSubCategories(children);
    //             }
    //         } catch (err) {
    //             console.error("Failed to fetch categories:", err);
    //         }
    //     }

    //     fetchSupermarketCategory();
    // }, []);

    // if (!supermarketId) return <p>Loading Supermarket...</p>;

    
    return (
        <div>
            <Button
                component={Link}
                href={`/results?c=64&a=3`}
                onClick={onClick}
                style={variant === "custom" ? { marginRight: 20, width: "30%", ...style } : style}
            >
                سوبر ماركت
            </Button>
        </div>
    );
}
