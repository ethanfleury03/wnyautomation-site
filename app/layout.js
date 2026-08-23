export const metadata = {
  title: "WNY Business Automation",
  description: "Websites and automation for local businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
