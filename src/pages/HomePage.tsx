import { SearchForm } from '../components/SearchForm/SearchForm';

export function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Find Your Flight
        </h1>
        <SearchForm />
      </div>
    </main>
  );
}

export default HomePage;
