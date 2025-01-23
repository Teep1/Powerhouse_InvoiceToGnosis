import { executeTokenTransfer } from './transactionBuilder.js'
import dotenv from 'dotenv'

// Initialize dotenv
dotenv.config()

async function runTest() {
    // Separate payerWallet configuration
    const payerWallet = {
        rpc: 'https://base.llamarpc.com',
        chainName: 'Base',
        chainId: '8453',
        address: '0x00000' // Safe address
    }

    // Payment details including payee information
    const paymentDetails = {
        payeeWallet: {
            address: '0x000000', // Address of payee
            chainName: 'Base',
            chainId: '8453'
        },
        token: {
            evmAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
            symbol: 'USDC',
            chainName: 'Base',
            chainId: '8453'
        },
        amount: 0.0001 // Amount in USDC
    }

    try {
        console.log('\n=== Starting Safe Transfer Test ===')
        
        const result = await executeTokenTransfer(
            payerWallet,
            paymentDetails
        )

        console.log('=== Transfer Results ===')
        console.log('\nStatus: Success ✅')
        console.log('\nTransaction Details:')
        console.log(`• TX Hash: ${result.txHash}`)
        console.log(`• Safe Address (Payer): ${result.safeAddress}`)
        console.log(`• Recipient (Payee): ${result.recipient}\n`)
        console.log(`• Token: ${paymentDetails.token.symbol}`)
        console.log(`• Amount: ${result.amount}`)

    } catch (error) {
        console.error('\n=== Test Failed ===')
        console.error('Error:', error.message)
        if (error?.response?.data) {
            console.error('Additional Details:', error.response.data)
        }
        process.exit(1)
    }
}

// Run the test
runTest().catch(console.error)
