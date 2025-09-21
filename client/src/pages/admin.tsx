import AdminDashboard from "@/components/AdminDashboard";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Perth Solar Warehouse</h1>
              <span className="text-sm text-muted-foreground">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm text-muted-foreground hover:text-primary">
                Back to Quote Form
              </a>
            </div>
          </div>
        </div>
      </header>

      <AdminDashboard />
    </div>
  );
}
