export default function EventCard({ event }: { event: any }) {
  const dateObj = new Date(event.date);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(dateObj);

  return (
    <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-purple-500 transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase text-cyan-400">
          {event.platform}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
          <div className="text-center bg-neutral-800 rounded-lg px-3 py-1">
            <span className="block text-sm font-bold text-purple-400">{formattedDate}</span>
          </div>
        </div>
        
        <p className="text-neutral-400 text-sm mb-4">
          📍 {event.location} - {event.city}/{event.state}
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="px-2 py-1 text-xs rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
            {event.genre}
          </span>
        </div>

        <a 
          href={event.ticketUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        >
          Garantir Ingresso
        </a>
      </div>
    </div>
  );
}
