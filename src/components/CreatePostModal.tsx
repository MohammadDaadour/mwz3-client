// components/CreatePostModal.tsx
"use client";

import { useParams } from "next/navigation";
import { Modal, TextInput, Textarea, Button, Alert } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { createPostAction } from "@/libs/actions";
import { useState } from "react";

export function CreatePostModal({ onCreated }: { onCreated?: () => void }) {
    const labels = {
        en: {
            create: "Create new post",
            title: "Title",
            content: "Content",
            submit: "Submit",
            success: "Post created successfully!"

        },
        ar: {
            create: "انشاء منشور جديد",
            title: "العنوان",
            content: "المحتوي",
            submit: "انشاء",
            success: "تم الانشاء بنجاح!"
        },
    };
    const { locale } = useParams<any>();
    const lang = locale === 'ar' ? 'ar' : 'en';
    const t = labels[lang];

    const [opened, { open, close }] = useDisclosure(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const form = useForm({
        initialValues: {
            title: "",
            content: "",
        },
        validate: {
            title: value => (value.length < 3 ? "Title too short" : null),
            content: value => (value.length < 10 ? "Content too short" : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const status = await createPostAction(values);
        setLoading(false);

        if (status === 201 || status === 200) {
            setDone(true);
            form.reset();
            onCreated?.();
        }
    };

    return (
        <>
            <Button onClick={open} className="mb-4 mx-2">{t.create}</Button>
            <Modal opened={opened} onClose={close} title={t.create} size="md">
                <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                    <TextInput
                        label={t.title}
                        {...form.getInputProps("title")}
                        withAsterisk
                    />

                    <Textarea
                        label={t.content}
                        minRows={4}
                        {...form.getInputProps("content")}
                        withAsterisk
                    />
                    <Button type="submit" loading={loading} fullWidth>
                        {t.submit}
                    </Button>
                    {done && (
                        <Alert color="green" mt="md">
                            {t.success}
                        </Alert>
                    )}
                </form>
            </Modal>
        </>
    );
}
