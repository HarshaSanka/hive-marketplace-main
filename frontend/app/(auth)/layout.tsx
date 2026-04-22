import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="inline-block mb-4" />
        </div>
        {children}
      </div>
    </div>
  );
}
