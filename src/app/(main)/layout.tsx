import { LayoutWrapper } from "@/components";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <main>
        <LayoutWrapper>{children}</LayoutWrapper>
      </main>
    </div>
  );
}
