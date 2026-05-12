"use client";

import { useContext, useState } from "react";
import { Paper, Title, Stack, TextInput, Textarea, Select, Button, Text, Group } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { placeOrderAction } from "@/libs/actions";

import { AppContext } from "@/providers";

type Props = {
  locale: string;
};

export function CheckoutForm({ locale }: Props) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Checkout");
  const router = useRouter();
  const context = useContext(AppContext);

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      street: "",
      building: "",
      floor: "",
      apartment: "",
      city: "",
      country: "EG",
      state: "",
      postal_code: "",
      notes: "",
      paymentMethod: "cashOnDelivery",
    },
    validate: {
      first_name: (value) => (value ? null : t("firstNameRequired") || "First name is required"),
      last_name: (value) => (value ? null : t("lastNameRequired") || "Last name is required"),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t("validEmailRequired") || "Valid email is required"),
      phone_number: (value) => (value ? null : t("phoneRequired") || "Phone number is required"),
      street: (value) => (value ? null : t("streetRequired") || "Street is required"),
      building: (value) => (value ? null : t("buildingRequired") || "Building is required"),
      city: (value) => (value ? null : t("cityRequired") || "City is required"),
      country: (value) => (value ? null : t("countryRequired") || "Country is required"),
      state: (value) => (value ? null : t("stateRequired") || "State is required"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    
    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      
      if (cartItems.length === 0) {
        notifications.show({
          title: t("emptyCart") || "Empty Cart",
          message: t("emptyCartMessage") || "Your cart is empty",
          color: "red",
        });
        setLoading(false);
        return;
      }

      const orderData = {
        userId: context.user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone_number: values.phone_number,
        street: values.street,
        building: values.building,
        floor: values.floor,
        apartment: values.apartment,
        city: values.city,
        country: values.country,
        state: values.state,
        postal_code: values.postal_code,
        notes: values.notes,
        payment_method: values.paymentMethod,
        items: cartItems.map((item: { id: string; quantity: number }) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      
      const status = await placeOrderAction(orderData);

      console.log("Order status:", status); // Add this line for debugging
      
      if (![200, 201].includes(status)) {
        throw new Error("Failed to create order");
      }
      
      localStorage.removeItem("cart");
      
      notifications.show({
        title: t("orderSuccess") || "Order Placed",
        message: t("orderSuccessMessage") || "Your order has been placed successfully",
        color: "green",
      });
      
      router.push(`/order-confirmation`);
    } catch (error) {
      console.error("Order submission error:", error);
      notifications.show({
        title: t("orderError") || "Order Error",
        message: t("orderErrorMessage") || "There was an error placing your order",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={3}>{t("personalDetails") || "Personal Details"}</Title>
          
          <Group grow>
            <TextInput
              label={t("firstName") || "First Name"}
              placeholder={t("enterFirstName") || "Enter your first name"}
              required
              {...form.getInputProps("first_name")}
            />
            
            <TextInput
              label={t("lastName") || "Last Name"}
              placeholder={t("enterLastName") || "Enter your last name"}
              required
              {...form.getInputProps("last_name")}
            />
          </Group>
          
          <TextInput
            label={t("email") || "Email"}
            placeholder={t("enterEmail") || "Enter your email"}
            required
            {...form.getInputProps("email")}
          />
          
          <TextInput
            label={t("phoneNumber") || "Phone Number"}
            placeholder={t("enterPhone") || "Enter your phone number"}
            required
            {...form.getInputProps("phone_number")}
          />
          
          <Title order={3} mt="md">{t("shippingDetails") || "Shipping Details"}</Title>
          
          <TextInput
            label={t("street") || "Street"}
            placeholder={t("enterStreet") || "Enter your street"}
            // required
            {...form.getInputProps("street")}
          />
          
          <Group grow>
            <TextInput
              label={t("building") || "Building"}
              placeholder={t("enterBuilding") || "Building number"}
              // required
              {...form.getInputProps("building")}
            />
            
            <TextInput
              label={t("floor") || "Floor"}
              placeholder={t("enterFloor") || "Floor number"}
              {...form.getInputProps("floor")}
            />
            
            <TextInput
              label={t("apartment") || "Apartment"}
              placeholder={t("enterApartment") || "Apartment number"}
              {...form.getInputProps("apartment")}
            />
          </Group>
          
          <Group grow>
            <TextInput
              label={t("city") || "City"}
              placeholder={t("enterCity") || "Enter your city"}
              required
              {...form.getInputProps("city")}
            />
            
            <TextInput
              label={t("state") || "State"}
              placeholder={t("enterState") || "Enter your state"}
              required
              {...form.getInputProps("state")}
            />
          </Group>

          {/* <Group grow>
            <TextInput
              label={t("country") || "Country"}
              placeholder={t("enterCountry") || "Enter your country"}
              required
              value="Egypt"
            //   disabled
              {...form.getInputProps("country")}
            />
          </Group> */}
          
          <Textarea
            label={t("notes") || "Order Notes"}
            placeholder={t("enterNotes") || "Any special instructions for delivery"}
            {...form.getInputProps("notes")}
          />
          
          <Title order={3} mt="md">{t("paymentMethod") || "Payment Method"}</Title>
          
          <Select
            label={t("selectPayment") || "Select Payment Method"}
            data={[
              { value: "cashOnDelivery", label: t("cashOnDelivery") || "دفع عند الاستلام" },
              { value: "cardPayment", label: t("cardPayment") || "الدفع بالبطاقة" },
              { value: "walletPayment", label: t("walletPayment") || "الدفع بالمحفظة" },
            ]}
            defaultValue="cashOnDelivery"
            {...form.getInputProps("paymentMethod")}
          />
          
          <Button 
            type="submit" 
            mt="xl" 
            loading={loading}
            color="green"
          >
            {t("placeOrder") || "Place Order"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}