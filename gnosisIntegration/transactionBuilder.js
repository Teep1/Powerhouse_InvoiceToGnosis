import { createSafeClient } from '@safe-global/sdk-starter-kit'
import dotenv from 'dotenv'
import { ethers } from 'ethers'

console.log('Starting Gnosis Safe transfer...')

dotenv.config()

/**
 * Execute token transfer via Gnosis Safe
 * @param {Object} payerWallet - {rpc, chainName, chainId, address}
 * @param {Array} paymentDetails - Array of payment details, each containing payeeWallet, token, and amount
 */

async function executeTokenTransfer(payerWallet, paymentDetails) {
    // Check if paymentDetails is a single object and convert it to an array
    if (!Array.isArray(paymentDetails)) {
        paymentDetails = [paymentDetails];
    }

    const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY

    console.log('\n=== Safe Transfer Initialization ===')
    console.log(`Chain: ${payerWallet.chainName} (${payerWallet.chainId})`)
    console.log(`Safe Address: ${payerWallet.address}`)

    try {
        const safeClient = await createSafeClient({
            provider: payerWallet.rpc,
            signer: SIGNER_PRIVATE_KEY,
            safeAddress: payerWallet.address
        })

        const provider = new ethers.JsonRpcProvider(payerWallet.rpc)

        const transactions = []
        const amountsInSmallestUnit = []  // Store amounts for each payment
        const decimalsList = []  // Store decimals for each token

        for (const payment of paymentDetails) {
            const { payeeWallet, token, amount } = payment

            console.log(`\nToken: ${token.symbol} (${token.evmAddress})`)

            // Get token decimals using ERC20 decimals() method
            const tokenContract = new ethers.Contract(
                token.evmAddress,
                ['function decimals() view returns (uint8)'],
                provider
            )
            const decimals = await tokenContract.decimals()
            decimalsList.push(decimals)  // Save the decimals for later use
            const amountInSmallestUnit = ethers.parseUnits(amount.toString(), decimals)
            amountsInSmallestUnit.push(amountInSmallestUnit)  // Save the amount for later use
            
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

            transactions.push({
                to: token.evmAddress,
                data: transferData.data,
                value: '0'  // Since we're transferring ERC20 tokens, ETH value is 0
            })
        }

        console.log('\n=== Processing Transfer ===')
        console.log('Submitting transaction to Safe...')
        const txResult = await safeClient.send({ transactions })
        
        // Add logging for transaction result
        console.log('Transaction result:', txResult);

        // Check if the transaction was successful
        if (!txResult || !txResult.transactions || txResult.transactions.length === 0) {
            throw new Error('Transaction submission failed, no transaction details returned.');
        }

        console.log('Transaction submitted successfully!\n')

        return {
            success: true,
            txHash: txResult.transactions[0]?.ethereumTxHash || 'N/A',
            safeAddress: payerWallet.address,
            paymentDetails: paymentDetails.map((payment, index) => ({
                ...payment,
                amount: ethers.formatUnits(amountsInSmallestUnit[index], decimalsList[index])  // Use the stored decimals
            }))
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


