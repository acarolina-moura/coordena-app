import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { NossaAppFileRouter } from "@/lib/uploadthing/core";

export const UploadButton = generateUploadButton<NossaAppFileRouter>();
export const UploadDropzone = generateUploadDropzone<NossaAppFileRouter>();
