'use client';
import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [search, genre]);

  const fetchEvents = async () => {
    const res = await fetch(`/api/events?search=${search}&genre=${genre}`);
    const data = await res.json();
    setEvents(data);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center pt-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-400">
            RAVE RADAR
          </h1>
          <p className="mt-4 text-neutral-400 text-lg">Encontre sua próxima pista.</p>
        </header>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input 
            type="text" 
            placeholder="Buscar por evento, DJ ou local..." 
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 text-white focus:outline-none"
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">Todos os Gêneros</option>
            <option value="techno">Techno</option>
            <option value="trance">Trance</option>
            <option value="house">House</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
