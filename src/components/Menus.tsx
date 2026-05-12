"use client";

import { Link, usePathname, useRouter } from "@/navigation";
import { usePathname as useNextPathname } from "next/navigation";
import { Button, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import {
  IconWorld,
  IconAd,
  IconChevronDown,
  IconCirclePlus,
  IconHeart,
  IconLogout2,
  IconMessage,
  IconUserScan,
  IconUsers,
  IconMap,
  IconCategory,
  IconBoxMultiple,
  IconPhotoScan,
  IconTimeline,
} from "@tabler/icons-react";
import { forwardRef, useContext, useState } from "react";
import { AppContext } from "@/providers";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/libs/actions";
import { ProfileImage } from "./ProfilePicture";

type UserMenuProps = {
  auth: { id: number; role: string; name: string; image: number };
};

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name: string;
  icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, icon, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      style={{
        padding: "var(--mantine-spacing-md)",
        color: "var(--mantine-color-text)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
      {...others}
    >
      <Group>
        <ProfileImage source={image} height={38} width={38} />

        <div style={{ flex: 1 }}>
          <Text size='sm' fw={500}>
            {name}
          </Text>
        </div>

        {icon || <IconChevronDown size='1rem' />}
      </Group>
    </UnstyledButton>
  )
);

UserButton.displayName = "UserButton";

export function UserMenu({ auth }: UserMenuProps) {
  const context = useContext(AppContext);
  const t = useTranslations("UserMenu");
  const router = useRouter();

  async function handleLogout() {
    const { data, status } = await logoutAction();
    if (status === 200) {
      context.setContextUser();
      router.refresh();
    }
  }

  return (
    <Menu trigger='click-hover' openDelay={200} closeDelay={200} offset={-8}>
      <Menu.Target>
        <UserButton image={`${process.env.API_URL}/images/users/${auth.id}/${auth.image}`} name={auth.name} />
      </Menu.Target>
      {auth.role === "user" || auth.role === "merch" ? (
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconUserScan />} component={Link} href='/profile'>
            {t("btnProfile")}
          </Menu.Item>
          <Menu.Item leftSection={<IconAd />} component={Link} href='/profile/ads'>
            {t("btnAds")}
          </Menu.Item>
          <Menu.Item leftSection={<IconHeart />} component={Link} href='/profile/favorits'>
            {t("btnFavs")}
          </Menu.Item>
          <Menu.Item leftSection={<IconMessage />} component={Link} href='/profile/messages'>
            {t("btnMessages")}
          </Menu.Item>
          {/* <Menu.Item leftSection={<IconCirclePlus />} component={Link} href='/profile/subscriptions'>
            {t("btnSubs")}
          </Menu.Item> */}
          <Menu.Item leftSection={<IconCirclePlus />} component={Link} href='/user-orders'>
            طلباتي
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout2 />} onClick={handleLogout}>
            {t("btnLogout")}
          </Menu.Item>
        </Menu.Dropdown>
      ) : (
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconUserScan />} component={Link} href='/admin'>
            {t("btnProfile")}
          </Menu.Item>
          <Menu.Item leftSection={<IconMessage />} component={Link} href='/admin/messages'>
            {t("btnMessages")}
          </Menu.Item>
          <Menu.Item leftSection={<IconAd />} component={Link} href='/admin/ads'>
            {t("btnUsersAds")}
          </Menu.Item>
          <Menu.Item leftSection={<IconUsers />} component={Link} href='/admin/users'>
            {t("btnUsers")}
          </Menu.Item>
          {/* <Menu.Item leftSection={<IconCirclePlus />} component={Link} href='/admin/subscriptions'>
            {t("btnSubs")}
          </Menu.Item> */}
          <Menu.Item leftSection={<IconBoxMultiple />} component={Link} href='/admin/subs-types'>
            {t("btnSubsTypes")}
          </Menu.Item>
          <Menu.Item leftSection={<IconPhotoScan />} component={Link} href='/admin/banners'>
            {t("btnBanners")}
          </Menu.Item>
          <Menu.Item leftSection={<IconMap />} component={Link} href='/admin/areas'>
            {t("btnAreas")}
          </Menu.Item>
          <Menu.Item leftSection={<IconCategory />} component={Link} href='/admin/categories'>
            {t("btnCategories")}
          </Menu.Item>
          <Menu.Item leftSection={<IconTimeline />} component={Link} href='/admin/orders'>
            طلبات المستخدمين
          </Menu.Item>
          <Menu.Item leftSection={<IconTimeline />} component={Link} href='/admin/analytics'>
            احصائيات
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconLogout2 />} onClick={handleLogout}>
            {t("btnLogout")}
          </Menu.Item>
        </Menu.Dropdown>
      )}
    </Menu>
  );
}

export function LocaleMenu() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <img className="cursor-pointer w-10 h-5 hover:scale-110 transition-all duration-200" onClick={() => router.replace(pathname, { locale: "ar" })} src="/images/arabicFlag.jpg" alt="العربية" />
      <img className="cursor-pointer w-10 h-5 hover:scale-110 transition-all duration-200" onClick={() => router.replace(pathname, { locale: "en" })} src="/images/englishFlag.jpg" alt="English" />
    </div>
    // <Menu trigger='click-hover' openDelay={100} closeDelay={350}>
    //  <Menu.Target>
    //     <Button variant='solid' size='compact-lg'>
    //       <IconWorld stroke={2} />
    //     </Button>
    //   </Menu.Target>
    //   <Menu.Dropdown>
    //     <Menu.Item onClick={() => router.replace(pathname, { locale: "en" })}>English</Menu.Item>
    //     <Menu.Item onClick={() => router.replace(pathname, { locale: "ar" })}>العربية</Menu.Item>
    //   </Menu.Dropdown> 
    //  </Menu>
  );
}

export function LocaleMenuDrawer() {
  const router = useRouter();
  const currLocale = useNextPathname();
  const pathname = usePathname();
  const [locale, setLocale] = useState(currLocale?.includes("/en") ? "English" : "العربية");

  return (
    <Menu trigger='click' zIndex={1100}>
      <Menu.Target>
        <Button className="bg-white text-black" variant='subtle' size='compact-lg' fz='md'>
          {locale}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            router.replace(pathname, { locale: "en" }), setLocale("English");
          }}
        >
          English
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            router.replace(pathname, { locale: "ar" }), setLocale("العربية");
          }}
        >
          العربية
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

type CountryMenuProps = {
  regions: string[];
  zIndex?: number;
};

export function CountryMenu({ regions, zIndex }: CountryMenuProps) {
  const context = useContext(AppContext);
  const router = useRouter();

  function changeCountry(val: number) {
    context.setContextCountry(val);
    router.push("/");
    router.refresh();
  }

  return (
    <Menu styles={{
      dropdown: { padding: '4px 0' },
      item: {
        padding: '12px 16px',
        '&:hover': { backgroundColor: '#f0f0f0' }
      }
    }} trigger='click' zIndex={zIndex}>
      <Menu.Target>
        <Button className="text-black hover:bg-gray-100 hover:text-blue-900 transition-ease-in-out duration-200 font-bold" variant='subtle' size='compact-lg' fz='md' rightSection={<IconChevronDown size={14} />}>
          {context?.country ? regions[context.country - 1] : regions[2]}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            changeCountry(3);
          }}
        >
          {regions[2]}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            changeCountry(2);
          }}
        >
          {regions[1]}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            changeCountry(1);
          }}
        >
          {regions[0]}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
