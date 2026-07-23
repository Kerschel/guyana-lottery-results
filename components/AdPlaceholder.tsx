interface AdPlaceholderProps {
  position: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

export default function AdPlaceholder({ position, className }: AdPlaceholderProps) {
  const sizeClasses: Record<string, string> = {
    banner: 'w-full h-[90px] sm:h-[100px]',
    sidebar: 'w-full sm:w-[300px] min-h-[250px]',
    inline: 'w-full h-[90px] sm:h-[100px]',
  };

  return (
    <div
      className={`mx-auto my-4 flex items-center justify-center rounded-lg border border-dashed border-gray-600 bg-gray-800/50 ${sizeClasses[position]} ${className || ''}`}
    >
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        Advertisement
      </span>
    </div>
  );
}
