import { HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote, HiOutlineDocumentText, HiOutlineDownload, HiOutlineBookOpen } from 'react-icons/hi';

const icons = {
  photos: HiOutlinePhotograph,
  videos: HiOutlineVideoCamera,
  audios: HiOutlineMusicNote,
  documents: HiOutlineDocumentText,
};

export default function HeroStats({ stats, label, icon: PageIcon, color = 'primary' }) {
  const items = [
    { key: 'total', label: 'Médias', icon: HiOutlineBookOpen, color: 'primary' },
    ...(stats
      ? Object.entries(stats)
          .filter(([k]) => k !== 'total')
          .map(([k, v]) => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1), count: v, icon: icons[k], color: k === 'photos' ? 'primary' : k === 'videos' ? 'secondary' : k === 'audios' ? 'accent' : 'info' }))
      : []),
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 via-base-100/95 to-base-200 border border-base-200 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {PageIcon && (
              <div className={`p-3 rounded-2xl bg-gradient-to-br from-${color}/20 to-${color}/5 shadow-inner`}>
                <PageIcon className={`text-3xl text-${color}`} />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{label}</h1>
              <p className="text-sm text-base-content/60">Explorez et decouvrez notre collection</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((item) => {
              const Icon = item.icon;
              const count = stats[item.key];
              return (
                <div key={item.key} className={`stat bg-${item.color}/5 rounded-xl border border-${item.color}/10 p-4`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`text-xl text-${item.color} opacity-70`} />
                    <span className="stat-title text-xs">{item.label}</span>
                  </div>
                  <p className={`stat-value text-2xl font-bold text-${item.color} mt-1`}>
                    {count ?? '—'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
