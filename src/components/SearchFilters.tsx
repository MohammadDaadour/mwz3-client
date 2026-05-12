"use client";

import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/navigation";
import { Fieldset, Select, ComboboxItem, TextInput, ActionIcon, Checkbox } from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";
import classes from "./SearchFilters.module.css";
import { AreaFilterProps, CategoryFilterProps, SearchQueryProps, TypeFilterProps } from "@/interfaces";
import { IconSearch } from "@tabler/icons-react";
import { AppContext } from "../providers";

export function SearchQuery({ labels }: SearchQueryProps) {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams ?? undefined);

  const pathname = usePathname();
  const { replace } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [btnVariant, setBtnVariant] = useState("subtle");

  function handleChange(value: string) {
    if (value.length > 0) {
      setBtnVariant("filled");
    } else {
      setBtnVariant("subtle");
    }
  }

  function handleSearch() {
    const query = inputRef.current?.value;
    query ? queryParams.set("q", query) : queryParams.delete("q");
    replace(`${pathname}?${queryParams.toString()}`);
  }

  return (
    <Fieldset legend={labels.setSearch} variant='filled' classNames={{ legend: classes.legend }}>
      <TextInput
        ref={inputRef}
        placeholder={labels.lblPlaceholder}
        size='md'
        rightSectionWidth={42}
        rightSection={
          <ActionIcon variant={btnVariant} w={42} onClick={handleSearch}>
            <IconSearch stroke={1.5} />
          </ActionIcon>
        }
        defaultValue={queryParams.get("q")?.toString()}
        onChange={(e) => handleChange(e.target.value)}
        classNames={{ input: classes.searchInput }}
      />
    </Fieldset>
  );
}

export function AreaFilters({ areas, labels }: AreaFilterProps) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const areaParams = new URLSearchParams(useSearchParams() ?? undefined);
  const currParam = areaParams.get("a")?.toString();
  const context = useContext(AppContext);
  const [country, setCountry] = useState<ComboboxItem | null>(null);
  const [gov, setGov] = useState<ComboboxItem | null>(null);
  const [city, setCity] = useState<ComboboxItem | null>(null);
  const [dist, setDist] = useState<ComboboxItem | null>(null);

  function countryChange(option: ComboboxItem) {
    setCountry(option);
    setGov(null);
    setCity(null);
    setDist(null);
    areaParams.set("a", option.value);
    replace(`${pathname}?${areaParams.toString()}`);
  }

  function govChange(option: ComboboxItem) {
    setGov(option);
    setCity(null);
    setDist(null);
    option !== null ? areaParams.set("a", option.value) : areaParams.set("a", country!.value);
    replace(`${pathname}?${areaParams.toString()}`);
  }

  function cityChange(option: ComboboxItem) {
    setCity(option);
    setDist(null);
    option !== null ? areaParams.set("a", option.value) : areaParams.set("a", gov!.value);
    replace(`${pathname}?${areaParams.toString()}`);
  }

  function distChange(option: ComboboxItem) {
    setDist(option);
    option !== null ? areaParams.set("a", option.value) : areaParams.set("a", city!.value);
    replace(`${pathname}?${areaParams.toString()}`);
  }

  useEffect(() => {
    if (currParam) {
      const currOption = areas.find((item) => item.value === currParam);

      if (currOption?.level === 4) {
        const distOpt = currOption;
        const cityOpt = areas.find((item) => item.value === distOpt.parent)!;
        const govOpt = areas.find((item) => item.value === cityOpt?.parent)!;
        const countryOpt = areas.find((item) => item.value === govOpt?.parent)!;
        setCountry(countryOpt);
        setGov(govOpt);
        setCity(cityOpt);
        setDist(distOpt);
      } else if (currOption?.level === 3) {
        const cityOpt = currOption;
        const govOpt = areas.find((item) => item.value === cityOpt?.parent)!;
        const countryOpt = areas.find((item) => item.value === govOpt?.parent)!;
        setCountry(countryOpt);
        setGov(govOpt);
        setCity(cityOpt);
      } else if (currOption?.level === 2) {
        const govOpt = currOption;
        const countryOpt = areas.find((item) => item.value === govOpt?.parent)!;
        setCountry(countryOpt);
        setGov(govOpt);
      } else if (currOption?.level === 1) {
        const countryOpt = currOption;
        setCountry(countryOpt);
      }
    } else {
      areaParams.set("a", context!.country!.toString());
      replace(`${pathname}?${areaParams.toString()}`);
    }
  }, [currParam]);

  return (
    <Fieldset
      legend={labels.setArea}
      p={12}
      variant='filled'
      classNames={{ legend: classes.legend }}
      className='space-y-2'
    >
      <Select
        label={labels.lblCountry}
        data={areas.filter((item) => item.parent === "0").map((item) => ({ value: item.value, label: item.label }))}
        value={country ? country.value : null}
        onChange={(_value, option) => countryChange(option)}
        allowDeselect={false}
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />

      <Select
        label={
          country?.value === "3"
            ? labels.lblGovernorate
            : country?.value === "2"
              ? labels.lblProvience
              : labels.lblEmirate
        }
        data={areas
          .filter((item) => item.parent === country?.value)
          .map((item) => ({ value: item.value, label: item.label }))}
        value={gov ? gov.value : null}
        onChange={(_value, option) => govChange(option)}
        allowDeselect
        searchable
        clearable
        placeholder='...'
        nothingFoundMessage='nothing found ...'
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />

      <Select
        label={labels.lblCity}
        data={areas
          .filter((item) => item.parent === gov?.value)
          .map((item) => ({ value: item.value, label: item.label }))}
        value={city ? city.value : null}
        onChange={(_value, option) => cityChange(option)}
        allowDeselect
        searchable
        clearable
        placeholder='...'
        nothingFoundMessage='nothing found ...'
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        disabled={gov === null}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />

      <Select
        label={labels.lblDistrict}
        data={areas
          .filter((item) => item.parent === city?.value)
          .map((item) => ({ value: item.value, label: item.label }))}
        value={dist ? dist.value : null}
        onChange={(_value, option) => distChange(option)}
        allowDeselect
        searchable
        clearable
        placeholder='...'
        nothingFoundMessage='nothing found ...'
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        disabled={city === null || areas.filter((item) => item.parent === city?.value).length === 0}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />
    </Fieldset>
  );
}

export function CategoryFilters({ categories, labels }: CategoryFilterProps) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const ctgParams = new URLSearchParams(searchParams ?? undefined);
  const currParam = ctgParams.get("c")?.toString();
  const [main, setMain] = useState<ComboboxItem | null>(null);
  const [sub, setSub] = useState<ComboboxItem | null>(null);

  function mainChange(option: ComboboxItem) {
    setMain(option);
    setSub(null);
    option !== null ? ctgParams.set("c", option.value) : ctgParams.delete("c");
    replace(`${pathname}?${ctgParams.toString()}`);
  }

  function subChange(option: ComboboxItem) {
    setSub(option);
    option !== null ? ctgParams.set("c", option.value) : ctgParams.set("c", main!.value);
    replace(`${pathname}?${ctgParams.toString()}`);
  }

  useEffect(() => {
    const currOption = categories.find((item) => item.value === currParam);

    if (currOption?.level === 2) {
      const subOpt = currOption;
      const mainOpt = categories.find((item) => item.value === subOpt?.parent)!;
      setMain(mainOpt);
      setSub(subOpt);
    } else if (currOption?.level === 1) {
      const mainOpt = currOption;
      setMain(mainOpt);
      setSub(null);
    } else {
      setMain(null);
      setSub(null);
    }
  }, [currParam]);

  return (
    <Fieldset
      legend={labels.setCtg}
      p={12}
      variant='filled'
      classNames={{ legend: classes.legend }}
      className='space-y-2'
    >
      <Select
        label={labels.lblMainCtg}
        data={categories.filter((item) => item.level === 1).map((item) => ({ value: item.value, label: item.label }))}
        value={main ? main.value : null}
        onChange={(_value, option) => mainChange(option)}
        allowDeselect
        searchable
        clearable
        placeholder='...'
        nothingFoundMessage='nothing found ...'
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />
      <Select
        label={labels.lblSubCtg}
        data={categories
          .filter((item) => item.level === 2 && item.parent === main?.value)
          .map((item) => ({ value: item.value, label: item.label }))}
        value={sub ? sub.value : null}
        onChange={(_value, option) => subChange(option)}
        allowDeselect
        searchable
        clearable
        placeholder='...'
        nothingFoundMessage='nothing found ...'
        comboboxProps={{ shadow: "md", position: "bottom", middlewares: { flip: false, shift: false }, offset: 0 }}
        disabled={main === null || categories.filter((item) => item.parent === main?.value).length === 0}
        classNames={{ input: classes.selectInput, dropdown: classes.selectDropdown }}
      />
    </Fieldset>
  );
}

export function TypeFilters({ labels }: TypeFilterProps) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [boosted, setBoosted] = useState(false);
  const [certified, setCertified] = useState(false);
  const searchParams = useSearchParams();
  const filterParams = new URLSearchParams(searchParams ?? undefined);
  const currParam = filterParams.get("filter");

  function handleBoosted(value: boolean) {
    if (value) {
      if (currParam) {
        filterParams.set("filter", currParam + "bst");
      } else {
        filterParams.set("filter", "bst");
      }
    } else {
      if (currParam) {
        filterParams.set("filter", currParam.replace("bst", ""));
      }
    }
    replace(`${pathname}?${filterParams.toString()}`);
    setBoosted(value);
  }

  function handleCertified(value: boolean) {
    if (value) {
      if (currParam) {
        filterParams.set("filter", currParam + "crt");
      } else {
        filterParams.set("filter", "crt");
      }
    } else {
      if (currParam) {
        filterParams.set("filter", currParam.replace("crt", ""));
      }
    }
    replace(`${pathname}?${filterParams.toString()}`);
    setCertified(value);
  }

  return (
    <Fieldset
      legend={labels.setType}
      p={12}
      variant='filled'
      classNames={{ legend: classes.legend }}
      className='space-y-2'
    >
      <Checkbox label={labels.lblBoosted} checked={boosted} onChange={(e) => handleBoosted(e.currentTarget.checked)} />
      <Checkbox
        label={labels.lblCertified}
        checked={certified}
        onChange={(e) => handleCertified(e.currentTarget.checked)}
      />
    </Fieldset>
  );
}
