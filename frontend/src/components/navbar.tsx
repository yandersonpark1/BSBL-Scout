export default function Navbar() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-blue-600">OC Baseball</h1>
        <ul className="flex gap-6 text-gray-700">
          <li>Home</li>
          <li>About</li>
          <li>Upload</li>
          <li>Docs</li>
        </ul>
      </nav>
    </header>
  );
}
