// Package blockchain provides blockchain interaction functionality
package blockchain

// ContractABIs holds the ABIs for all smart contracts used in the application
const (
	// ArbitrageContractABI holds the ABI for the Arbitrage contract
	ArbitrageContractABI = `[
		{
			"inputs": [
				{"internalType": "address", "name": "fromToken", "type": "address"},
				{"internalType": "address", "name": "toToken", "type": "address"},
				{"internalType": "uint256", "name": "amount", "type": "uint256"},
				{"internalType": "uint256", "name": "minReturn", "type": "uint256"}
			],
			"name": "executeArbitrage",
			"outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getProfitOpportunities",
			"outputs": [
				{
					"components": [
						{"internalType": "address", "name": "fromToken", "type": "address"},
						{"internalType": "address", "name": "toToken", "type": "address"},
						{"internalType": "uint256", "name": "profit", "type": "uint256"},
						{"internalType": "uint256", "name": "timestamp", "type": "uint256"}
					],
					"internalType": "struct Arbitrage.Opportunity[]",
					"name": "",
					"type": "tuple[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]`

	// ConnectionTestContractABI holds the ABI for the ConnectionTest contract
	ConnectionTestContractABI = `[
		{
			"inputs": [],
			"name": "message",
			"outputs": [{"internalType": "string", "name": "", "type": "string"}],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [{"internalType": "string", "name": "newMessage", "type": "string"}],
			"name": "setMessage",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]`
)
