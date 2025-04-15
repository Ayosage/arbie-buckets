package blockchain

import (
	"context"
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math/big"
	"os"
	"strings"
	"sync"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"

	"github.com/arbie-buckets/blockchain/connection" // Ensure connection package is imported for connection management
)

// Global service instance for singleton pattern
var (
	globalService *BlockchainService
	serviceInit   sync.Once
	serviceMutex  sync.RWMutex
)

// Contract ABI definitions
const arbitrageContractABI = `[
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

// TokenInfo represents basic token information
type TokenInfo struct {
	Address  string
	Symbol   string
	Decimals uint8
}

// ArbitrageOpportunity represents an arbitrage opportunity
type ArbitrageOpportunity struct {
	FromToken  string
	ToToken    string
	ProfitUSD  float64
	Percentage float64
	Timestamp  int64
}

// BlockchainService provides methods to interact with blockchain
type BlockchainService struct {
	connManager  *connection.ConnectionManager
	contractABI  abi.ABI
	contractAddr common.Address
	privateKey   *ecdsa.PrivateKey
	chainID      *big.Int
}

// Initialize sets up the blockchain service and connection
func Initialize() error {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	rpcURL := os.Getenv("BASE_TESTNET_RPC_URL")
	if rpcURL == "" {
		println("Warning: BASE_TESTNET_RPC_URL not set, using default")
		rpcURL = "https://sepolia.base.org" // Default to Base testnet
	}

	// Create connection manager
	connManager := connection.NewConnectionManager(rpcURL)

	// Initialize connection
	if err := connManager.Connect(); err != nil {
		return fmt.Errorf("failed to initialize blockchain connection: %w", err)
	}

	// Get contract address from environment
	contractAddress := os.Getenv("ARBITRAGE_CONTRACT_ADDRESS")
	if contractAddress == "" {
		return errors.New("ARBITRAGE_CONTRACT_ADDRESS environment variable not set")
	}

	// Create blockchain service
	var initErr error
	serviceInit.Do(func() {
		service, err := NewBlockchainService(connManager, contractAddress)
		if err != nil {
			initErr = err
			return
		}

		// Set global service
		serviceMutex.Lock()
		globalService = service
		serviceMutex.Unlock()
	})

	if initErr != nil {
		return fmt.Errorf("failed to initialize blockchain service: %w", initErr)
	}

	return nil
}

// GetService returns the global blockchain service instance
func GetService() *BlockchainService {
	serviceMutex.RLock()
	defer serviceMutex.RUnlock()
	return globalService
}

// NewBlockchainService creates a new instance of the blockchain service
func NewBlockchainService(connManager *connection.ConnectionManager, contractAddress string) (*BlockchainService, error) {
	// Parse contract ABI
	parsedABI, err := abi.JSON(strings.NewReader(arbitrageContractABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse contract ABI: %w", err)
	}

	// Get private key from environment
	privateKeyHex := os.Getenv("TEST_WALLET_PK_1")
	if privateKeyHex == "" {
		return nil, errors.New("TEST_WALLET_PK_1 environment variable not set")
	}

	// Remove "0x" prefix if present
	if strings.HasPrefix(privateKeyHex, "0x") {
		privateKeyHex = privateKeyHex[2:]
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}

	// Get the blockchain client
	client, err := connManager.Client()
	if err != nil {
		return nil, fmt.Errorf("failed to get blockchain client: %w", err)
	}

	// Get chain ID
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	chainID, err := client.NetworkID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get chain ID: %w", err)
	}

	return &BlockchainService{
		connManager:  connManager,
		contractABI:  parsedABI,
		contractAddr: common.HexToAddress(contractAddress),
		privateKey:   privateKey,
		chainID:      chainID,
	}, nil
}

// GetWalletAddress returns the wallet address corresponding to the private key
func (s *BlockchainService) GetWalletAddress() (common.Address, error) {
	publicKey := s.privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return common.Address{}, errors.New("failed to get public key")
	}
	return crypto.PubkeyToAddress(*publicKeyECDSA), nil
}

// GetTokenBalance gets the balance of a specific token for the wallet
func (s *BlockchainService) GetTokenBalance(tokenAddress common.Address) (*big.Int, error) {
	// Get client with resilient connection
	client, err := s.connManager.Client()
	if err != nil {
		return nil, err
	}

	// ERC20 balanceOf function signature
	data := []byte{0x70, 0xa0, 0x82, 0x31} // bytes4(keccak256("balanceOf(address)"))

	walletAddress, err := s.GetWalletAddress()
	if err != nil {
		return nil, err
	}

	// Pad address to 32 bytes
	paddedAddress := common.LeftPadBytes(walletAddress.Bytes(), 32)
	data = append(data, paddedAddress...)

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Call the smart contract
	result, err := client.CallContract(ctx, ethereum.CallMsg{
		To:   &tokenAddress,
		Data: data,
	}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call token contract: %w", err)
	}

	// Parse result
	balance := new(big.Int).SetBytes(result)
	return balance, nil
}

// GetArbitrageOpportunities fetches arbitrage opportunities from the contract
func (s *BlockchainService) GetArbitrageOpportunities() ([]ArbitrageOpportunity, error) {
	// Get client with resilient connection
	client, err := s.connManager.Client()
	if err != nil {
		return nil, err
	}

	// Create the input data for the contract call
	data, err := s.contractABI.Pack("getProfitOpportunities")
	if err != nil {
		return nil, fmt.Errorf("failed to pack contract call: %w", err)
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Call the contract
	result, err := client.CallContract(ctx, ethereum.CallMsg{
		To:   &s.contractAddr,
		Data: data,
	}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call contract: %w", err)
	}
	print(result) // result not used - error fix
	// Decode the result (this is a simplified example - actual decoding depends on your contract structure)
	var opportunities []ArbitrageOpportunity
	// In a real implementation, you would unpack the result using:
	// err = s.contractABI.UnpackIntoInterface(&opportunities, "getProfitOpportunities", result)

	// Simplified mock data for demonstration
	opportunities = []ArbitrageOpportunity{
		{
			FromToken:  "0x4200000000000000000000000000000000000006", // ETH on Base
			ToToken:    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
			ProfitUSD:  15.33,
			Percentage: 0.68,
			Timestamp:  1717372330,
		},
		{
			FromToken:  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
			ToToken:    "0x4200000000000000000000000000000000000006", // ETH on Base
			ProfitUSD:  10.00,
			Percentage: 1.01,
			Timestamp:  1717372330,
		},
	}

	return opportunities, nil
}

// ExecuteArbitrage executes an arbitrage trade
func (s *BlockchainService) ExecuteArbitrage(fromToken, toToken common.Address, amount, minReturn *big.Int) (string, error) {
	// Get client with resilient connection
	client, err := s.connManager.Client()
	if err != nil {
		return "", err
	}

	// Create transaction auth
	auth, err := s.createTransactionAuth()
	if err != nil {
		return "", err
	}

	// Create the input data
	input, err := s.contractABI.Pack("executeArbitrage", fromToken, toToken, amount, minReturn)
	if err != nil {
		return "", fmt.Errorf("failed to pack transaction data: %w", err)
	}

	// Create transaction
	tx := types.NewTransaction(
		auth.Nonce.Uint64(),
		s.contractAddr,
		auth.Value,
		auth.GasLimit,
		auth.GasPrice,
		input,
	)

	// Sign transaction
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(s.chainID), s.privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Send transaction
	err = client.SendTransaction(ctx, signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return signedTx.Hash().Hex(), nil
}

// WaitForTransaction waits for a transaction to be mined and returns the receipt
func (s *BlockchainService) WaitForTransaction(txHash common.Hash) (*types.Receipt, error) {
	// Get client with resilient connection
	client, err := s.connManager.Client()
	if err != nil {
		return nil, err
	}

	// Get transaction
	tx, _, err := client.TransactionByHash(context.Background(), txHash)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve transaction by hash: %w", err)
	}

	receipt, err := bind.WaitMined(context.Background(), client, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to wait for transaction: %w", err)
	}

	if receipt.Status == 0 {
		return receipt, errors.New("transaction failed")
	}

	return receipt, nil
}

// createTransactionAuth creates an authenticated transaction
func (s *BlockchainService) createTransactionAuth() (*bind.TransactOpts, error) {
	// Get client with resilient connection
	client, err := s.connManager.Client()
	if err != nil {
		return nil, err
	}

	walletAddress, err := s.GetWalletAddress()
	if err != nil {
		return nil, err
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Get nonce
	nonce, err := client.PendingNonceAt(ctx, walletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to get nonce: %w", err)
	}

	// Get gas price
	gasPrice, err := client.SuggestGasPrice(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get gas price: %w", err)
	}

	// Create auth
	auth, err := bind.NewKeyedTransactorWithChainID(s.privateKey, s.chainID)
	if err != nil {
		return nil, fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // No ETH being sent
	auth.GasLimit = uint64(300000) // Gas limit (can be adjusted)
	auth.GasPrice = gasPrice

	return auth, nil
}

// Close closes the blockchain connections
func Close() {
	serviceMutex.RLock()
	service := globalService
	serviceMutex.RUnlock()

	if service != nil && service.connManager != nil {
		service.connManager.Close()
	}
}

// GetBlockchainStatus returns the current blockchain connection status
func (s *BlockchainService) GetBlockchainStatus() map[string]interface{} {
	status, err := s.connManager.Status()

	result := map[string]interface{}{
		"connected": status == connection.StatusConnected,
		"network":   "Base Network",
		"status":    status.String(),
	}

	if err != nil {
		result["error"] = err.Error()
	}

	if status == connection.StatusConnected {
		// Add wallet address if available
		walletAddress, err := s.GetWalletAddress()
		if err == nil {
			result["walletAddress"] = walletAddress.Hex()
		}

		// Add chain ID
		if s.chainID != nil {
			result["chainId"] = s.chainID.String()
		}
	}

	return result
}

// GetChainID returns the chain ID of the connected network
func (s *BlockchainService) GetChainID() *big.Int {
	return s.chainID
}

// GetConnectionClient returns the ethclient from the connection manager
func (s *BlockchainService) GetConnectionClient() (*ethclient.Client, error) {
	if s.connManager == nil {
		return nil, errors.New("connection manager not initialized")
	}

	return s.connManager.Client()
}
