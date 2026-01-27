import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all news with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort"); // "latest" for newest first
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (category && category !== "all") where.category = category;
    if (status && status !== "all") where.status = status;
    
    // Search filter - search in title and excerpt
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    // Determine sort order - default to publishDate desc (newest first)
    const orderBy = sort === "latest" 
      ? { publishDate: "desc" as const }
      : { createdAt: "desc" as const };

    // Optimized: Run count and findMany in parallel with select
    const [total, news] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          excerpt: true,
          image: true,
          author: true,
          publishDate: true,
          status: true,
          views: true,
          createdAt: true,
          // Exclude full content for list view - load on detail page
        },
        orderBy,
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// POST new news article
export async function POST(request: NextRequest) {
  try {
    // Check admin auth - support both admin_token and auth_token
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token");
    const authToken = cookies.get("auth_token");
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, content, excerpt, imageUrl, image, author, publishDate, status } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Title, category, and content are required" },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        category,
        content,
        excerpt: excerpt || "",
        image: imageUrl || image || "/images/default-news.jpg",
        author: author || "Admin",
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        status: status || "draft",
        views: 0,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}
