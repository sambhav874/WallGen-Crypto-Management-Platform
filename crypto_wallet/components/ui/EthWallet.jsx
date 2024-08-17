import { useState } from "react";
import {mnemonicToSeed} from 'bip39'
import {Wallet , HDNodeWallet} from "ethers";
import {Button} from './button';

 const EthWallet  = ({mnemonic}) => {
    const [currentIndex , setCurrentIndex] = useState(0);
    const [addresses , setAddresses] = useState([]);
    return(
        <div>
        <Button onClick={async function(){
            const seed = await mnemonicToSeed(mnemonic);
            const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
            const hdNode = HDNodeWallet.fromSeed(seed);
            const child = hdNode.derivePath(derivationPath);
            const privateKey = child.privateKey;
            const wallet = new Wallet(privateKey);
            setCurrentIndex(currentIndex + 1);
            setAddresses([...addresses , wallet.address]);
        }} > Add ETH Wallet </Button> 
        {addresses.map(p => <div>
            <p>Eth -  {p} </p>
        </div>)}  </div>
    )
    
}
export default EthWallet;