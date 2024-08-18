'use client'
import { useEffect, useRef, useState } from 'react'
import { ClaimRow } from "../Interfaces/types";
import ClaimCard from "../Components/ClaimCard";
import CircularProgress from '@mui/material/CircularProgress';
import ClaimMessage from "../Components/ClaimMessage";
import NothingMessage from "../Components/NothingMessage";
import AddressViewer from "../Components/AddressViewer";
import useNotification from "../Components/SnackBar";
import {simulateContract} from "@wagmi/core"
import { useUserContext } from '../Context';
import { keccak256, sha256, toHex } from 'viem';
import { preDecode } from '../Utils/jwt';
import { getClaimables } from '../Logic/HeyPayQueries';
import { HeypayAddress, TokenMaps } from '../Constants/Const';
import { HeyPayContractABI } from '../ABI/HeyPayContractABI';
import { Single_Day } from 'next/font/google';
import { useAbstraxionAccount, useAbstraxionSigningClient } from '@burnt-labs/abstraxion';
  interface ClaimResults{
    token: string,
    amount: string,
    sender: string,
    memo: string
  }

const SideBar = () => {
    const divRef = useRef(null)
    const { data: account } = useAbstraxionAccount();
    const {email,jwt,setJwt} =  useUserContext();
    const { client } = useAbstraxionSigningClient();
    const sendNotification = useNotification();
    const [claimables, setClaimables] = useState<ClaimRow[]|undefined>(undefined);
    const [loading, setLoading] = useState(false);
    async function ReadClaimables() {
      console.log("Read Claimable of Email:", email)
      const claimsMsg = {
        claims: {
          email: email!
        }
      };
      try {
        const SendRes = await client?.queryContractSmart(
          HeypayAddress,
          claimsMsg,
        );
        console.log("Claim Message Result: ", SendRes)
        const claims = SendRes.claims as unknown as ClaimResults[];
        setClaimables(claims.map(x=> {
          return {
            sender: x.sender,
            metadata: x.memo,
            symbol:TokenMaps.get(x.token)?.symbol,
            token_address: x.token,
            amount: Number(x.amount),
            decimals: 18,
            logo:TokenMaps.get(x.token)?.logo,
            price:TokenMaps.get(x.token)?.price
          } as ClaimRow
        }))
      } catch (error) {
        // eslint-disable-next-line no-console -- No UI exists yet to display errors
        console.log(error);
      }



      // try {
      //   if(email){
      //       console.log("Ekec:", keccak256(toHex(email)));
      //       console.log("Email :", email);
            
      //       setClaimables(await getClaimables(keccak256(toHex(email))));
      //   }
      //   else{
          
      //     let ClaimRow:ClaimRow = {
      //       sender: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      //       metadata: "Hey",
      //       amount: 240,
      //       ...TokenMaps.get("0x036CbD53842c5426634e7929541eC2318f3dCF7e")!,
      //       decimals: 6
      //     };
      //      setClaimables([ClaimRow]);
      //     //  setClaimables([]);
      //   }
      //  //setClaimables()
      // } catch (error) {
      //   // eslint-disable-next-line no-console -- No UI exists yet to display errors
      //   console.log(error);
      // }
    }
    async function ClaimTokens() {
      event?.preventDefault();
      console.log("Claim Tokens")
      setLoading(true);
      const msg = {
        claim :{
          msg:{
            jwt: jwt!,
            aud: "project-live-7e4a3221-79cd-4f34-ac1d-fedac4bde13e"
          }
        }
      };
      try {
        if(jwt){
          const jwtDecoded = preDecode(jwt)
          const jwtArray = jwt.split('.')
          const digestBeforeKccak = jwtArray[0] + '.' + jwtArray[1]
          const digest = sha256(toHex(digestBeforeKccak));
          console.log('JW Decoded: ', jwtDecoded)
          console.log('JWT digest: ', digest)
          const header = toHex(jwtDecoded[0] as string)
          const payload = toHex(jwtDecoded[1] as string)
          const signature = toHex(jwtDecoded[2] as string)
          console.log("header:", header);
          console.log("paylad:", payload);
          console.log("signature:", signature);
          // writeContract({
          //   address:HeypayAddress,
          //   abi: HeyPayContractABI,
          //   functionName:'Claim',
          //   args:[header,payload,signature,digest],
          //   gas:BigInt(4000000)
          // })
          const SendRes = await client?.execute(
            account.bech32Address,
            HeypayAddress,
            msg,
            {
              amount: [{ amount: "0", denom: "uxion" }],
              gas: "500000",
            },
            "",
            []
          );
          console.log(SendRes)
          if(SendRes?.transactionHash){
            sendNotification({msg:"Hey!!! Successfully Claimed all the tokens",variant:"success"});
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console -- No UI exists yet to display errors
        console.log(error);
        sendNotification({msg:`Error Claiming token: ${error}`,variant:"error"});

      } finally {
        setLoading(false);
        ReadClaimables();
      }
    }
    async function Disconnect(){
      setJwt("")
    }
    // useEffect(() => {
    //   if(claimIsError){
    //     console.log("error", claimError);
    //     sendNotification({msg:`Error Claiming token: ${claimError}`,variant:"error"})
    //   }
    // }, [claimIsError]);
    useEffect(()=>{
      if( email && client){
        console.log("Email is not null:", email);
        ReadClaimables();
      }
    },[email,client]);
    useEffect(() => {
      if (divRef.current) {
        // @ts-ignore: Unreachable code error
        window.google.accounts.id.initialize({
          nonce: account!.bech32Address,
          client_id:
            '965798652522-bn240k47q576vhqon2tuk0feg20bbt0u.apps.googleusercontent.com',
          // @ts-ignore: Unreachable code error
          callback: (res, error) => {
            console.log('res', res)
            console.log('error', error)
            if (!error) {
              setJwt(res.credential);
            }
            // This is the function that will be executed once the authentication with google is finished
          }
        })
        // @ts-ignore: Unreachable code error
        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'filled_blue',
          size: 'medium',
          type: 'standard',
          text: 'continue_with'
        })
      }
    }, [divRef.current])
  return (
    <div className="flex flex-col w-1/3 max-w-[25rem] h-dvh bg-[#ADE8F3]">
        <div className="flex flex-row items-center justify-start gap-2 p-5">
            <img src='/Wallet.svg' className="h-5 w-5"></img>
            <AddressViewer address = {account? account!.bech32Address:""}></AddressViewer>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 pl-5">
            <img src='/Email.svg' className="h-5 w-5"></img>
            {email &&jwt &&
              <a>{email}</a> 
              
            }
            {email &&jwt &&
              <button onClick = {Disconnect}className=" pl-1 pr-1 pt-1 pb-1 hover:bg-[#2c9baf] justify-center align-middle border-2 rounded-lg border-[#2D3D50] text-[#2D3D50]">disconnect</button>
            }
            {!jwt && account&& <div ref={divRef}/>}
        </div>
        <div className="bg-slate-600 h-0.5  m-5"></div>
        
        <div className="pl-5 pr-5 w-full justify-center items-center">
            {(claimables==undefined && account )&& <CircularProgress></CircularProgress>} {/* removed Email & client from Booleans*/}
            {(claimables && claimables.length==0)&&<NothingMessage></NothingMessage>}
            {(claimables && claimables.length>0)&&<div>
            {/* <div> */}
              <ClaimMessage></ClaimMessage>
              <div className='flex flex-col w-full pt-3  gap-2 '>
                  {claimables?.map((x,index) =>(<ClaimCard key={index} claimObject={x}></ClaimCard>))}
                  <div className="bg-slate-600 h-0.5  m-2"></div>
                  <div className="flex flex-row pl-4 pr-4">     
                      <a className="flex flex-row w-40">Total Value: </a>
                      <div className="flex flex-row-reverse w-full ">
                          <a className="font-bold "> {claimables?.reduce((accumulator, x)=>{return accumulator+(x.amount*x.price)},0)}$</a>
                      </div>
                  </div>
              </div>
            <form onSubmit={ClaimTokens} className='flex flex-row-reverse h-20 w-full pt-3 pb-3'>
                {!loading?<button  className="w-[150px] bg-sky-600 hover:bg-sky-500 disabled:bg-gray-500 disabled:text-slate-700  border-gray-500 text-white  rounded h-full text-xl font-bold" >Claim</button>:<CircularProgress></CircularProgress>}
                {/* disabled={loading|| !claimables || claimables.length<1} */}
            </form></div>}
        </div>
    </div>
  )
}

export default SideBar