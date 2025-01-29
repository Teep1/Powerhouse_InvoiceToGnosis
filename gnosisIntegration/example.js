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
        address: '0x1FB6bEF04230d67aF0e3455B997a28AFcCe1F45e' // Safe address
    }

    // Payment details including payee information
    const paymentDetails = [
        {
            payeeWallet: {
                address: '0x48f208afD0Abeacd4e7C8839Ea19e3CcCF0433DE', // Address of payee
                chainName: 'Base',
                chainId: '8453'
            },
            token: {
                evmAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
                symbol: 'USDC',
                chainName: 'Base',
                chainId: '8453'
            },
            amount: 0.00001 // Amount in USDC
        },
        {
            payeeWallet: {
                address: '0x48f208afD0Abeacd4e7C8839Ea19e3CcCF0433DE', // Same address for the second transaction
                chainName: 'Base',
                chainId: '8453'
            },
            token: {
                evmAddress: '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc', // Replace with the actual USDS token address
                symbol: 'USDS',
                chainName: 'Base',
                chainId: '8453'
            },
            amount: 0.00001 // Amount in USDS
        }
    ]

    try {
        console.log('\n=== Starting Safe Transfer Test ===')
        
        const result = await executeTokenTransfer(
            payerWallet,
            paymentDetails
        )

        console.log('=== Transfer Results ===')
        console.log('\nStatus: Success ✅')

        // Iterate over each payment detail for multiple transactions
        console.log('\nTransaction Details:')
        console.log(`• TX Hash: ${result.txHash}`) // Assuming txHash is for the first transaction
        console.log(`• Safe Address (Payer): ${result.safeAddress}`)

        result.paymentDetails.forEach((payment, index) => {
            console.log(`\nTransaction ${index + 1}:`)
            console.log(`• Recipient (Payee): ${payment.payeeWallet.address}`)
            console.log(`• Token: ${payment.token.symbol}`)
            console.log(`• Amount: ${payment.amount}`)
        });

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
