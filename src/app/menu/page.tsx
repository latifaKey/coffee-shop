import { prisma } from "@/lib/prisma";
import MenuClient from "@/components/public/MenuClient";
import { Product, Category } from "./ProductCard";
import MenuHero from "./MenuHero";
import MenuEmptyNotice from "./MenuEmptyNotice";
import "./menu.css";

// Use ISR instead of force-dynamic to handle Supabase outages
export const revalidate = 60; // Cache for 60 seconds

export default async function MenuPage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    // Fetch products with OPTIMIZED select fields - only what we need
    products = (await prisma.product.findMany({ 
    where: {
      isAvailable: true, // Only show available products
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      categoryId: true,
      image: true,
      isAvailable: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          imageFolder: true,
        },
      },
    },
    orderBy: { name: "asc" }, // Sort by name for better UX
    })) as unknown as Product[];

    // Fetch only MENU categories (MINUMAN & MAKANAN)
    categories = (await prisma.category.findMany({
      where: {
        type: {
          in: ["MINUMAN", "MAKANAN"],
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        imageFolder: true,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }]
    })) as unknown as Category[];
  } catch (error) {
    console.error('[Menu] Database connection error (possibly Supabase outage):', error);
    // Return empty arrays - MenuEmptyNotice will show
  }

  return (
    <main>
      {/* Hero - styled like Tentang Kami */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <MenuHero />
      </section>

      <section className="section">
        <div className="container">
          <MenuClient products={products} categories={categories} />

          {products.length === 0 && <MenuEmptyNotice />}
        </div>
      </section>
    </main>
  );
}
