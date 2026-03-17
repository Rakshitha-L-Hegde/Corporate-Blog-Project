import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path } = body;

    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      path
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}