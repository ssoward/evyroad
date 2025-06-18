const StorePage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EvyRoad Store</h1>
        <p className="text-gray-600 mt-2">Exclusive merchandise for motorcycle enthusiasts</p>
      </div>

      {/* Product Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v1.993C3 6.239 4.239 8 6.685 8h10.63C19.761 8 21 6.239 21 4.993V3" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8v10.993C3 20.239 4.239 22 6.685 22h10.63C19.761 22 21 20.239 21 18.993V8" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Flags</h3>
          <p className="text-gray-600">Custom route and state flags</p>
          <p className="text-sm text-primary-600 font-medium mt-2">$20 - $50</p>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Tokens</h3>
          <p className="text-gray-600">Metal commemorative pieces</p>
          <p className="text-sm text-primary-600 font-medium mt-2">$5 - $15</p>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Patches</h3>
          <p className="text-gray-600">Embroidered route patches</p>
          <p className="text-sm text-primary-600 font-medium mt-2">$10 - $20</p>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="aspect-w-1 aspect-h-1 mb-4">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Route 55</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Route 55 Flag</h3>
            <p className="text-sm text-gray-600 mt-1">Official Route 55 commemorative flag</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-gray-900">$35</span>
              <button className="btn-primary text-sm px-4 py-2">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="card">
            <div className="aspect-w-1 aspect-h-1 mb-4">
              <div className="w-full h-48 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 font-bold">BC</span>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Beartooth Canyon Token</h3>
            <p className="text-sm text-gray-600 mt-1">Metal token for completing Beartooth Canyon</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-gray-900">$12</span>
              <button className="btn-primary text-sm px-4 py-2">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="card">
            <div className="aspect-w-1 aspect-h-1 mb-4">
              <div className="w-full h-48 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">PATCH</span>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Blue Ridge Parkway Patch</h3>
            <p className="text-sm text-gray-600 mt-1">Embroidered patch for your jacket or vest</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-gray-900">$15</span>
              <button className="btn-primary text-sm px-4 py-2">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="card border-2 border-dashed border-gray-300">
            <div className="aspect-w-1 aspect-h-1 mb-4">
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-gray-500 text-sm">More Coming Soon</p>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Limited Edition Items</h3>
            <p className="text-sm text-gray-600 mt-1">Exclusive items for route completions</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-gray-400">TBD</span>
              <button className="btn-secondary text-sm px-4 py-2" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="card bg-primary-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Complete Routes to Unlock Exclusive Items</h2>
        <p className="text-primary-100 mb-6">
          Earn certifications on iconic motorcycle routes to unlock limited edition merchandise
        </p>
        <button className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
          View Available Routes
        </button>
      </div>
    </div>
  );
};

export default StorePage;
