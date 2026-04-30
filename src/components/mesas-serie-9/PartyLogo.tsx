import type { CSSProperties } from 'react';

type PartyLogoProps = {
  color: string;
  label: string;
  logoPath: string | null;
  size?: 'sm' | 'md';
};

const SIZE_MAP: Record<NonNullable<PartyLogoProps['size']>, number> = {
  sm: 40,
  md: 54,
};

const buildInitials = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');

const PartyLogo = ({ color, label, logoPath, size = 'md' }: PartyLogoProps) => {
  const dimension = SIZE_MAP[size];
  const style = {
    '--party-logo-color': color,
    '--party-logo-size': `${dimension}px`,
  } as CSSProperties;

  return (
    <span className="serie9-map__party-logo" style={style} aria-hidden="true">
      {logoPath ? (
        <img src={logoPath} alt="" loading="lazy" />
      ) : (
        <span className="serie9-map__party-logo-fallback">{buildInitials(label)}</span>
      )}
    </span>
  );
};

export default PartyLogo;
