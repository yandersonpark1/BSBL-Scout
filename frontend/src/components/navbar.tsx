export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-blue-800">
      <div className="max-w-6xl mx-auto py-4 px-6 flex items-center justify-between">
        <div className="text-3xl font-bold text-white">StatPedia</div>
        <nav className="space-x-10">
          <a href="#" className="text-white hover:text-blue-400">Home</a>
          <a href="#" className="text-white hover:text-blue-400">Dashboard</a>
          <a href="#" className="text-white hover:text-blue-400">About</a>
        </nav>
      </div>
    </header>
  );
}
