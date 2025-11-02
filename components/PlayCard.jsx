export default function PlayerCard({ avatar, name, status }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)]">
      <img src={avatar || '/default-avatar.png'} className="w-12 h-12 rounded-full object-cover" alt="" />
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm small-muted">{status}</div>
      </div>
    </div>
  );
}
