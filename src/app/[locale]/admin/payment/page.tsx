'use client';

import { useState } from 'react';
import { Button, Title, Paper, Container, Stack, NumberInput, Text } from '@mantine/core';
import { IconCreditCard } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { createPayment } from '@/libs/actions';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const t = useTranslations('Payment');
    const router = useRouter();
    const [amount, setAmount] = useState<number>(0);

    const handlePayment = async () => {
        const { status, data } = await createPayment(amount);
        if (status === 200 || status === 201) {
            router.push(data.url);
        }
    };

    return (
        <Container size="xs" py={100}>
            <Paper withBorder shadow="md" p="xl" radius="md">
                <Stack gap="md">
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <Title order={2} fw={700}>{t('title')}</Title>
                        <Text size="sm" c="dimmed">{t('subtitle')}</Text>
                    </div>
                    <NumberInput
                        label={t('amountLabel')}
                        placeholder="0.00"
                        size="md"
                        min={0}
                        decimalScale={2}
                        fixedDecimalScale
                        value={amount}
                        onChange={(val) => setAmount(typeof val === 'number' && val >= 0 ? val : 0)}
                        prefix="EGP"
                    />
                    <Button
                        fullWidth
                        size="md"
                        leftSection={<IconCreditCard size={20} />}
                        color="DeepOrange"
                        mt="md"
                        radius="md"
                        disabled={amount === 0}
                        onClick={handlePayment}
                    >
                        {t('payButton')}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}
