"use client";

import { AppContext } from "@/providers";
import { ActionIcon, Badge, Button, Center, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconHeartFilled, IconHeartX, IconMessage, IconPhone, IconShare } from "@tabler/icons-react";
import { useContext, useState } from "react";
import classes from "./Buttons.module.css";
import { addFavAction, removeFavAction } from "@/libs/actions";

type BtnAddFavProps = {
  params: {
    locale: string;
    adId: number;
    iconSz: number;
  };
};

export function BtnAddFavs({ params: { locale, adId, iconSz } }: BtnAddFavProps) {
  const context = useContext(AppContext);
  async function handleAddFav(ad: number) {
    if (context.user.id > 0) {
      const { status } = await addFavAction(context.user.id, ad);
      if (status === 200) {
        notifications.show({
          message: locale === "en" ? "Ad was added to your favorits" : "تم إضافة الإعلان الى مفضلاتك",
          icon: <IconHeartFilled size={36} color='red' />,
          styles: { icon: { backgroundColor: "transparent" } },
        });
      }
    } else {
      notifications.show({
        color: "red",
        message:
          locale === "en"
            ? "Please login to be able to favorit ads"
            : "برجاء تسجيل الدخول لتتمكن من إضافة الإعلانات إلى مفضلاتك",
        classNames: classes,
      });
    }
  }
  return (
    <ActionIcon variant='transparent' c='red' size={iconSz} onClick={() => handleAddFav(adId)}>
      <IconHeartFilled size={iconSz} />
    </ActionIcon>
  );
}

export function BtnRemoveFavs({ params: { locale, adId, iconSz } }: BtnAddFavProps) {
  const context = useContext(AppContext);
  async function handleRemoveFav(ad: number) {
    if (context.user.id > 0) {
      const { status } = await removeFavAction(context.user.id, ad);
      if (status === 200) {
        notifications.show({
          message: locale === "en" ? "Ad was removed from your favorits" : "تم إزالة الإعلان من مفضلاتك",
        });
      }
    }
  }
  return (
    <ActionIcon variant='transparent' c='red' size={iconSz} onClick={() => handleRemoveFav(adId)}>
      <IconHeartX size={iconSz} />
    </ActionIcon>
  );
}

type BtnShareProps = {
  params: {
    locale: string;
    iconSz: number;
  };
};

export function BtnShare({ params: { locale, iconSz } }: BtnShareProps) {
  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    notifications.show({
      message: locale === "en" ? "Link have been copied to clipboard" : "تم نسخ الرابط الى المحفظة",
    });
  }
  return (
    <ActionIcon variant='transparent' c='gray' size={iconSz} onClick={handleShare}>
      <IconShare size={iconSz} />
    </ActionIcon>
  );
}

type BtnShowNumber = {
  params: {
    locale: string;
    phone: string;
  };
};

export function BtnShowNumber({ params: { locale, phone } }: BtnShowNumber) {
  const context = useContext(AppContext);
  const [visible, setVisble] = useState(false);

  function handleShow() {
    if (context.user.id > 0) {
      setVisble(true);
    } else {
      notifications.show({
        color: "red",
        message:
          locale === "en"
            ? "Please login to be able to view contact number"
            : "برجاء تسجيل الدخول لتتمكن من رؤية رقم التواصل",
        classNames: classes,
      });
    }
  }
  return (
    <Center>
      {!visible ? (
        <Button color='green' variant='light' fullWidth rightSection={<IconPhone />} onClick={handleShow}>
          {locale === "en" ? "Show Number" : "إظهار الرقم"}
        </Button>
      ) : (
        <Badge color='green' radius='sm' size='xl' fullWidth fw={500} fz='md'>
          {phone}
        </Badge>
      )}
    </Center>
  );
}
