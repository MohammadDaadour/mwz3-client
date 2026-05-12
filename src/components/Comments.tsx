"use client";

import { IComment } from "@/interfaces";
import { createCommentAction, deleteCommentAction } from "@/libs/actions";
import { publicFetcher } from "@/libs/functions";
import { AppContext } from "@/providers";
import { Box, Button, Center, Divider, Group, Stack, Text, Textarea } from "@mantine/core";
import { useFormatter } from "next-intl";
import { useContext, useRef, useState } from "react";
import useSWR from "swr";

type AdCommentsProps = {
  locale: string;
  adId: number;
};

export function AdComments({ adId, locale }: AdCommentsProps) {
  const format = useFormatter();
  const context = useContext(AppContext);
  const [comment, setComment] = useState("");
  const { data, mutate } = useSWR<IComment[]>(`${process.env.API_URL}/comments/${adId}`, publicFetcher);

  async function handleDelete(id: number) {
    await deleteCommentAction(id);
    mutate();
  }

  function handlePost(user: number) {
    if (comment.length > 0) {
      const values = { userFK: user, adFK: adId, value: comment };
      createCommentAction(values);
    }
    setComment("");
    mutate();
  }

  const allowDelete = (userId: number) => {
    if (context.user.role === "su" || context.user.role === "admin") return true;
    else if (context.user.id === userId) return true;
    else return false;
  };

  const allowPost = () => {
    if (context.user.id === 0) {
      return true;
    } else {
      switch (context.user.role) {
        case "user":
          return false;
        case "merch":
          return false;
        default:
          return true;
      }
    }
  };

  console.log(allowPost(), context.user)

  if (data && data.length >= 0) {
    return (
      <Stack>
        <Group gap='xs' align='end'>
          <Textarea
            disabled={allowPost()}
            className='grow'
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Button disabled={allowPost()} className='shrink-0 grow-0' onClick={() => handlePost(context.user.id)}>
            إضافة تعليق
          </Button>
        </Group>

        {data.map((item) => (
          <Box key={item.id}>
            <Divider w='80%' mx='auto' py={3} />
            <Stack gap='xs'>
              <Group wrap='nowrap' gap='xs'>
                <Text fw={500}>
                  {format.dateTime(Date.parse(item.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
                </Text>
                <Text>-</Text>
                <Text fw={500}>{item.user.label}</Text>
              </Group>
              <Group wrap='nowrap'>
                <Text component='pre' className='grow' style={{ textWrap: "pretty" }}>
                  {item.value}
                </Text>
                {allowDelete(item.userFK) && (
                  <Button variant='subtle' c='red' className='shrink-0 grow-0' onClick={() => handleDelete(item.id)}>
                    حذف
                  </Button>
                )}
              </Group>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Group gap='xs' align='end'>
          <Textarea
            disabled={allowPost()}
            className='grow'
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Button disabled={allowPost()} className='shrink-0 grow-0' onClick={() => handlePost(context.user.id)}>
            إضافة تعليق
          </Button>
        </Group>
        <Center>
          <Text>لا يوجد تعليقات</Text>
        </Center>
      </Stack>
    );
  }
}
