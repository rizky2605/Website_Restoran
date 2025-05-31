export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="bg-gray-800 text-white p-4">Admin Panel</header>
      <main>{children}</main>
    </div>
  );
}
