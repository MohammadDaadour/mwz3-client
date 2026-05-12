"use client";

import { ActionIcon, Button, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useRouter } from "@/navigation";
import { useRef } from "react";
import { IconSearch } from "@tabler/icons-react";

type props = {
  variant?: string;
  size?: string;
};

export function SearchModal({ variant = "filled", size = "sm" }: props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    router.push(`/results?q=${inputRef.current?.value}`);
  }

  const searchModal = () => {
    modals.open({
      title: "Search",
      size: "sm",
      id: "search",
      children: (
        <TextInput
          ref={inputRef}
          placeholder='search ...'
          size='md'
          rightSectionWidth={54}
          rightSection={
            <ActionIcon
              variant='filled'
              w={42}
              onClick={() => {
                handleSearch(), modals.closeAll();
              }}
            >
              <IconSearch stroke={1.5} />
            </ActionIcon>
          }
        />
      ),
    });
  };

  return (
    <Button className="hidden md:inline-block" onClick={searchModal} variant={variant} size={size}>
      <IconSearch size={24} stroke={2} />
    </Button>
  );
}
