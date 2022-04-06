import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { Web3Provider } from '@web3-sdk/react';
import { ReactQueryDevtools } from 'react-query/devtools';
import { networksConfig } from '../config';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider networksConfig={networksConfig}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </Web3Provider>
  );
}

export default MyApp;
