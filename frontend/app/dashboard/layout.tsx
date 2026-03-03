type Role = "ADMIN" | "EDITOR" | "WRITER";

function getUserRole(): Role {
  return "EDITOR";
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const userRole = getUserRole();

  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">CMS</h2>

        <nav className="space-y-3">
            <a href="/dashboard">Dashboard</a>

            <a href="/dashboard/posts">Posts</a>

            {/* WRITER should not see Categories */}
            {userRole !== "WRITER" && (
              <a href="/dashboard/categories">Categories</a>
            )}

            {/* Only ADMIN can see Settings */}
            {userRole === "ADMIN" && (
              <a href="/dashboard/settings">Settings</a>
            )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
}