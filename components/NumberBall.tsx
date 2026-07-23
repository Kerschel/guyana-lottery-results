interface NumberBallProps {
  value: string;
  type?: 'number' | 'bonus' | 'letter' | 'multiplier';
}

export default function NumberBall({ value, type = 'number' }: NumberBallProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full font-bold text-sm sm:text-base w-10 h-10 sm:w-11 sm:h-11';

  const colorClasses: Record<string, string> = {
    number:
      'bg-gradient-to-b from-guyana-gold to-guyana-gold-dark text-gray-900 shadow-md',
    bonus:
      'bg-gradient-to-b from-guyana-green to-guyana-green-dark text-white shadow-md',
    letter:
      'bg-gradient-to-b from-white to-gray-100 text-gray-900 border-2 border-gray-300 shadow-md',
    multiplier:
      'bg-gradient-to-b from-purple-600 to-purple-800 text-white shadow-md',
  };

  return (
    <span className={`${baseClasses} ${colorClasses[type]}`}>
      {value}
    </span>
  );
}
