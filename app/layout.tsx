import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();
  const description =
    "A demonstration work-order readiness decision-support prototype for field teams.";

  return {
    title: {
      default: "Work Order Readiness | Field Ops",
      template: "%s | Field Ops",
    },
    description,
    openGraph: {
      title: "Work Order Readiness | Field Ops",
      description,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1733,
          height: 909,
          alt: "Field Ops Work Order Readiness demonstration prototype",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Work Order Readiness | Field Ops",
      description,
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
