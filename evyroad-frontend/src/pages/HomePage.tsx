import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Track Your Motorcycle Adventures
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          EvyRoad helps motorcycle enthusiasts log trips, track miles, collect route certifications, 
          and share memories with a community of riders.
        </p>
        <div className="space-x-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Start Your Journey
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">GPS Tracking</h3>
          <p className="text-gray-600">
            Automatically track your rides with GPS or manually log your adventures with photo verification.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Route Certification</h3>
          <p className="text-gray-600">
            Complete iconic routes like Beartooth Canyon and Route 55 to earn digital badges and physical tokens.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Merchandise Store</h3>
          <p className="text-gray-600">
            Purchase exclusive flags, patches, and tokens to commemorate your epic motorcycle adventures.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 rounded-2xl text-white text-center py-16 px-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Tracking?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of riders documenting their motorcycle journeys.
        </p>
        <Link to="/register" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
          Create Your Account
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
