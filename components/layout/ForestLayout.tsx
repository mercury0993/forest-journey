export default function ForestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#061206] text-white relative">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
      {children}
    </div>
  );
}
