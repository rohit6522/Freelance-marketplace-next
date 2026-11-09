import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { serverGet } from "@/lib/serverApi";

export default async function MainLayout({ children }) {
  const data = await serverGet("/categories", { revalidate: 120 });
  const categories = data?.categories ?? [];

  return (
    <>
      <Navbar categories={categories} />
      <main className="w-full pt-[108px] bg-background min-h-screen">{children}</main>
      <Footer categories={categories} />
    </>
  );
}