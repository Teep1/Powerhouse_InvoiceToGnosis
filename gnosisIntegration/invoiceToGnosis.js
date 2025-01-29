import { executeTokenTransfer } from './transactionBuilder.js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Initialize dotenv
dotenv.config()

// Token address mapping by network and symbol
const TOKEN_ADDRESSES = {
    'BASE': {
        'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        'USDS': '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc',
        // Add more tokens as needed
    },
    // Add more networks as needed
}

function getTokenAddress(chainName, symbol) {
    const networkTokens = TOKEN_ADDRESSES[chainName.toUpperCase()]
    if (!networkTokens) {
        throw new Error(`Network ${chainName} not supported`)
    }
    
    const tokenAddress = networkTokens[symbol]
    if (!tokenAddress) {
        throw new Error(`Token ${symbol} not supported on ${chainName}`)
    }
    
    return tokenAddress
}

async function runTest() {
    // Read and parse the current-state.json file
    const currentState = JSON.parse(
        readFileSync('./gnosisIntegration/current-state.json', 'utf8')
    )

    // Separate payerWallet configuration
    const payerWallet = {
        rpc: 'https://base.llamarpc.com',
        chainName: 'Base',
        chainId: '8453',
        address: '0x1FB6bEF04230d67aF0e3455B997a28AFcCe1F45e' // Safe address
    }

    const currency = currentState.global.currency
    const chainName = currentState.global.issuer.paymentRouting.wallet.chainName

    // Extract payment details from current-state.json
    const paymentDetails = {
        payeeWallet: {
            address: currentState.global.issuer.paymentRouting.wallet.address,
            chainName: chainName,
            chainId: currentState.global.issuer.paymentRouting.wallet.chainId
        },
        token: {
            evmAddress: getTokenAddress(chainName, currency),
            symbol: currency,
            chainName: chainName,
            chainId: currentState.global.issuer.paymentRouting.wallet.chainId
        },
        amount: currentState.global.totalPriceTaxIncl / 1000000 // Make the amount small for testing
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
