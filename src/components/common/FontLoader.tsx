import React, { useEffect } from 'react';

const FontLoader: React.FC = () => {
  useEffect(() => {
    // We're not using this component anymore since we added the font links directly to index.html
    console.log('Font loading is handled in index.html');
  }, []);
  
  return null;
};

export default FontLoader;
