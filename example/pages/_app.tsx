import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { Web3Provider } from '@web3-sdk/react';
import { networksConfig } from '../config';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider networksConfig={networksConfig}>
      <Component {...pageProps} />
    </Web3Provider>
  );
}

export default MyApp;
