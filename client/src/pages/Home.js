import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80"
        alt="Travel"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-white">
        <h2 className="tracking-[8px] text-sm uppercase">Discover</h2>
        <h1 className="text-5xl md:text-7xl font-bold mt-4">The World</h1>

        <p className="mt-6 max-w-xl text-lg text-gray-200">
          Planiraj svoja putovanja, istraži destinacije i drži sve planove na jednom mjestu uz TravelBuddy.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            to="/trips"
            className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition"
          >
            Planiraj putovanje
          </Link>

          <Link
            to="/destinations"
            className="border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
          >
            Istraži destinacije
          </Link>
        </div>
      </div>
    </div>
  );
}
