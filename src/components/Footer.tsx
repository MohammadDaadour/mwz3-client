"use client";

import { ActionIcon, Anchor, Box, Container, Flex, Group, SimpleGrid, Stack, Text, Image } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconBrandX,
} from "@tabler/icons-react";
import classes from "./Footer.module.css";
import { Link, useRouter } from "@/navigation";
import { useContext } from "react";
import { AppContext } from "../providers";
import { FooterProps } from "@/interfaces";

export function GlobalFooter({ data, misc }: FooterProps) {
  const router = useRouter();
  const context = useContext(AppContext);

  function changeCountry(val: number) {
    context?.setContextCountry(val);
    router.push("/", { scroll: true });
    router.refresh();
  }
  return (
    <footer className={classes.footer}>
      <Container>
        <Group justify='space-between'>
          <Stack align='center' gap='md' justify='center' className={classes.logo}>
            <Link href='/'>
              <Image src='/logo/logo2.png' alt='logo' h={200} w={"auto"} classNames={{ root: classes.logoLight }} />
              <Image src='/logo/logo2.png' alt='logo' h={200} w={"auto"} classNames={{ root: classes.logoDark }} />
            </Link>
            <Text size='xs' c='dimmed'>
              {misc.slang}
            </Text>
          </Stack>

          <Flex align='flex-start' direction='row' className={classes.logo}>
            <Box mx='xl'>
              <Text fw='700' mb='sm'>
                {data[0].label}
              </Text>
              <SimpleGrid cols={1} spacing='xs'>
                {data[0].links.map((sItem, key) => (
                  <Anchor
                    key={key}
                    component={Link}
                    href={sItem.link}
                    underline='hover'
                    fz='sm'
                    className={classes.link}
                  >
                    {sItem.label}
                  </Anchor>
                ))}
              </SimpleGrid>
            </Box>
            <Box mx='xl'>
              <Text fw='700' mb='sm'>
                {data[1].label}
              </Text>
              <SimpleGrid cols={1} spacing='xs'>
                {data[1].links.map((Item, key) => (
                  <Anchor
                    key={key}
                    underline='hover'
                    fz='sm'
                    className={classes.link}
                    onClick={() => changeCountry(parseInt(Item.link, 10))}
                  >
                    {Item.label}
                  </Anchor>
                ))}
              </SimpleGrid>
            </Box>
          </Flex>
        </Group>
      </Container>

      <Container className={classes.afterFooter}>
        <Text c='dimmed' size='sm'>
          {misc.rights}
        </Text>

        <Group gap='xs' justify='flex-end' wrap='nowrap' className='mt-4 lg:mt-0'>
          <ActionIcon size='lg' variant='subtle'>
            <IconBrandX size={28} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='subtle'>
            <IconBrandInstagram size={28} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='subtle' component={Link} href='https://www.facebook.com/mwz3.ar'>
            <IconBrandFacebook size={28} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='subtle'>
            <IconBrandTiktok size={28} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='subtle'>
            <IconBrandWhatsapp size={28} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size='lg' variant='subtle'>
            <IconBrandTwitter size={28} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>

      {/* <Center>
        <Text fz='sm' c='dimmed'>
          Developed by&ensp;
          <a href='mailto:barmada.sha@gmail.com' className='font-semibold'>
            OptimalCode
          </a>
        </Text>
      </Center> */}
    </footer>
  );
}
