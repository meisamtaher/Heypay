'use client'
import { SnackbarProvider } from 'notistack'
import { Exo } from 'next/font/google'
import NavBar from './Components/NavBar'
import RainbowComponent from './rainbow'
import { UserContextProvider } from "./Context/index";
import { AbstraxionProvider } from '@burnt-labs/abstraxion'
import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";
import {HeypayAddress, ValidCoins} from "./Constants/Const"

let verifiedContracts = ValidCoins.map(x=>x.token_address);
verifiedContracts.push(HeypayAddress);

const exo_font = Exo({ weight: ['400'], subsets: ['latin'] })

export default function ClientRootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AbstraxionProvider
        
    config={{
        contracts: verifiedContracts,
        rpcUrl:"https://xion-testnet-rpc.polkachu.com"
    }}
    >
      <SnackbarProvider>
        <UserContextProvider>
          <body className={exo_font.className}>
            <RainbowComponent>
              <NavBar/>
              {children}
            </RainbowComponent>
          </body>
        </UserContextProvider>
      </SnackbarProvider>
    </AbstraxionProvider>
  )
}
