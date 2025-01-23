import { createSafeClient } from '@safe-global/sdk-starter-kit'
import dotenv from 'dotenv'
import { ethers } from 'ethers'

console.log('Starting Gnosis Safe transfer...')

dotenv.config()

/**
 * Execute token transfer via Gnosis Safe
 * @param {Object} payerWallet - {rpc, chainName, chainId, address}
 * @param {Object} paymentDetails - Contains payeeWallet, token, and amount
 */

async function executeTokenTransfer(payerWallet, paymentDetails) {
    const { payeeWallet, token, amount } = paymentDetails
    const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY

    console.log('\n=== Safe Transfer Initialization ===')
    console.log(`Chain: ${payerWallet.chainName} (${payerWallet.chainId})`)
    console.log(`Safe Address: ${payerWallet.address}`)
    console.log(`Token: ${token.symbol} (${token.evmAddress})\n`)

    try {
        const safeClient = await createSafeClient({
            provider: payerWallet.rpc,
            signer: SIGNER_PRIVATE_KEY,
            safeAddress: payerWallet.address
        })

        // Get token decimals using ERC20 decimals() method
        const provider = new ethers.JsonRpcProvider(payerWallet.rpc)
        const tokenContract = new ethers.Contract(
            token.evmAddress,
            ['function decimals() view returns (uint8)'],
            provider
        )
        const decimals = await tokenContract.decimals()
        const amountInSmallestUnit = ethers.parseUnits(amount.toString(), decimals)
        
        console.log('=== Transfer Details ===')
        console.log(`Amount: ${amount} ${token.symbol}`)
        console.log(`Recipient: ${payeeWallet.address}\n`)

        // Create transfer data using the ERC20 transfer method
        const transferData = {
            to: token.evmAddress,
            data: `0xa9059cbb${
                payeeWallet.address
                .replace('0x', '')
                .padStart(64, '0')
            }${
                amountInSmallestUnit
                .toString(16)
                .padStart(64, '0')
            }`
        }

        console.log('Transfer data created:', transferData)

        const transactions = [{
            to: token.evmAddress,
            data: transferData.data,
            value: '0'  // Since we're transferring ERC20 tokens, ETH value is 0
        }]

        console.log('\n=== Processing Transfer ===')
        console.log('Submitting transaction to Safe...')
        const txResult = await safeClient.send({ transactions })
        console.log('Transaction submitted successfully!\n')

        return {
            success: true,
            txHash: txResult.transactions.ethereumTxHash,
            safeAddress: payerWallet.address,
            tokenAddress: token.evmAddress,
            amount: amount,
            recipient: payeeWallet.address
        }

    } catch (error) {
        console.error('\n=== Transfer Error ===')
        console.error(error.message)
        if (error?.response?.data) {
            console.error('Response details:', error.response.data)
        }
        throw error
    }
}

export { executeTokenTransfer }


