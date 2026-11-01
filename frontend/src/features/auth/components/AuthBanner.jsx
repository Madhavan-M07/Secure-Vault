import { memo } from 'react';

function AuthBanner() {
  return (
    <div className="h-44 sm:h-56 md:h-auto md:w-1/2 bg-black flex items-center justify-center overflow-hidden shrink-0">
      <img
        src="/assets/auth-banner.png"
        alt="Lifetime Certificate Vault"
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
}

export default memo(AuthBanner);
