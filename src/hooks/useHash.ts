import { useEffect, useState } from 'react';

function readHash(): string {
  return window.location.hash.substring(1);
}

/** The board id lives in the URL hash, like in the original app. */
export function useHash(): string {
  const [hash, setHash] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}
