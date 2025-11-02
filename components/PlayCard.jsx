// components/PlayerCard.jsx
export default function PlayerCard({ player }) {
  const avatar = player?.profiles?.avatar_url || '/default-avatar.png'
  return (
    <div className="flex items-center gap-3 p-2 bg-black/20 rounded">
      <img src={avatar} alt="avatar" className={`w-12 h-12 rounded-full ${player?.is_alive ? '' : 'opacity-50 grayscale'}`} />
      <div>
        <div className="font-semibold">{player?.profiles?.display_name || 'Jugador'}</div>
        <div className="text-xs text-muted-gray">{player?.is_alive ? 'Viu' : 'Fantasma'}</div>
      </div>
    </div>
  )
}
