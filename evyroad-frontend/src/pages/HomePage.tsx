import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section with Background Image */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/ride.jpg" 
            alt="Motorcycle Adventure" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Track Your Motorcycle Adventures
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
              EvyRoad helps motorcycle enthusiasts log trips, track miles, collect route certifications, 
              and share memories with a community of riders.
            </p>
            <div className="space-x-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-shadow">
                Start Your Journey
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 border border-white/30">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">GPS Tracking</h3>
              <p className="text-gray-600">
                Automatically track your rides with GPS or manually log your adventures with photo verification.
              </p>
            </div>

            <div className="card text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M16 2v2M16 18v2M2 12h2M20 12h2M8 8l-2-2M18 8l2-2M8 16l-2 2M18 16l2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Route Certification</h3>
              <p className="text-gray-600">
                Complete iconic routes like Beartooth Canyon and Route 55 to earn digital badges and physical tokens.
              </p>
            </div>

            <div className="card text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Merchandise Store</h3>
              <p className="text-gray-600">
                Purchase exclusive flags, patches, and tokens to commemorate your epic motorcycle adventures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Tracking?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of riders documenting their motorcycle journeys.
          </p>
          <Link to="/register" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
