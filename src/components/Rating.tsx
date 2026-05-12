"use client";

import { updateRatingAction } from "@/libs/actions";
import { AppContext } from "@/providers";
import { Rating, Tooltip } from "@mantine/core";
import { useContext } from "react";

type Props = {
  locale: string;
  type: string;
  id: number;
  value: number;
};
export function RatingDynamic({ type, id, value, locale }: Props) {
  const context = useContext(AppContext);

  function updateRating(type: string, id: number, value: number) {
    updateRatingAction({ type: type, ref: id, value: Math.round(value), userFK: context.user.id });
  }

  return (
    <Tooltip
      label={
        context.user.id === 0
          ? locale === "en"
            ? "sign in to rate this ad"
            : "قم بتسجيل الدخول لتتمكن من التقييم"
          : value.toFixed(2)
      }
    >
      <Rating
        size='md'
        defaultValue={value}
        fractions={2}
        styles={{ root: { direction: "ltr" } }}
        onChange={(value) => updateRating(type, id, value)}
        readOnly={context.user.id === 0}
      />
    </Tooltip>
  );
}

export function RatingStatic({ value }: { value: number }) {
  return <Rating styles={{ root: { direction: "ltr" } }} defaultValue={value} fractions={2} readOnly />;
}
