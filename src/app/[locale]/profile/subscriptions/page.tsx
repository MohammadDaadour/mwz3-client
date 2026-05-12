// "use client";

// import "@mantine/carousel/styles.css";
// import classes from "./styles.module.css";
// import { ISub, ISubType } from "@/interfaces";
// import { privateFetcher } from "@/libs/functions";
// import { AppContext } from "@/providers";
// import { Box, Button, Card, Flex, Group, LoadingOverlay, Table, Text } from "@mantine/core";
// import { useContext, useEffect, useState } from "react";
// import useSWR from "swr";
// import Error from "../../error";
// import { Carousel } from "@mantine/carousel";
// import { useFormatter } from "next-intl";
// import { createSub } from "@/libs/actions";
// import { UpdateCountryModalForce } from "@/components/Modals";

// type Props = { params: { locale: string } };

// export default function UserSubsPage({ params: { locale } }: Props) {
//   const context = useContext(AppContext);
//   const format = useFormatter();
//   const [missingInfo, setMissingInfo] = useState(false);

//   const { data, isLoading, error, mutate } = useSWR<ISubType[]>(
//     context.user.id > 0 && context.user.country > 0
//       ? `${process.env.API_URL}/substypes/filter/${context.user.id}`
//       : null,
//     privateFetcher
//   );

//   useEffect(() => {
//     if (context.user.id > 0 && context.user.country === 0) {
//       setMissingInfo(true);
//     }
//   }, []);

//   function handleSubmit(userFK: number, typeFK: number) {
//     createSub(userFK, typeFK);
//     alert(
//       locale === "en"
//         ? "Your order have been submitted, you'll be contactd soon"
//         : "تم انشاء طلبك، سيتم التواصل معك لاستكمال العملية"
//     );
//     mutate();
//     // window.location.reload();
//   }

//   if (missingInfo) {
//     return (
//       <UpdateCountryModalForce
//         locale={locale}
//         userId={context.user.id}
//         state={true}
//         emit={() => (setMissingInfo(false), window.location.reload())}
//       />
//     );
//   }

//   if (error) {
//     return <Error />;
//   }

//   if (isLoading) {
//     return (
//       <Box pos='relative' w='full' h='300px' mx='auto'>
//         <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
//       </Box>
//     );
//   }

//   if (data) {
//     return (
//       <Flex direction='column' gap='xl'>
//         <Carousel
//           slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
//           align='center'
//           containScroll='trimSnaps'
//           slideGap='md'
//           px='3rem'
//           height='100%'
//           classNames={{ container: classes.container, control: classes.control }}
//         >
//           {data.map((item, index) => (
//             <Carousel.Slide key={index}>
//               <Card shadow='sm' padding='md' radius='md' withBorder h='100%'>
//                 <Text fw={700} fz='xl' className='text-center'>
//                   {item.labelAr}
//                 </Text>
//                 <Text component='pre' style={{ textWrap: "pretty" }} mb='xs'>
//                   {item.descAr}
//                 </Text>
//                 <Card.Section inheritPadding withBorder mt='auto' py='xs'>
//                   <Group justify='space-between' wrap='nowrap'>
//                     <Text fw={500}>
//                       {format.number(item.value, {
//                         numberingSystem: "latn",
//                         style: "currency",
//                         currency: item.currency,
//                         maximumFractionDigits: 2,
//                       })}
//                       {item.duration === 0
//                         ? locale === "en"
//                           ? " One Time"
//                           : " اشتراك مرة واحدة"
//                         : ` / ${item.duration} ${locale === "en" ? "days" : "يوم"}`}
//                     </Text>
//                     <Button onClick={() => handleSubmit(context.user.id, item.id)}>
//                       {locale === "en" ? "Subscribe" : "اشترك"}
//                     </Button>
//                   </Group>
//                 </Card.Section>
//               </Card>
//             </Carousel.Slide>
//           ))}
//         </Carousel>
//         <UserSubsResults locale={locale} user={context.user.id} />
//       </Flex>
//     );
//   }
// }

// type UserSubsResultsProps = {
//   locale: string;
//   user: number;
// };

// function UserSubsResults({ locale, user }: UserSubsResultsProps) {
//   const format = useFormatter();
//   const { data, isLoading, error, mutate } = useSWR<ISub[]>(`${process.env.API_URL}/subs/${user}`, privateFetcher);

//   if (error) {
//     return <Error />;
//   }

//   if (isLoading) {
//     return (
//       <Box pos='relative' w='full' h='300px' mx='auto'>
//         <LoadingOverlay visible={true} zIndex={180} loaderProps={{ type: "bars" }} overlayProps={{ blur: 2 }} />
//       </Box>
//     );
//   }

//   if (data) {
//     const rows = data.map((item, index) => (
//       <Table.Tr key={index}>
//         <Table.Td>{item.id}</Table.Td>
//         <Table.Td>{locale === "en" ? item.subType.labelEn : item.subType.labelAr}</Table.Td>
//         <Table.Td>
//           {format.dateTime(Date.parse(item.createdAt), { year: "numeric", month: "2-digit", day: "2-digit" })}
//         </Table.Td>
//         <Table.Td>
//           {item.activatedAt
//             ? format.dateTime(Date.parse(item.activatedAt), { year: "numeric", month: "2-digit", day: "2-digit" })
//             : undefined}
//         </Table.Td>
//         <Table.Td>
//           {item.endsAt
//             ? format.dateTime(Date.parse(item.endsAt), { year: "numeric", month: "2-digit", day: "2-digit" })
//             : undefined}
//         </Table.Td>
//         <Table.Td>{item.active ? "مفعل" : ""}</Table.Td>
//       </Table.Tr>
//     ));
//     return (
//       <>
//         <Table.ScrollContainer minWidth='1200px'>
//           <Table stickyHeader withTableBorder striped highlightOnHover>
//             <Table.Thead>
//               <Table.Tr>
//                 <Table.Th>#</Table.Th>
//                 <Table.Th>نوع</Table.Th>
//                 <Table.Th>تاريخ الطلب</Table.Th>
//                 <Table.Th>يبدأ من</Table.Th>
//                 <Table.Th>ينتهي في</Table.Th>
//                 <Table.Th>الحالة</Table.Th>
//               </Table.Tr>
//             </Table.Thead>
//             <Table.Tbody>{rows}</Table.Tbody>
//           </Table>
//         </Table.ScrollContainer>
//       </>
//     );
//   }
// }

export default function UserSubsPage() {
  return <div>user subs page</div>;
}
