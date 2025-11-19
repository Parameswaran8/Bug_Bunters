function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Total Bugs
          </h3>
          <p className="text-3xl font-bold text-primary">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Assigned</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
