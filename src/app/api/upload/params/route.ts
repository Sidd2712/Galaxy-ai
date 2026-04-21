// src/app/api/upload/params/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { uploadUrlSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = uploadUrlSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { fileType } = parsed.data;

    const templateId =
      fileType === "image"
        ? process.env.NEXT_PUBLIC_TRANSLOADIT_IMAGE_TEMPLATE_ID
        : process.env.NEXT_PUBLIC_TRANSLOADIT_VIDEO_TEMPLATE_ID;

    const params = JSON.stringify({
      auth: {
        key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY,
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      },
      template_id: templateId,
    });

    // HMAC-SHA1 signature
    const signature = createHmac("sha1", process.env.TRANSLOADIT_SECRET!)
      .update(params)
      .digest("hex");

    return NextResponse.json({
      params,
      signature,
      key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY,
    });
  } catch (err) {
    console.error("[upload/params]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
