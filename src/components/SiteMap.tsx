"use client";

import { Anchor, Group, List, SimpleGrid, Stack, Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import type { LimitedCtgGridData } from "@/interfaces";
import { Link } from "@/navigation";

type CtgGrid = {
  data: LimitedCtgGridData;
  dict: {
    allSubsBtn: string;
  };
};

export function LimitedCategoriesGrid({ data, dict }: CtgGrid) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3, md: 4, lg: 5 }} my='lg' spacing='xs' visibleFrom='sm'>
      {data
        .filter((item) => item.subs.length > 0)
        .slice(0, 8)
        .map((item, key) => (
          <Stack key={key} gap='xs'>
            <Group justify='flex-start' gap='xs' wrap='nowrap'>
              <Icon icon={item.icon} className='text-2xl' />
              <Text fw={700}>{item.label}</Text>
            </Group>
            <List ps={34}>
              {item.subs.map((sItem, skey) => (
                <List.Item key={skey}>
                  <Anchor component={Link} href={sItem.link} fw={400} c='bright' fz='sm'>
                    {sItem.label}
                  </Anchor>
                </List.Item>
              ))}
              <List.Item>
                <Anchor component={Link} href={item.link} fw={500} fz='sm'>
                  {`${dict.allSubsBtn} ...`}
                </Anchor>
              </List.Item>
            </List>
          </Stack>
        ))}
      <Stack gap='xs'>
        <Group justify='flex-start' gap='xs' wrap='nowrap'>
          <Icon icon='tabler:mist' className='text-2xl' />
          <Text fw={700}>Misc</Text>
        </Group>
        <List ps={34}>
          {data
            .filter((item) => item.subs.length === 0)
            .slice(0, 2)
            .map((item, key) => (
              <List.Item key={key}>
                <Anchor component={Link} href={item.link} fw={400} c='bright' fz='sm'>
                  {item.label}
                </Anchor>
              </List.Item>
            ))}
          <List.Item>
            <Anchor component={Link} href='#sitemap' fw={500} fz='sm'>
              {`${dict.allSubsBtn} ...`}
            </Anchor>
          </List.Item>
        </List>
      </Stack>
    </SimpleGrid>
  );
}

// ⯇⯈
