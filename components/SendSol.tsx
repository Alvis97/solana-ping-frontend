import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import React, { useState } from 'react'
import FormStyles from '../styles/sendSol.module.css'

function SendSol() {
    const { publicKey, sendTransaction } = useWallet();
    const [ message, setMessage ] = useState("");
    const connection = new Connection(clusterApiUrl("devnet"));

    //Function handle airdropping if required
    const airdropIfRequired = async (minBalance) => {
        if(!publicKey) return;

        const balance = await connection.getBalance(publicKey);
        if (balance < minBalance) {
            console.log("Airdropping SOL to your wallet...");
            const airdropSignature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature);
            console.log("Airdrop completed");
        }
    };

    //Function handle transaction submission
    const sendTransactionHandler = async (e) => {
        e.preventDefault();
        if (!publicKey) {
            setMessage("Please connect your wallet.");
            return;
        }

        const formData = new FormData(e.target);
        const amountOfSol = parseFloat(formData.get("amountOfSol") as string);
        const sendTo = formData.get("sendTo");

        if (!amountOfSol) {
            setMessage("Please enter a valid amount of SOL");
            return;
        }

        if (!sendTo) {
            setMessage("Please enter a valid recipient address");
            return;
        }

        try{
            const recipinetPubKey = new PublicKey(sendTo);
            const lamportsToSend = amountOfSol * LAMPORTS_PER_SOL;

            
            //Ensure sender has enough SOL
            await airdropIfRequired(lamportsToSend);

            //Create transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipinetPubKey,
                    lamports: lamportsToSend,
                })
            )

              //Send transaction
              const signature = await sendTransaction(transaction, connection);
              await connection.confirmTransaction(signature, "processed");

              setMessage(`Transaction successful! Signature: ${signature}`);


        } catch (error) {
            console.error("Transaction failed:", error);
            setMessage("Transaction failed. Check the console for details.");
        }  
    };
  return (
    <div className={FormStyles.parent}>
        <h2>Send SOL</h2>
       <form className={FormStyles.form} onSubmit={sendTransactionHandler}>
            <label htmlFor="amountOfSol">Amount of SOL to send:</label><br />
            <input type="text" name="amountOfSol" placeholder='0.04'/><br/> 
            <label htmlFor="sendTo">Send to</label><br />
            <input type="text" name='sendTo' placeholder='9yK5WoNHmW1yCZyGGHfsk6Z7ypz1RqaZfT6V8qbw8iLg'/><br />
            <button className={FormStyles.btn} type="submit">Send transaction</button>
        </form>
        {message && <p className={FormStyles.message}>{message}</p>}
    </div>
  )
}

export default SendSol


