import Image from "next/image";
import { getPostImagesAction } from "@/libs/actions";

export function GetPostImage({ postId, image, className }: { postId: string, image: string | null, className?: string }) {
    if (!image) return null;

    const apiUrl = process.env.API_URL!;

    return (
        <Image
            src={`${apiUrl}/images/posts/${postId}/${image}`}
            width={80}
            height={80}
            alt=""
            className={className}
        />
    );
}

export function getPostImages() {
  console.log(getPostImagesAction('1'))
}