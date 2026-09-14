import { NextResponse } from "next/server";
import { getAnimationSettings } from "@/lib/animation-config-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getAnimationSettings();
  return NextResponse.json(config);
}
