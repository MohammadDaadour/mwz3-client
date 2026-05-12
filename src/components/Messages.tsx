"use client";

import Error from "@/app/[locale]/error";
import { IMessage } from "@/interfaces";
import { privateFetcher } from "@/libs/functions";
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import useSWR from "swr";
import classes from "./Messages.module.css";
import { useFormatter } from "next-intl";
import { useContext, useEffect, useRef, useState } from "react";
import { markReadAction, sendMessageAction } from "@/libs/actions";
import { IconChecks, IconMessage } from "@tabler/icons-react";
import { AppContext } from "@/providers";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

type Props = {
  tx: number;
  rx: number;
  partner: string;
};

export function Messages({ tx, rx, partner }: Props) {
  const format = useFormatter();
  const [input, setInput] = useState("");
  const viewport = useRef<HTMLDivElement>(null);

  const {
    data: messages,
    error,
    isLoading,
  } = useSWR<IMessage[]>(tx !== 0 && rx !== 0 ? `${process.env.API_URL}/messages/${tx}/${rx}` : null, privateFetcher, {
    refreshInterval: 3000,
  });

  function handleSubmit(e?: any) {
    if (e && e.keyCode === 13 && input.trim().length > 0) {
      sendMessageAction(tx, rx, input);
      setInput("");
    } else if (!e && input.trim().length > 0) {
      sendMessageAction(tx, rx, input);
      setInput("");
    }
  }

  function handleScroll() {
    viewport.current?.scrollTo({ top: viewport.current!.scrollHeight, behavior: "smooth" });
  }

  useEffect(() => {
    handleScroll();
    markReadAction(rx, tx);
  }, [messages]);

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

  if (messages) {
    return (
      <Flex direction='column' h='100%' gap='xs' classNames={{ root: classes.colInner }}>
        <Box>
          <Text size='lg' px='sm' fw={600}>
            {partner}
          </Text>
        </Box>
        <Divider />
        <ScrollArea type='auto' scrollbarSize={4} viewportRef={viewport} mih={200} mah='80%' className='grow'>
          {messages.map((item, index) => (
            <Group
              key={index}
              gap='xs'
              my='xs'
              wrap='nowrap'
              align='end'
              justify={item.rx === rx ? "flex-start" : "flex-end"}
              className={`${item.rx === rx ? "ms-2 me-20" : "me-2 ms-20"}`}
            >
              <div className={`${item.rx === rx ? "mtx" : "mrx"} px-2 rounded`}>
                <Text classNames={{ root: classes.message }}>{item.value}</Text>
                <Text size='xs'>
                  {format.dateTime(Date.parse(item.createdAt), { dateStyle: "short", timeStyle: "short" })}
                </Text>
              </div>
              {item.read && item.rx === rx ? <IconChecks size={20} /> : undefined}
            </Group>
          ))}
        </ScrollArea>
        <Divider />
        <Flex direction='row' wrap='nowrap' gap='xs'>
          <TextInput
            value={input}
            className='grow'
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyUp={(e) => handleSubmit(e)}
          />
          <Button onClick={() => handleSubmit()}>ارسال</Button>
        </Flex>
      </Flex>
    );
  }
}

type SendMessageModal = {
  params: {
    locale: string;
    rx: number;
    partner: string;
  };
};

export function SendMessageModal({ params: { locale, rx, partner } }: SendMessageModal) {
  const context = useContext(AppContext);
  const [opened, { open, close }] = useDisclosure(false);
  const fullScreen = useMediaQuery('(min-width: 1024px)')

  if (context.user.id === 0) {
    return (
      <Tooltip
        label={locale === "en" ? "Please login to be able to send a message" : "برجاء تسجيل الدخول لتتمكن من المحادثة"}
      >
        <Button color='red' variant='light' fullWidth rightSection={<IconMessage />}>
          {locale === "en" ? "Send Message" : "محادثة"}
        </Button>
      </Tooltip>
    );
  } else {
    return (
      <>
        <Modal opened={opened} onClose={close} fullScreen={!fullScreen}>
          <Messages tx={context.user.id} rx={rx} partner={partner} />
        </Modal>
        <Button color='red' variant='light' fullWidth rightSection={<IconMessage />} disabled={rx === context.user.id} onClick={open}>
          {locale === "en" ? "Send Message" : "محادثة"}
        </Button>
      </>
    );
  }
}
