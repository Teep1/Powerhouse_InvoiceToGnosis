# Gnosis Safe Transaction Builder

This repository contains a JavaScript implementation for building and sending crypto transactions from Gnosis Safe using a Powerhouse Invoice Document as the source. 

## Key Features

* `transactionBuilder.js`: This file contains the core logic for building and sending transactions to Gnosis Safe. It handles the creation of transfer data, submission of transactions, and returns the transaction hash upon success.
* `example.js`: This file provides an example of how to format objects for use with the `transactionBuilder.js` file. It includes examples of payer and payee wallet objects, as well as payment details.
* `current-state.json`: This file contains an example of the current state of an invoice, including details.

## Usage

To use this repository, follow these steps:

1. Update the payee details in the `example.js` file. This includes the payee's wallet address, the token to be transferred, and the amount to be transferred.
2. Update the environment variables in the `.env` file. This includes the `SIGNER_PRIVATE_KEY` and `SIGNER_ADDRESS`.
3. Run the `example.js` file by executing the command `node example.js` in your terminal. This will send a transaction to the payee.

For more advanced functionality, you can explore the `invoiceToGnosis.js` file. This file allows you to read a Powerhouse Invoice document and build the transaction from the data provided.


## Environment Variables

This project relies on environment variables to function correctly. You will need to create a `.env` file in the root of the project with the following variables:

* `SIGNER_PRIVATE_KEY`: The private key of the signer wallet.
* `SIGNER_ADDRESS`: The address of the signer wallet.

Please ensure that these variables are set correctly before attempting to use this project.
