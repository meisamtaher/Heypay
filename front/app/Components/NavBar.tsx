import {
  Abstraxion,
  useAbstraxionAccount,
  useModal
} from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import { useAccount } from 'wagmi';

const NavBar = () => {
  const { data: account } = useAbstraxionAccount();
  const [,setShowAbstraxion] = useModal();
  return (

    <nav className='flex space-x-6 px-8 h-16 items-center bg-gradient-to-l from-[#65CADA] to-[#97DFEB]/60 shadow backdrop-blur-sm' >
        <div className='flex flex-row items-center space-x-2'>          
          <img src={"/logo.svg"} className='w-9 h-9'/>
          <a href={"/"} className="text-black text-2xl font-bold"> HeyPay</a>
        </div>
        <ul className='flex space-x-6'>
        </ul>
        <div className='flex flex-1 flex-row-reverse'>
            <div onClick={() => {
            setShowAbstraxion(true);
          }} className=" pl-5 pr-5 pt-1 pb-1 hover:bg-[#ADE8F3] justify-center align-middle border-2 rounded-lg border-[#2D3D50] text-[#2D3D50]">
              {account.bech32Address ? ("Logout") : (
                "CONNECT"
              )}
            </div>
        </div>
        <Abstraxion
          onClose={() => { 
            setShowAbstraxion(false);
          }}
        />
    </nav>
    
  )
}

export default NavBar