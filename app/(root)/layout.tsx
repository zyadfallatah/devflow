import DesktopNavigation from "@/components/navigation/DesktopNavigation";
import NavBar from "@/components/navigation/navbar";
import RightSidebar from "@/components/navigation/RightSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <div className="flex">
        <DesktopNavigation />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </section>
        <RightSidebar />
      </div>
    </>
  );
}
