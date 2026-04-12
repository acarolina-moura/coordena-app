import { createRouteHandler } from "uploadthing/next";
import { nossaAppFileRouter } from "@/lib/uploadthing/core";

export const { GET, POST } = createRouteHandler({
  router: nossaAppFileRouter,
});
