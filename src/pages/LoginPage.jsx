// src/pages/LoginPage.jsx
export default function LoginPage() {
  return (
    <div className="flex h-screen">
      {/* Left Side - Orange Panel */}
      <div className="w-1/2 bg-gradient-to-b from-indigo-700 to-purple-700 text-white flex flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-bold mb-6">🍳 Lezato.</h1>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Check the Status</h2>
          <p className="text-sm leading-6">
            It is a long established fact that a reader will be distracted by the readable content...
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Visit our Facebook page"><i className="fab fa-facebook-f text-xl"></i></a>
            <a href="#" aria-label="Visit our Twitter page"><i className="fab fa-twitter text-xl"></i></a>
            <a href="#" aria-label="Visit our LinkedIn page"><i className="fab fa-linkedin-in text-xl"></i></a>
          </div>
        </div>

        <footer className="text-xs mt-10">
          Privacy Policy · Contact © 2022 DexignZone
        </footer>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-indigo-700 to-purple-700 mb-2">Welcome to Ventic</h2>
          <p className="text-sm text-gray-600 mb-6">Sign in by entering information below</p>

          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="demo@demo.com"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                defaultValue="......"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label>Remember my preference</label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-b from-indigo-700 to-purple-700 text-white font-semibold py-2 rounded hover:bg-orange-600"
            >
              Sign In
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4">
            Don’t have an account? <a href="#" className="text-indigo-700 to-purple-700">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
