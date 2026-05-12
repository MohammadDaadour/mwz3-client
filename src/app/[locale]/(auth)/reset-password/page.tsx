'use client'
import { useState, useEffect } from "react";
import { isEmail, useField } from "@mantine/form";
import { TextInput, Text, Button, Group, Container, Alert, PasswordInput } from "@mantine/core";
import { sendResetAction, updatePasswordAction, VerifyResetToken, resetPasswordAction } from "@/libs/actions";
import { useTranslations } from "next-intl";
import { useRouter } from 'next/navigation';

type Props = { params: { locale: string }; searchParams: { [key: string]: string | string[] | undefined } };

export default function ResetPasswordPage({ params, searchParams }: Props) {

  const [resetMsg, setResetMsg] = useState("");
  const [confirmMsg, setConfirmMsg] = useState(["", ""]);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const router = useRouter();

  const t = useTranslations("Login");

  const emailField = useField({
    initialValue: "",
    validateOnBlur: true,
    validate: isEmail(t("errInvalidEmail")),
  });

  const passwordField = useField({
    initialValue: "",
    validate: (value) =>
      value.length < 6 ? t("errPass") : null,
  });

  const confirmPasswordField = useField({
    initialValue: "",
    validate: (value) =>
      value !== passwordField.getValue()
        ? t("errPassMismatch")
        : null,
  });

  async function handleSend(emailValue: string) {
    const { data, status } = await sendResetAction(emailValue);
    if (status >= 400) {
      setConfirmMsg(["red", data.message]);
    } else {
      setConfirmMsg(["green", t("msgActivateSent")]);
    }
  }

  async function handleResetPassword(password: string) {
    const { data, status } = await resetPasswordAction(password, searchParams?.token as string);

    if (status >= 400) {
      console.log(data);
      setConfirmMsg(["red", data.message]);
    } else {
      router.push('/login');
      setConfirmMsg(["green", t("msgPasswordResetSuccess")]);
    }
  }

  useEffect(() => {
    if (!searchParams?.token) return;

    async function verifyToken() {
      const { status } = await VerifyResetToken(searchParams.token as string);
      setTokenValid(status === 200);
    }

    verifyToken();
  }, [searchParams?.token]);

  if (searchParams?.token && tokenValid === null) {
    return (
      <Container className="max-w-md" p="md">
      </Container>
    );
  }

  if (searchParams?.token && tokenValid === false) {
    return (
      <Container className="max-w-md" p="md">
        <Alert color="red">
          {t("errInvalidOrExpiredToken")}
        </Alert>
      </Container>
    );
  }

  if (searchParams?.token) {
    return (
      <>
        <Container className='max-w-md' p='md'>
          <Text className="my-2">{t("passwordLabel")}</Text>
          <PasswordInput className="my-2" {...passwordField.getInputProps()} />
          <Text className="my-2">{t("passwordConfirmationLabel")}</Text>
          <PasswordInput className="my-2" {...confirmPasswordField.getInputProps()} />
          <Button
            onClick={async () => {
              const passwordError = await passwordField.validate();
              const confirmError = await confirmPasswordField.validate();

              if (passwordError || confirmError) return;

              await handleResetPassword(passwordField.getValue());
            }}
            className='grow-0 my-2'
          >
            {t("btnSendEmail")}
          </Button>
          {confirmMsg[0].length > 0 ? <Alert color={confirmMsg[0]}>{confirmMsg[1]}</Alert> : null}
        </Container>
      </>
    );
  } else {
    return (
      <>
        <Container className='max-w-md' p='md'>
          <Text>{t("EnterResetEmail")}</Text>
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
      </>
    );
  }
}
