import DesktopNavigation from "@/components/navigation/navbar/DesktopNavigation";
import NavBar from "@/components/navigation/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={` antialiased`}>
        <NavBar />
        <div className="flex pt-[84px]">
          <DesktopNavigation />
          {children}
        </div>
      </body>
    </html>
  );
}
