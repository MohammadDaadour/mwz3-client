"use client";

import { IArea, ICategory, ISubType } from "@/interfaces";
import {
  createAreaAction,
  createCategoryAction,
  createSubType,
  approveBoost,
  updateAreaAction,
  updateCategoryAction,
  updateSubType,
  rejectBoost,
  updateAdAdminAction
} from "@/libs/actions";
import {
  Button,
  Checkbox,
  ComboboxItem,
  Group,
  MenuItem,
  Modal,
  NumberInput,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

type CtgFormProps = {
  data: ICategory[];
  item?: ICategory;
  variant?: string;
};

export function CategoryModalForm({ data, item, variant = "filled" }: CtgFormProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [levelOpt, setLevelOpt] = useState<ComboboxItem | null>(null);
  const [parentOpt, setParentOpt] = useState<ComboboxItem | null>(null);

  const categoryForm = useForm({
    mode: "uncontrolled",
    initialValues: item
      ? { ...item, level: item.level.toString(), parent: item.parent.toString }
      : { level: "", parent: "", labelEn: "", labelAr: "", icon: "", order: 0, promote: false },
    validate: {
      labelEn: isNotEmpty(),
      labelAr: isNotEmpty(),
    },
  });

  const levelData = [
    { value: "1", label: "رئيسي" },
    { value: "2", label: "فرعي" },
  ];

  useEffect(() => {
    if (item) {
      setLevelOpt(item.level === 1 ? levelData[0] : levelData[1]);
      setParentOpt(
        data.filter((ctg) => ctg.id === item.parent).map((ctg) => ({ value: ctg.id.toString(), label: ctg.labelAr }))[0]
      );
    }
  }, [item]);

  async function handleSubmit(values: typeof categoryForm.values) {
    if (!levelOpt) {
      categoryForm.setFieldError("level", true);
      return;
    } else if (levelOpt.value === "2" && !parentOpt) {
      categoryForm.setFieldError("parent", true);
      return;
    }
    const formData = { ...values, level: +levelOpt.value, parent: parentOpt ? +parentOpt.value : 0 };
    if (item) {
      const status = await updateCategoryAction(item.id, formData);
      status === 200 ? window.location.reload() : alert(`حدث خطأ في عملية انشاء التصنيف، كود ${status}`);
    } else {
      const status = await createCategoryAction(formData);
      status === 201 ? window.location.reload() : alert(`حدث خطأ في عملية انشاء التصنيف، كود ${status}`);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title='إضافة تصنيف جديد'>
        <form onSubmit={categoryForm.onSubmit((values) => handleSubmit(values))} className='flex flex-col space-y-4'>
          <Select
            label='المستوى'
            data={levelData}
            value={levelOpt ? levelOpt.value : null}
            onChange={(_value, option) => {
              setLevelOpt(option), setParentOpt(null);
            }}
            error={categoryForm.errors.level}
          />
          <Select
            label='التصنيف الرئيسي'
            data={data
              .filter((item) => item.level === 1)
              .map((item) => ({ value: item.id.toString(), label: item.labelAr }))}
            onChange={(_value, option) => setParentOpt(option)}
            value={parentOpt ? parentOpt.value : null}
            error={categoryForm.errors.parent}
            disabled={levelOpt?.value !== "2"}
          />
          <TextInput
            {...categoryForm.getInputProps("labelAr")}
            key={categoryForm.key("labelAr")}
            label='الاسم العربي'
          />
          <TextInput
            {...categoryForm.getInputProps("labelEn")}
            key={categoryForm.key("labelEn")}
            label='الاسم الإنكليزي'
          />
          <TextInput
            {...categoryForm.getInputProps("icon")}
            key={categoryForm.key("icon")}
            label='أيقونة'
            description='استخدم ايقونات من موقع icones.js.org'
          />
          <Group justify='space-between' wrap='nowrap' align='center'>
            <NumberInput
              {...categoryForm.getInputProps("order")}
              key={categoryForm.key("order")}
              allowNegative={false}
              allowDecimal={false}
              w='33%'
              label='الترتيب'
            />
            <Checkbox
              {...categoryForm.getInputProps("promote", { type: "checkbox" })}
              key={categoryForm.key("promote")}
              defaultChecked={item ? item.promote : false}
              label='ترويج (عرض على الصفحة الرئيسية) ؟'
            />
          </Group>
          <Group justify='space-evenly'>
            <Button
              onClick={() => {
                categoryForm.reset(), close();
              }}
            >
              إلغاء
            </Button>
            <Button type='submit'>حفظ</Button>
          </Group>
        </form>
      </Modal>

      <Button onClick={open} variant={variant}>
        {item ? "تعديل" : "إضافة"}
      </Button>
    </>
  );
}

type AreaFormProps = {
  data: IArea[];
  item?: IArea;
  variant?: string;
};

export function AreaModalForm({ data, item, variant = "filled" }: AreaFormProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [levelOpt, setLevelOpt] = useState<ComboboxItem | null>(null);
  const [countryOpt, setCountryOpt] = useState<ComboboxItem | null>(null);
  const [govOpt, setGovOpt] = useState<ComboboxItem | null>(null);
  const [cityOpt, setCityOpt] = useState<ComboboxItem | null>(null);

  const areaForm = useForm({
    mode: "uncontrolled",
    initialValues: item
      ? { ...item, level: item.level.toString(), parent: item.parent.toString }
      : { level: "", parent: "", labelEn: "", labelAr: "" },
    validate: {
      labelEn: isNotEmpty(),
      labelAr: isNotEmpty(),
    },
  });

  const levelData = [
    { value: "2", label: "محافظة / مقاطعة" },
    { value: "3", label: "مدينة" },
    { value: "4", label: "منطقة" },
  ];

  useEffect(() => {
    if (item) {
      setLevelOpt(levelData.filter((lvl) => lvl.value === item.level.toString())[0]);
      switch (item.level) {
        case 2:
          setCountryOpt(
            data
              .filter((country) => country.id === item.parent)
              .map((country) => ({ value: country.id.toString(), label: country.labelAr }))[0]
          );
          break;
        case 3:
          var itemGov = data.filter((gov) => gov.id === item.parent)[0];
          setCountryOpt(
            data
              .filter((country) => country.id === itemGov.parent)
              .map((country) => ({ value: country.id.toString(), label: country.labelAr }))[0]
          );
          setGovOpt(
            data
              .filter((gov) => gov.id === itemGov.id)
              .map((gov) => ({ value: gov.id.toString(), label: gov.labelAr }))[0]
          );
          break;
        case 4:
          var itemCity = data.filter((city) => city.id === item.parent)[0];
          var itemGov = data.filter((gov) => gov.id === itemCity.parent)[0];
          setCountryOpt(
            data
              .filter((country) => country.id === itemGov.parent)
              .map((country) => ({ value: country.id.toString(), label: country.labelAr }))[0]
          );
          setGovOpt(
            data
              .filter((gov) => gov.id === itemGov.id)
              .map((gov) => ({ value: gov.id.toString(), label: gov.labelAr }))[0]
          );
          setCityOpt(
            data
              .filter((city) => city.id === itemCity.id)
              .map((city) => ({ value: city.id.toString(), label: city.labelAr }))[0]
          );
          break;
      }
    }
  }, [item]);

  async function handleSubmit(values: typeof areaForm.values) {
    var level: number;
    var parent: number;

    if (levelOpt) {
      level = +levelOpt.value;

      if (levelOpt.value === "2" && countryOpt?.value) {
        parent = +countryOpt.value;
      } else if (levelOpt.value === "3" && govOpt?.value) {
        parent = +govOpt.value;
      } else if (levelOpt.value === "4" && cityOpt?.value) {
        parent = +cityOpt.value;
      } else {
        areaForm.setFieldError("parent", true);
        return;
      }
    } else {
      areaForm.setFieldError("level", true);
      return;
    }

    const formData = { ...values, level: level, parent: parent };

    if (item) {
      const status = await updateAreaAction(item.id, formData);
      status === 200 ? window.location.reload() : alert(`حدث خطأ في عملية انشاء التصنيف، كود ${status}`);
    } else {
      const status = await createAreaAction(formData);
      status === 201 ? window.location.reload() : alert(`حدث خطأ في عملية انشاء التصنيف، كود ${status}`);
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title='إضافة تصنيف جديد'>
        <form onSubmit={areaForm.onSubmit((values) => handleSubmit(values))} className='flex flex-col space-y-4'>
          <Select
            label='المستوى'
            data={levelData}
            value={levelOpt ? levelOpt.value : null}
            onChange={(_value, option) => {
              setLevelOpt(option), setCountryOpt(null), setGovOpt(null), setCityOpt(null);
            }}
            error={areaForm.errors.level}
          />

          <Select
            label='البلد'
            data={data
              .filter((item) => item.level === 1)
              .map((item) => ({ value: item.id.toString(), label: item.labelAr }))}
            onChange={(_value, option) => {
              setCountryOpt(option), setGovOpt(null), setCityOpt(null);
            }}
            value={countryOpt ? countryOpt.value : null}
            error={areaForm.errors.parent}
            disabled={!levelOpt}
          />

          <Select
            label='المحافظة / المقاطعة'
            data={
              countryOpt
                ? data
                  .filter((item) => item.parent === parseInt(countryOpt.value, 10))
                  .map((item) => ({ value: item.id.toString(), label: item.labelAr }))
                : undefined
            }
            onChange={(_value, option) => {
              setGovOpt(option), setCityOpt(null);
            }}
            value={govOpt ? govOpt.value : null}
            error={areaForm.errors.parent}
            disabled={!levelOpt || levelOpt.value === "2"}
          />

          <Select
            label='المدينة'
            data={
              govOpt
                ? data
                  .filter((item) => item.parent === parseInt(govOpt.value, 10))
                  .map((item) => ({ value: item.id.toString(), label: item.labelAr }))
                : undefined
            }
            onChange={(_value, option) => setCityOpt(option)}
            value={cityOpt ? cityOpt.value : null}
            error={areaForm.errors.parent}
            disabled={!levelOpt || levelOpt.value === "3" || levelOpt.value === "2"}
          />

          <TextInput {...areaForm.getInputProps("labelAr")} key={areaForm.key("labelAr")} label='الاسم العربي' />
          <TextInput {...areaForm.getInputProps("labelEn")} key={areaForm.key("labelEn")} label='الاسم الإنكليزي' />

          <Group justify='space-evenly'>
            <Button
              onClick={() => {
                areaForm.reset(), close();
              }}
            >
              إلغاء
            </Button>
            <Button type='submit'>حفظ</Button>
          </Group>
        </form>
      </Modal>

      <Button onClick={open} variant={variant}>
        {item ? "تعديل" : "إضافة"}
      </Button>
    </>
  );
}

type AdminAdFormProps = {
  ad: number;
  notes: string;
  state: number;
};

export function AdminAdForm({ ad, notes, state }: AdminAdFormProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [stateOpt, setStateOpt] = useState<ComboboxItem | null>(null);

  const adForm = useForm({
    initialValues: { notes: notes, stateFK: state.toString() },
  });

  async function handleSubmit(values: typeof adForm.values) {
    if (stateOpt && +stateOpt.value < 5) {
      const formData = { notes: values.notes, stateFK: parseInt(stateOpt.value), activatedAt: null };
      await updateAdAdminAction(ad, formData);
      close();
    } else if (stateOpt && +stateOpt.value > 4) {
      const formData = { notes: values.notes, stateFK: parseInt(stateOpt.value), activatedAt: new Date() };
      await updateAdAdminAction(ad, formData);
      close();
    }
  }

  const stateData = [
    { value: "1", label: "مسودة" },
    { value: "2", label: "مراجعة" },
    { value: "3", label: "مقبول" },
    { value: "4", label: "مرفوض" },
    { value: "5", label: "نشر" },
    { value: "6", label: "تحقق غرضه" },
  ];

  useEffect(() => {
    setStateOpt(stateData.filter((item) => item.value === state.toString())[0]);
  }, []);

  return (
    <>
      <Modal opened={opened} onClose={close}>
        <form onSubmit={adForm.onSubmit((values) => handleSubmit(values))} className='flex flex-col space-y-4'>
          <Select
            label='الحالة'
            data={stateData}
            value={stateOpt ? stateOpt.value : null}
            onChange={(_value, option) => {
              setStateOpt(option);
            }}
            clearable={false}
          />
          <TextInput {...adForm.getInputProps("notes")} key={adForm.key("notes")} label='ملاحظات:' />
          <Button type='submit'>اعتمد</Button>
        </form>
      </Modal>
      <Button variant='transparent' onClick={open}>
        تعديل
      </Button>
    </>
  );
}

type BoostAdFormProps = {
  ad: number;
  boosted: boolean;
  boost_request: boolean;
  plan: string;
  boost_end: string;
};

export function BoostAdForm({ ad, boosted, boost_request, plan, boost_end }: BoostAdFormProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleApproval = () => {
    approveBoost(ad);
    close();
  }

  const handleRejection = () => {
    rejectBoost(ad);
    close();
  }

  const handleReturn = () => {
    rejectBoost(ad);
    close();
  }

  return (
    <>
      <Modal opened={opened} onClose={close}>

        {boosted ? <Button onClick={handleRejection}>الغاء الترويج</Button> :
          <div className='flex flex-col space-y-4'>
            <Button onClick={handleApproval}>قبول</Button>
            <Button onClick={handleRejection}>رفض</Button>
          </div>
        }
      </Modal >
      {
        boosted ? <Button variant='transparent' onClick={open}> ينتهي في {new Date(boost_end).toLocaleString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</Button> :
          boost_request ? <Button variant='transparent' onClick={open}> مطلوب الترويج: <span className="p-1 m-1 text-white border">{plan}</span></Button> : "#"
      }

    </>
  )

}

type SubsTypeAdd = {
  props: { locale: string };
  emitClose: () => {};
};

export function SubsTypeAdd({ props: { locale }, emitClose }: SubsTypeAdd) {
  const [opened, { open, close }] = useDisclosure(false);
  const [currency, setCurrency] = useState({ value: "", label: "" });

  const regions = [
    { value: "3", label: locale === "en" ? "Egypt" : "مصر" },
    { value: "1", label: locale === "en" ? "UAE" : "الإمارات" },
    { value: "2", label: locale === "en" ? "KSA" : "السعودية" },
  ];

  const types = [
    { value: "ads", label: "عدد اعلانات" },
    { value: "boost", label: "ترويج اعلانات" },
    { value: "type", label: "نوع حساب" },
    { value: "cert", label: "توثيق حساب" },
  ];

  function currencyChange(option: ComboboxItem) {
    switch (option.value) {
      case "1":
        setCurrency({ value: "AED", label: locale === "en" ? "AED" : "د.إ" });
        break;
      case "2":
        setCurrency({ value: "SAR", label: locale === "en" ? "SAR" : "ر.س" });
        break;
      case "3":
        setCurrency({ value: "EGP", label: locale === "en" ? "EGP" : "ج.م" });
        break;
      default:
        setCurrency({ value: "", label: "" });
        break;
    }
  }

  const subForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      labelAr: "",
      labelEn: "",
      descEn: "",
      descAr: "",
      value: 0,
      duration: 0,
      type: "",
      active: false,
      areaFK: 0,
    },
    validate: {
      labelAr: isNotEmpty("يجب ملئ الخانة"),
      labelEn: isNotEmpty("يجب ملئ الخانة"),
      descAr: isNotEmpty("يجب ملئ الخانة"),
      descEn: isNotEmpty("يجب ملئ الخانة"),
      type: isNotEmpty("يجب اختيار نوع الاشتراك"),
      value: (v) => (v < 0 ? "القيمة يجب ان تكون موجبة" : null),
      duration: (v) => (v < 0 ? "المدة يجب ان تكون موجبة او صفر" : null),
      areaFK: (v) => (v <= 0 ? "يجب اختيار منطقة" : null),
    },
  });

  async function handleSubmit(values: typeof subForm.values) {
    const formData = { ...values, currency: currency.value };
    const status = await createSubType(formData);
    if (status === 201) {
      subForm.reset();
      close();
      emitClose();
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={() => (close(), emitClose())} size='lg'>
        <form
          onSubmit={subForm.onSubmit((values) => handleSubmit(values))}
          className='grid grid-cols-2 gap-x-4 gap-y-2'
        >
          <TextInput {...subForm.getInputProps("labelAr")} key={subForm.key("labelAr")} label='عنوان العربي' />
          <TextInput {...subForm.getInputProps("labelEn")} key={subForm.key("labelEn")} label='عنوان الانكليزي' />
          <Textarea
            {...subForm.getInputProps("descAr")}
            key={subForm.key("descAr")}
            autosize
            minRows={4}
            label='شرح عربي'
          />
          <Textarea
            {...subForm.getInputProps("descEn")}
            key={subForm.key("descEn")}
            autosize
            minRows={4}
            label='شرح الانكليزي'
          />
          <Select
            {...subForm.getInputProps("areaFK")}
            label='منطقة'
            data={regions}
            onChange={(_value, option) => (
              currencyChange(option), subForm.setValues({ areaFK: parseInt(option.value) })
            )}
          />
          <Select {...subForm.getInputProps("type")} label='نوع' data={types} />
          <Group justify='space-between' gap='xs' wrap='nowrap' align='end' className='col-span-2'>
            <NumberInput
              {...subForm.getInputProps("duration")}
              key={subForm.key("duration")}
              allowNegative={false}
              allowDecimal={false}
              label='المدة'
            />
            <NumberInput
              {...subForm.getInputProps("value")}
              key={subForm.key("value")}
              thousandSeparator={true}
              allowNegative={false}
              allowDecimal={true}
              rightSection={<Text pe={20}>{currency.label}</Text>}
              label='القيمة'
            />
            <Checkbox
              {...subForm.getInputProps("active", { type: "checkbox" })}
              key={subForm.key("active")}
              defaultChecked={false}
              label='تفعيل'
            />
          </Group>
          <Button type='submit' me='auto' className='col-span-2'>
            حفظ
          </Button>
        </form>
      </Modal>
      <Button onClick={open}>إضافة</Button>
    </>
  );
}

type SubsTypeEdit = {
  props: { locale: string; item: ISubType };
  emitClose: () => void;
};

export function SubsTypeEdit({ props: { locale, item }, emitClose }: SubsTypeEdit) {
  const [currency, setCurrency] = useState({ value: "", label: "" });
  const [area, setArea] = useState<ComboboxItem | null>(null);

  const regions = [
    { value: "3", label: locale === "en" ? "Egypt" : "مصر" },
    { value: "1", label: locale === "en" ? "UAE" : "الإمارات" },
    { value: "2", label: locale === "en" ? "KSA" : "السعودية" },
  ];

  const types = [
    { value: "ads", label: "عدد اعلانات" },
    { value: "boost", label: "ترويج اعلانات" },
    { value: "type", label: "نوع حساب" },
    { value: "cert", label: "توثيق حساب" },
  ];

  function currencyChange(option: ComboboxItem) {
    switch (option.value) {
      case "1":
        setCurrency({ value: "AED", label: locale === "en" ? "AED" : "د.إ" });
        break;
      case "2":
        setCurrency({ value: "SAR", label: locale === "en" ? "SAR" : "ر.س" });
        break;
      case "3":
        setCurrency({ value: "EGP", label: locale === "en" ? "EGP" : "ج.م" });
        break;
      default:
        setCurrency({ value: "", label: "" });
        break;
    }
  }

  const subForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      labelAr: item.labelAr,
      labelEn: item.labelEn,
      descEn: item.descEn,
      descAr: item.descAr,
      value: item.value,
      duration: item.duration,
      type: item.type,
      active: item.active,
      areaFK: item.areaFK,
    },
    validate: {
      labelAr: isNotEmpty("يجب ملئ الخانة"),
      labelEn: isNotEmpty("يجب ملئ الخانة"),
      descAr: isNotEmpty("يجب ملئ الخانة"),
      descEn: isNotEmpty("يجب ملئ الخانة"),
      type: isNotEmpty("يجب اختيار نوع الاشتراك"),
      value: (v) => (v < 0 ? "القيمة يجب ان تكون موجبة" : null),
      duration: (v) => (v < 0 ? "المدة يجب ان تكون موجبة او صفر" : null),
      areaFK: (v) => (v <= 0 ? "يجب اختيار منطقة" : null),
    },
  });

  async function handleSubmit(values: typeof subForm.values) {
    const formData = {
      ...values,
      currency: currency.value,
    };
    const status = await updateSubType(item.id, formData);
    if (status === 200) {
      // close();
      emitClose();
    }
  }

  useEffect(() => {
    setArea(regions.filter((opt) => parseInt(opt.value) === item.areaFK)[0]);
    currencyChange({ value: item.areaFK.toString(), label: "" });
  }, []);

  return (
    <form onSubmit={subForm.onSubmit((values) => handleSubmit(values))} className='grid grid-cols-2 gap-x-4 gap-y-2'>
      <TextInput {...subForm.getInputProps("labelAr")} key={subForm.key("labelAr")} label='عنوان العربي' />
      <TextInput {...subForm.getInputProps("labelEn")} key={subForm.key("labelEn")} label='عنوان الانكليزي' />
      <Textarea
        {...subForm.getInputProps("descAr")}
        key={subForm.key("descAr")}
        autosize
        minRows={4}
        label='شرح عربي'
      />
      <Textarea
        {...subForm.getInputProps("descEn")}
        key={subForm.key("descEn")}
        autosize
        minRows={4}
        label='شرح الانكليزي'
      />
      <Select
        {...subForm.getInputProps("areaFK")}
        label='منطقة'
        data={regions}
        value={area ? area.value : null}
        onChange={(_value, option) => (currencyChange(option), subForm.setValues({ areaFK: parseInt(option.value) }))}
      />
      <Select {...subForm.getInputProps("type")} label='نوع' data={types} />
      <Group justify='space-between' gap='xs' wrap='nowrap' align='end' className='col-span-2'>
        <NumberInput
          {...subForm.getInputProps("duration")}
          key={subForm.key("duration")}
          allowNegative={false}
          allowDecimal={false}
          label='المدة'
        />
        <NumberInput
          {...subForm.getInputProps("value")}
          key={subForm.key("value")}
          thousandSeparator={true}
          allowNegative={false}
          allowDecimal={true}
          rightSection={<Text pe={20}>{currency.label}</Text>}
          label='القيمة'
        />
        <Checkbox
          {...subForm.getInputProps("active", { type: "checkbox" })}
          key={subForm.key("active")}
          label='تفعيل'
        />
      </Group>
      <Button type='submit' me='auto' className='col-span-2'>
        حفظ
      </Button>
    </form>
  );
}
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

type OrderStatusFormProps = {
  orderId: number;
  currentStatus: OrderStatus;
  onUpdate: (orderId: number, newStatus: OrderStatus) => void;
};

export function OrderStatusForm({ orderId, currentStatus, onUpdate }: OrderStatusFormProps) {
  const handleStatusChange = (status: OrderStatus) => {
    onUpdate(orderId, status);
  };

  return (
    <div>
      {Object.values(OrderStatus).map((status) => (
        <Button
          key={status}
          onClick={() => handleStatusChange(status)}
          variant={status === currentStatus ? 'filled' : 'outline'}
          style={{ margin: '4px' }}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
