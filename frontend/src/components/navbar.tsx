export default function Navbar() {
  return (
    <header className="top-0 bg-white backdrop-blur-md z-50 border-b border-black-200">
      <div className="max-w-6xl mx-auto py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/oberlin.png" 
            alt="OC Bsbl" 
            className="h-12 w-auto mr-2" 
          />
        </div>

        <nav className="space-x-10">
          <a href="#" className="text-black-600 hover:text-blue-600">Home</a>
          <a href="#" className="text-black-600 hover:text-blue-600">Dashboard</a>
          <a href="#" className="text-black-600 hover:text-blue-600">About</a>
        </nav>
      </div>
    </header>
  );
}
