import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status:401 });
  return NextResponse.json({ ok:true, user: u });
}
