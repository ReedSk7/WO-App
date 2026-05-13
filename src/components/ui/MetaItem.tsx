type MetaItemProps = {
  label: string;
  value: string | number;
  mono?: boolean;
};

export function MetaItem({ label, value, mono }: MetaItemProps) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className={mono ? 'mt-1 font-mono text-sm font-semibold' : 'mt-1 text-sm font-semibold'}>{value}</dd>
    </div>
  );
}
