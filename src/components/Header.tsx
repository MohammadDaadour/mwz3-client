"use client";

import {
  Group,
  Button,
  Divider,
  Burger,
  Drawer,
  ScrollArea,
  Image,
  rem,
  Text,
  TextInput,
  NavLink,
  Stack,
  Box,
  Anchor,
} from "@mantine/core";
import {
  IconLogout2,
  IconSearch,
  IconAd,
  IconCirclePlus,
  IconHeart,
  IconMessage,
  IconUserScan,
  IconUsers,
  IconPhotoScan,
  IconMap,
  IconCategory,
  IconBoxMultiple,
  IconAnalyze,
  IconTimeline,
} from "@tabler/icons-react";
import { TbTransactionDollar } from "react-icons/tb";
import { useDisclosure } from "@mantine/hooks";
import { AppContext } from "@/providers";
import { ThemeToggle } from "./ThemeToggle";
import { LoginModal } from "./LoginModal";
import { Link, useRouter } from "@/navigation";
import { useContext, useRef } from "react";
import { CountryMenu, LocaleMenu, LocaleMenuDrawer, UserMenu } from "./Menus";
import { SearchModal } from "./SearchModal";
import type { HeaderProps } from "@/interfaces";
import classes from "./Header.module.css";
import { GlobalMenuDrawer } from "./GlobalMenu";
import { logoutAction } from "@/libs/actions";
import { ProfileImage } from "./ProfilePicture";
import useSWR from "swr";
import { privateFetcher } from "@/libs/functions";
import { CartModal } from "./CartModal";
import { SupermarketButton } from "./SuperMarketButton";
import { IconPhone } from "@tabler/icons-react";

export function GlobalHeader({ headerLabels, drawerLabels, drawerData, auth }: HeaderProps) {
  const router = useRouter();
  const context = useContext(AppContext);
  const searchRef = useRef<HTMLInputElement>(null);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  function handleSearch() {
    router.push(`/results?q=${searchRef.current?.value}`);
  }

  async function handleLogout() {
    const { data, status } = await logoutAction();
    if (status === 200) {
      context.setContextUser();
      router.refresh();
    }
  }

  const { data: notifications } = useSWR(
    context.user.id > 0 ? `${process.env.API_URL}/messages/notif/${context.user.id}` : null,
    privateFetcher,
    { refreshInterval: 10000 }
  );

  return (
    <>
      <header className={`sticky top-0 z-[190] bg-white overflow-hidden ${classes.header} `}>
        <Group
          justify='space-between'
          gap='xs'
          p={8}
          maw={1280}
          wrap='nowrap'
          mx='auto'
          w='100%'
          h='100%'
          className='items-center'
        >
          <Group>
            <div className="hidden md:block">
              <LocaleMenu />
            </div>
            <Burger opened={drawerOpened} onClick={toggleDrawer} className="block md:hidden" />
            <Link href='/'>
              <Image src='/logo/logo2.jpeg' alt='logo' w={"auto"} className='h-[35px] md:h-[50px]' classNames={{ root: classes.logoLight }} />
              <Image src='/logo/logo2.jpeg' alt='logo' h={50} w={"auto"} classNames={{ root: classes.logoDark }} />
            </Link>
            <div className="hidden md:block">
              <CountryMenu regions={headerLabels.regions} />
            </div>
            <div className="h-6 border-l border-gray-300"></div>

            {auth.success ? (
              <Group hiddenFrom='sm'>
                <SearchModal variant='transparent' />
                {notifications > 0 ? (
                  <Anchor
                    component={Link}
                    href={auth.user.role === "admin" || auth.user.role === "su" ? "/admin/messages" : "/profile/messages"}
                  >
                    <IconMessage />
                  </Anchor>
                ) : undefined}
                <ProfileImage
                  source={
                    auth.user.image ? `${process.env.API_URL}/images/users/${auth.user.id}/${auth.user.image}` : undefined
                  }
                  height={38}
                  width={38}
                />
              </Group>
            ) : (
              <Button.Group hiddenFrom='sm'>
                <SearchModal />
                <LoginModal btnLogin={headerLabels.btnLogin} variant='filled' size='sm' />
                <div className="h-6 border-l border-gray-300"></div>
              </Button.Group>
            )}

            <Group visibleFrom='sm' justify='flex-end'>
              {auth.success ? (
                <>
                  {notifications > 0 ? (
                    <Anchor
                      component={Link}
                      href={
                        auth.user.role === "admin" || auth.user.role === "su" ? "/admin/messages" : "/profile/messages"
                      }
                    >
                      <IconMessage />
                    </Anchor>
                  ) : undefined}
                  <UserMenu auth={auth.user} />
                  <div className="h-6 border-l border-gray-300"></div>
                  {/* <CartModal variant="transparent" /> */}
                </>
              ) : (
                <>
                  {/* <CartModal variant="transparent" /> */}
                  <LoginModal btnLogin={headerLabels.btnLogin} />
                  <div className="h-6 border-l border-gray-300"></div>
                  <Button className="text-black font-bold hover:bg-gray-100 hover:text-blue-900 transition-all duration-500" variant='subtle' size='compact-lg' fz='md' component={Link} href='/register'>
                    {headerLabels.btnSell}
                  </Button>
                  <div className="h-6 border-l border-gray-300"></div>
                </>
              )}
              <Link className="hidden md:inline-block" href={"/blog"}>
                <Button className="bg-white text-black font-bold hover:bg-gray-100 hover:text-blue-900 transition-all duration-500" variant="subtle" size="compact-lg" fz='md'>المنتدي</Button>
              </Link>
            </Group>
          </Group>
          <Button.Group>
            {/* <ThemeToggle /> */}
            {/* <Link className=" md:inline-block" href={"/contact"}>
              <Button className="mx-4 md:mx-2 bg-blue-900 text-white font-bold hover:bg-gray-100 hover:text-blue-900 transition-all duration-500" variant="subtle" size="compact-lg" fz='md'>
                <IconPhone className="" />
              </Button>
            </Link> */}



            <Link className=" md:inline-block" href={"https://agent.mwz3.com"}>
              <Button className="mx-4 md:mx-2 bg-blue-900 text-white font-bold hover:bg-gray-100 hover:text-blue-900 transition-all duration-500" variant="subtle" size="compact-lg" fz='md'>
                <span className="hidden md:inline-block mx-2">بوابة الموزع </span>
                <TbTransactionDollar className="" />
              </Button>
            </Link>




          </Button.Group>
        </Group>
      </header>

      <Drawer
        title='MWZ3'
        opened={drawerOpened}
        onClose={closeDrawer}
        size='100%'
        padding='md'
        hiddenFrom='sm'
        zIndex={1000}
        classNames={{ title: classes.drawerTitle }}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx='-md'>
          {auth.success ? (
            <>
              <Group align='start' gap='xl'>
                {auth.user.role === "user" || auth.user.role === "merch" ? (
                  <Box className='font-semibold'>
                    <NavLink
                      component={Link}
                      href='/profile'
                      label={drawerLabels.btnProfile}
                      leftSection={<IconUserScan />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/profile/ads'
                      label={drawerLabels.btnAds}
                      leftSection={<IconAd />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/profile/favorits'
                      label={drawerLabels.btnFavs}
                      leftSection={<IconHeart />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/profile/messages'
                      label={drawerLabels.btnMessages}
                      leftSection={<IconMessage />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/profile/subscriptions'
                      label={drawerLabels.btnSubs}
                      leftSection={<IconCirclePlus />}
                      onClick={closeDrawer}
                    />
                  </Box>
                ) : (
                  <Box className='font-semibold'>
                    <NavLink
                      component={Link}
                      href='/admin'
                      label={drawerLabels.btnProfile}
                      leftSection={<IconUserScan />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/messages'
                      label={drawerLabels.btnMessages}
                      leftSection={<IconMessage />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/ads'
                      label={drawerLabels.btnUsersAds}
                      leftSection={<IconAd />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/users'
                      label={drawerLabels.btnUsers}
                      leftSection={<IconUsers />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/subscriptions'
                      label={drawerLabels.btnSubs}
                      leftSection={<IconCirclePlus />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/subs-types'
                      label={drawerLabels.btnSubsTypes}
                      leftSection={<IconBoxMultiple />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/banners'
                      label={drawerLabels.btnBanners}
                      leftSection={<IconPhotoScan />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/areas'
                      label={drawerLabels.btnAreas}
                      leftSection={<IconMap />}
                      onClick={closeDrawer}
                    />
                    <NavLink
                      component={Link}
                      href='/admin/categories'
                      label={drawerLabels.btnCategories}
                      leftSection={<IconCategory />}
                      onClick={closeDrawer}
                    />

                    <NavLink
                      component={Link}
                      href='/admin/analytics'
                      label={"الاحصائيات"}
                      leftSection={<IconTimeline />}
                      onClick={closeDrawer}
                    />
                  </Box>
                )}
                <Stack align='center' mx='auto'>
                  <ProfileImage
                    source={
                      auth.user.image
                        ? `${process.env.API_URL}/images/users/${auth.user.id}/${auth.user.image}`
                        : undefined
                    }
                    height={84}
                    width={84}
                  />
                  <Text fw={500} fz='lg'>
                    {auth.user.name}
                  </Text>
                </Stack>
              </Group>
              <Divider my='sm' />
            </>
          ) : null}

          <GlobalMenuDrawer {...drawerData} clickFn={closeDrawer} />

          <Divider my='sm' />
          <Group justify='center'>
            <Group justify='space-around' wrap='nowrap'>
              {/* <CartModal onClickCallback={closeDrawer} /> */}
              <Text>{headerLabels.lblRegion}</Text>
              <CountryMenu regions={headerLabels.regions} zIndex={1100} />
            </Group>
            <Group justify='space-around' wrap='nowrap'>
              <Text>{headerLabels.lblLang}</Text>
              <LocaleMenuDrawer />
            </Group>
          </Group>

          <Divider my='sm' />

          {auth.success ? (
            <Group justify='center' grow pb='xl' px='md'>
              {/* <ThemeToggle size='sm' /> */}
              <Button
                leftSection={<IconLogout2 />}
                onClick={() => {
                  handleLogout(), closeDrawer();
                }}
              >
                {drawerLabels.btnLogout}
              </Button>
            </Group>
          ) : (
            <Group justify='center' grow pb='xl' px='md'>
              <Button component={Link} href='/login' onClick={closeDrawer}>
                {headerLabels.btnLogin}
              </Button>
              <Button component={Link} href='/register' onClick={closeDrawer}>
                {headerLabels.btnSell}
              </Button>
              {/* <ThemeToggle size='sm' /> */}
            </Group>
          )}
          <div className="flex">
            {/* <SupermarketButton variant="custom" onClick={closeDrawer} style={{ marginRight: 20, width: "100%" }} /> */}
            <Link onClick={closeDrawer} className="mx-8 " href={"/blog"}>
              <Button >المنتدي</Button>
            </Link>
          </div>
        </ScrollArea>
      </Drawer>
    </>
  );
}


