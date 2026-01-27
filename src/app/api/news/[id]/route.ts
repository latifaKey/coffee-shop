import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single news
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) },
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // Increment views
    await prisma.news.update({
      where: { id: parseInt(id) },
      data: { views: news.views + 1 },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error(`GET /api/news/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// PATCH update news
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth - support both admin_token and auth_token
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token");
    const authToken = cookies.get("auth_token");
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const news = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error(`PATCH /api/news/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

// DELETE news
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth - support both admin_token and auth_token
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token");
    const authToken = cookies.get("auth_token");
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.news.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/news/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}
