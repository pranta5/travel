export type CostItem = {
  label: string;
  amount: number;
  note?: string;
};
function CostBreakdown({ items }: { items?: CostItem[] }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-gray-500">No cost breakdown provided.</p>;

  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div>
      <ul className="divide-y">
        {items.map((it, idx) => (
          <li key={idx} className="py-3 flex justify-between items-start">
            <div>
              <div className="text-sm font-medium">{it.label}</div>
              {it.note && (
                <div className="text-xs text-gray-400">{it.note}</div>
              )}
            </div>
            <div className="text-sm font-medium">₹{it.amount}</div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between items-center pt-3 border-t">
        <div className="text-sm font-semibold">Total</div>
        <div className="text-lg font-bold">₹{total}</div>
      </div>
    </div>
  );
}
