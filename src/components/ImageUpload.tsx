import { useState, ChangeEvent } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@mantine/core";
import { uploadPostImagesAction } from "@/libs/actions";
import { FileInput } from '@mantine/core';

interface ImageUploadProps {
  postId: string | number;
}

export default function ImageUpload({ postId }: ImageUploadProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length !== e.target.files.length) {
      setUploadStatus("Only image files are allowed");
    }
    setNewFiles(files);
  };

  const handleImageUpload = async () => {
    if (!postId) {
      setUploadStatus("No post available");
      return;
    }

    if (!newFiles.length) {
      setUploadStatus("Please select images to upload");
      return;
    }

    setUploadStatus("Uploading...");

    try {
      // Convert files to base64
      const fileData = await Promise.all(
        newFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          base64: await fileToBase64(file),
        }))
      );

      // Call Server Action
      const res = await uploadPostImagesAction(postId, fileData);

      if (res.status === 200 || res.status === 201) {
        mutate(`${process.env.API_URL}/images/posts/${postId}`);
        setNewFiles([]);
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus(res.error || "Failed to upload images");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadStatus(err.message || "Failed to upload images");
    }
  };

  return (
    <div className="my-4 border">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        ref={(input) => {
          if (input && !newFiles.length) input.value = ""; 
        }}
        className="m-2"
      />
      
      <Button onClick={handleImageUpload} className="ml-2">
        رفع الصور
      </Button>
      {uploadStatus && <p className="mt-2 text-sm">{uploadStatus}</p>}
    </div>
  );
}