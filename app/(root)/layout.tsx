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
        {children}
      </body>
    </html>
  );
}
