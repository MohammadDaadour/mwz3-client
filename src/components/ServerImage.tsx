import ClientImage from './ClientImage';

interface ServerImageProps {
  src?: string;
  alt: string;
  postId?: string;
  imageId?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'eager' | 'lazy';
}

export default function ServerImage({ src, alt, postId, imageId, className, ...props }: ServerImageProps) {
  let imageUrl = src;

  if (postId && imageId) {
    const apiUrl = process.env.API_URL; 
    if (!apiUrl) {
      throw new Error('API_URL is not defined');
    }
    imageUrl = `${apiUrl}/images/posts/${postId}/${imageId}`;
  }

  return <ClientImage src={imageUrl || ''} alt={alt} className={className} {...props} width={150} height={150} />;
}