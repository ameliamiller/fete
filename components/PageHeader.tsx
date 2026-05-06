interface PageHeaderProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ emoji, title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      {emoji && <span className="text-5xl">{emoji}</span>}
      <h1 className="text-2xl font-black tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-500 max-w-[280px] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
