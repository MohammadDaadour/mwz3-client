type Props = { params: { locale: string }; searchParams: { [key: string]: string | string[] | undefined } };

export default async function UpdatePasswordPage({ params, searchParams }: Props) {
  if (searchParams?.token) {
    return (
      <>
        <div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div></div>
      </>
    );
  }
}
