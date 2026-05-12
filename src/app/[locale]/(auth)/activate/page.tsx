"use client";

import { sendActivationAction, proccessActivationAction } from "@/libs/actions";
import { useRouter } from "@/navigation";
import { TextInput, Text, Button, Group, Container, Alert } from "@mantine/core";
import { isEmail, useField } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParam = searchParams?.get("token") ?? undefined;
  const [activateMsg, setActivateMsg] = useState("");
  const [confirmMsg, setConfirmMsg] = useState(["", ""]);
  const [form, setForm] = useState(false);
  const t = useTranslations("Login");

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const emailField = useField({
    initialValue: "",
    validateOnBlur: true,
    validate: isEmail(t("errInvalidEmail")),
  });

  async function handleSend(emailValue: string) {
    const { data, status } = await sendActivationAction(emailValue);
    if (status >= 400) {
      setConfirmMsg(["red", data.message]);
    } else {
      setConfirmMsg(["green", t("msgActivateSent")]);
    }
  }

  async function handleGet(tokenValue: string) {
    const { data, status } = await proccessActivationAction(tokenValue);
    if (status >= 400) {
      switch (data.message) {
        case "expired":
          setActivateMsg(t("errTokenExpired"));
          setForm(true);
          break;
        case "bad":
          setActivateMsg(t("errTokenBad"));
          setForm(true);
          break;
        default:
          setActivateMsg(t("errActivateElse"));
          setForm(true);
      }
    } else if (status === 200) {
      setActivateMsg(t("msgActivateSuccess"));
      setForm(false);
      await delay(5000);
      router.push("/login");
    } else {
      setActivateMsg(t("errActivateElse"));
      setForm(true);
    }
  }

  useEffect(() => {
    if (currentParam !== undefined) {
      handleGet(currentParam);
    }
  }, [currentParam]);

  if (currentParam === undefined) {
    return (
      <Container className='max-w-md' p='md'>
        <Text>{t("txtEnterEmail")}</Text>
        <Group align='end' my='lg' grow preventGrowOverflow={false} wrap='nowrap'>
          <TextInput {...emailField.getInputProps()} />
          <Button
            onClick={() => {
              handleSend(emailField.getValue());
            }}
            className='grow-0'
          >
            {t("btnSendEmail")}
          </Button>
        </Group>
        {confirmMsg[0].length > 0 ? <Alert color={confirmMsg[0]}>{confirmMsg[1]}</Alert> : null}
      </Container>
    );
  } else {
    return (
      <Container className='max-w-md' p='md'>
        <Text>{activateMsg}</Text>
        {!form ? null : (
          <Group align='end' my='lg' grow preventGrowOverflow={false} wrap='nowrap'>
            <TextInput {...emailField.getInputProps()} />
            <Button
              onClick={() => {
                handleSend(emailField.getValue());
              }}
              className='grow-0'
            >
              {t("btnSendEmail")}
            </Button>
          </Group>
        )}
        {confirmMsg[0].length > 0 ? <Alert color={confirmMsg[0]}>{confirmMsg[1]}</Alert> : null}
      </Container>
    );
  }
}
