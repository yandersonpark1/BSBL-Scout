export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-blue-800">
      <div className="max-w-6xl mx-auto py-4 px-6 flex items-center justify-between">
        <div className="">
          <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent drop-shadow-lg">
            Pulse
          </span>

        </div>
        <nav className="space-x-10">
          <a href="#" className="text-white hover:text-blue-400">Home</a>
          <a href="#" className="text-white hover:text-blue-400">Dashboard</a>
          <a href="#" className="text-white hover:text-blue-400">About</a>
        </nav>
      </div>
    </header>
  );
}
