export type Activity = {
  id?: string | number;
  title: string;
  description?: string;
  duration?: string;
  image?: string;
};
function ActivitiesList({ activities }: { activities?: Activity[] }) {
  if (!activities || activities.length === 0)
    return <p className="text-sm text-gray-500">No activities provided.</p>;

  return (
    <ul className="space-y-3">
      {activities.map((act) => (
        <li key={act.id ?? act.title} className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden">
            {act.image ? (
              <img
                src={act.image}
                alt={act.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Img
              </div>
            )}
          </div>

          <div>
            <div className="font-medium text-sm">{act.title}</div>
            {act.duration && (
              <div className="text-xs text-gray-400">{act.duration}</div>
            )}
            {act.description && (
              <div className="text-sm text-gray-500 mt-1">
                {act.description}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
