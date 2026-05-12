"use client";

import { IUser } from "@/interfaces";
import { privateFetcher } from "@/libs/functions";
import { AppContext } from "@/providers";
import { Box, Button, Flex, Grid, LoadingOverlay, Modal, ScrollArea, Text } from "@mantine/core";
import { useContext, useState } from "react";
import useSWR from "swr";
import Error from "../../error";
import { Messages } from "@/components/Messages";
import classes from "./styles.module.css";
import { IconExclamationCircleFilled } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

type Props = { params: { locale: string } };

export default function UserMessagesPage({ params: { locale } }: Props) {
  const context = useContext(AppContext);
  const [partner, setPartner] = useState(0);
  const [opened, { open, close }] = useDisclosure(false);
  const fullScreen = useMediaQuery("(min-width: 1024px)");

  const {
    data: threads,
    error,
    isLoading,
  } = useSWR<IUser[]>(
    context.user.id > 0 ? `${process.env.API_URL}/messages/${context.user.id}` : null,
    privateFetcher,
    {
      revalidateOnFocus: true,
    }
  );

  const { data: newThreads } = useSWR<number[]>(
    context.user.id > 0 ? `${process.env.API_URL}/messages/notif/${context.user.id}/threads` : null,
    privateFetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
    }
  );

  if (isLoading) {
    return (
      <Box pos='relative' w='full' h='300px' mx='auto'>
        <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  if (error) {
    return <Error />;
  }

  if (threads) {
    return (
      <Flex direction='column' gap='sm' h='100%'>
        <Text fw={700} fz='h1'>
          الرسائل
        </Text>
        <div className='grow max-w-5xl'>
          <Grid gutter='xs' classNames={classes} visibleFrom='sm'>
            <Grid.Col span={3}>
              <ScrollArea type='hover' scrollbarSize={4} h='100%' classNames={{ root: classes.colInner }}>
                <Button
                  variant='subtle'
                  fullWidth
                  justify='start'
                  fz='md'
                  rightSection={newThreads?.includes(2) ? <IconExclamationCircleFilled /> : undefined}
                  styles={{ label: { color: "var(--mantine-color-text)" } }}
                  onClick={() => setPartner(2)}
                >
                  MWZ3 Support
                </Button>
                {threads?.map((item, index) => (
                  <Button
                    key={index}
                    variant='subtle'
                    fullWidth
                    justify='start'
                    fz='md'
                    styles={{ label: { color: "var(--mantine-color-text)" } }}
                    rightSection={newThreads?.includes(item.id) ? <IconExclamationCircleFilled /> : undefined}
                    onClick={() => setPartner(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </ScrollArea>
            </Grid.Col>
            <Grid.Col span={9}>
              <Messages
                tx={context.user.id}
                rx={partner}
                partner={partner === 2 ? "MWZ3 Support" : threads.filter((item) => item.id === partner)[0]?.label}
              />
            </Grid.Col>
          </Grid>

          <Grid hiddenFrom='sm'>
            <Grid.Col span={12}>
              <ScrollArea type='hover' scrollbarSize={4} mih={300} h='100%' classNames={{ root: classes.colInner }}>
                <Button
                  variant='subtle'
                  fullWidth
                  justify='start'
                  fz='md'
                  rightSection={newThreads?.includes(2) ? <IconExclamationCircleFilled /> : undefined}
                  styles={{ label: { color: "var(--mantine-color-text)" } }}
                  onClick={() => {
                    setPartner(2), open();
                  }}
                >
                  MWZ3 Support
                </Button>
                {threads?.map((item, index) => (
                  <Button
                    key={index}
                    variant='subtle'
                    fullWidth
                    justify='start'
                    fz='md'
                    styles={{ label: { color: "var(--mantine-color-text)" } }}
                    rightSection={newThreads?.includes(item.id) ? <IconExclamationCircleFilled /> : undefined}
                    onClick={() => {
                      setPartner(item.id), open();
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </ScrollArea>
            </Grid.Col>
          </Grid>

          <Modal opened={opened} onClose={close} fullScreen={!fullScreen}>
            <Messages
              tx={context.user.id}
              rx={partner}
              partner={partner === 2 ? "MWZ3 Support" : threads.filter((item) => item.id === partner)[0]?.label}
            />
          </Modal>
        </div>
      </Flex>
    );
  }
}
