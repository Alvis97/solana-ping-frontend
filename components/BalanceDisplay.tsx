import { useWallet } from '@solana/wallet-adapter-react'
import React, { useEffect, useState } from 'react'
import SendSol from './sendSol';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import balanceStyle from '../styles/balance.module.css'


function BalanceDisplay() {

    const { publicKey, connected } = useWallet();
    const pubKey = publicKey ? publicKey.toBase58() : "No wallet connected";

    const [ network, setNetwork ] = useState<string>("");

    useEffect(() => {
        const connection = new Connection(clusterApiUrl("devnet"));
        setNetwork(connection.rpcEndpoint.includes("devnet") ? "Devnet" : "Mainnet");
    }, []);

    const [balance, setBalance] = useState("Loading...");
    const [usBalance, setUsBalance] = useState("Loading...");

    async function fetchBalance() {
        if (connected && publicKey) {
            // Create a connection to the Solana cluster
            const connection = new Connection(clusterApiUrl("devnet"));

            //Fetch balance
            const getWalletBalance = await connection.getBalance(publicKey);
            const solBalance = (getWalletBalance / 1e9).toFixed(2);
            setBalance(solBalance);

            try {
                const responce = await fetch (
                    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
                );
                const data = await responce.json();
                const solToUsRate = data.solana.usd;

                //Calculate balance
                const balaceInUsd = (parseFloat(solBalance) * solToUsRate).toFixed(2);
                setUsBalance(balaceInUsd);
            } catch (error) {
                console.error("Error fetching exchange rate", error);
                setUsBalance("Error fetching USD value");
            }
            
        }
    }
    useEffect(() => {
        fetchBalance();
      }, [connected, publicKey]);

  return (
    <div>
        { connected ? (
        <div className={balanceStyle.div1}>
            <div className={balanceStyle.walletInfo}>
            <h2>Your Wallet</h2>
            <p>Balance in SOL: {balance}</p>
            <p>Balance in Us Dollar: {usBalance}</p>
            <p>publicKey: {pubKey} </p>
            <p>Network: {network}</p>
            </div>
       
            <SendSol/>
        </div>
        ) : (
        <div className={balanceStyle.div2}>
            <h2>Welcome!</h2>
            <p>Select a wallet to send a transaction</p>
        </div>
        )}
    </div>
  )
}

export default BalanceDisplay
