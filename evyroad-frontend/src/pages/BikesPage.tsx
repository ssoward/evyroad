const BikesPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bikes</h1>
          <p className="text-gray-600 mt-2">Manage your motorcycle collection</p>
        </div>
        <button className="btn-primary">
          Add New Bike
        </button>
      </div>

      {/* Placeholder content - will be implemented later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">2023 Harley-Davidson Street Glide</h3>
          <p className="text-gray-600 mt-1">Primary Bike</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">15,247 miles</span>
            <div className="flex space-x-2">
              <button className="text-primary-600 hover:text-primary-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="text-red-600 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Add bike placeholder */}
        <div className="card border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Bike</h3>
            <p className="text-gray-600">Register a new motorcycle to your collection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikesPage;
