"use client";

import { Anchor, Box, Center, Group, HoverCard, NavLink, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import classes from "./GlobalMenu.module.css";
import { Icon } from "@iconify/react";
import { GlobalMenuProps } from "@/interfaces";
import { Link } from "@/navigation";

export function GlobalMenu({ data, misc }: GlobalMenuProps) {
  return (
    <Group justify='space-between' h='xl' mb='lg' wrap='nowrap' visibleFrom='md' gap={0}>
      {data.slice(0, 6).map((item, key) => (
        <HoverCard key={key} shadow='md' openDelay={350}>
          <HoverCard.Target>
            <Center inline className='cursor-pointer'>
              <Icon icon={item.icon} className='text-2xl' />
              <Box component='span' mx={5}>
                {item.label}
              </Box>
            </Center>
          </HoverCard.Target>

          <HoverCard.Dropdown style={{ overflow: "hidden" }} p='xs'>
            <SimpleGrid cols={item.subs.length > 7 ? 2 : 1} spacing='xs' verticalSpacing={0}>
              {item.subs.map((sItem, key) => (
                <Anchor component={Link} replace className={classes.link} underline='never' href={sItem.link} key={key}>
                  <UnstyledButton className={classes.subLink}>
                    <Text size='xs' fw={500}>
                      {sItem.label}
                    </Text>
                  </UnstyledButton>
                </Anchor>
              ))}
              <Anchor component={Link} replace className={classes.viewlink} underline='never' href={item.link}>
                <UnstyledButton className={classes.subLink}>
                  <Text size='xs' fw={500}>
                    {misc.btnViewAll}
                  </Text>
                </UnstyledButton>
              </Anchor>
            </SimpleGrid>
          </HoverCard.Dropdown>
        </HoverCard>
      ))}
      <HoverCard shadow='md' openDelay={350}>
        <HoverCard.Target>
          <Center inline className='cursor-pointer'>
            <Icon icon='tabler:mist' className='text-2xl' />
            <Box component='span' mx={5}>
              {misc.ctgMisc}
            </Box>
          </Center>
        </HoverCard.Target>

        <HoverCard.Dropdown style={{ overflow: "hidden" }} p='xs'>
          <SimpleGrid cols={1} spacing={0}>
            {data.slice(6).map((item, key) => (
              <Anchor component={Link} replace className={classes.link} underline='never' href={item.link} key={key}>
                <UnstyledButton className={classes.subLink}>
                  <Text size='xs' fw={500}>
                    {item.label}
                  </Text>
                </UnstyledButton>
              </Anchor>
            ))}
          </SimpleGrid>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}

export function GlobalMenuDrawer({ data, misc, clickFn }: GlobalMenuProps) {
  return (
    <Box>
      {data
        .filter((item) => item.subs.length > 0)
        .map((item, key) => (
          <NavLink key={key} label={item.label} leftSection={<Icon icon={item.icon} />} className="font-semibold">
            <NavLink
              component={Link}
              href={item.link}
              replace
              c='var(--mantine-primary-color-5)'
              label={misc.btnViewAll}
              className="font-semibold"
              onClick={clickFn}
            />
            {item.subs.map((sItem, sKey) => (
              <NavLink key={sKey} component={Link} replace href={sItem.link} label={sItem.label} onClick={clickFn} />
            ))}
          </NavLink>
        ))}
      <NavLink label={misc.ctgMisc} leftSection={<Icon icon='tabler:mist' />} className="font-semibold">
        {data
          .filter((item) => item.subs.length === 0)
          .map((item, key) => (
            <NavLink key={key} component={Link} href={item.link} replace label={item.label} onClick={clickFn} />
          ))}
      </NavLink>
    </Box>
  );
}
