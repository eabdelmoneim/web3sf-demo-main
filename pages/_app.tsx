import type { AppProps } from 'next/app';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mainnet;

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ChakraProvider>
      <SessionProvider session={session}>
        <ThirdwebProvider
          desiredChainId={activeChainId}
        >
          <Component {...pageProps} />
        </ThirdwebProvider>
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
