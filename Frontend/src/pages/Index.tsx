
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              className="h-10 w-auto"
              src="https://cdn-icons-png.flaticon.com/512/3073/3073412.png"
              alt="CES Logo"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Citizen Engagement System
            </span>
          </div>
          <div>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-system-blue-500 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Making Public Services Better Together
              </h1>
              <p className="text-xl mb-8">
                A seamless platform for citizens to submit feedback, report issues, and track resolutions. 
                Connecting communities with government agencies for faster resolution of public concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-system-blue-500 hover:bg-gray-100">
                  <Link to="/login">Submit Complaint</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-system-blue-500">
                  <Link to="/login">Track Existing Complaint</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-system-blue-100 rounded-full flex items-center justify-center text-system-blue-500 mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit</h3>
                <p className="text-gray-600">
                  Submit your complaint or feedback with all relevant details and categorization.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-system-blue-100 rounded-full flex items-center justify-center text-system-blue-500 mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Track</h3>
                <p className="text-gray-600">
                  Monitor the status of your submission in real-time through our tracking system.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-system-blue-100 rounded-full flex items-center justify-center text-system-blue-500 mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Resolve</h3>
                <p className="text-gray-600">
                  Receive updates and communicate with the assigned agency until resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Common Issue Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">🚗</div>
                <h3 className="font-medium">Roads & Transport</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">💧</div>
                <h3 className="font-medium">Water & Sewage</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">💡</div>
                <h3 className="font-medium">Electricity</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">🗑️</div>
                <h3 className="font-medium">Waste Management</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">🚨</div>
                <h3 className="font-medium">Public Safety</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">🏛️</div>
                <h3 className="font-medium">Public Buildings</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">🌳</div>
                <h3 className="font-medium">Parks & Recreation</h3>
              </div>
              <div className="p-4 border rounded-lg text-center hover:bg-gray-50 transition-colors">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-medium">Other Services</h3>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 bg-system-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens who are helping improve public services in their communities.
            </p>
            <Button asChild size="lg">
              <Link to="/login">Sign In to Submit Complaint</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About CES</h3>
              <p className="text-gray-300">
                Citizen Engagement System is designed to streamline communication between citizens and government agencies.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">How It Works</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Submit Complaint</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Track Complaint</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">User Guides</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Government Agencies</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">support@ces.gov</li>
                <li className="text-gray-300">1-800-CES-HELP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Citizen Engagement System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
