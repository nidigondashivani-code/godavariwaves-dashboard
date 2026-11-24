interface CompanyLogoProps {
  className?: string;
}

function CompanyLogo({ className = 'h-auto w-full object-contain' }: CompanyLogoProps) {
  return (
    <img
      alt="Godavari Wave Technologies Pvt Ltd."
      className={className}
      src="/godavari-waves-logo.png"
    />
  );
}

export default CompanyLogo;
