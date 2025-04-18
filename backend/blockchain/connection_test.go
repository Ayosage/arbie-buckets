package blockchain

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/arbie-buckets/blockchain/connection"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// ConnectionTestService provides methods to interact with the ConnectionTest contract
type ConnectionTestService struct {
	client        *ethclient.Client
	contractABI   abi.ABI
	contractAddr  common.Address
	blockchainSvc *BlockchainService
}

// NewConnectionTestService creates a new ConnectionTest service
func NewConnectionTestService(blockchainSvc *BlockchainService, contractAddress string) (*ConnectionTestService, error) {
	// Parse contract ABI
	parsedABI, err := abi.JSON(strings.NewReader(ConnectionTestContractABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ConnectionTest ABI: %w", err)
	}

	// Get client from blockchain service
	client, err := blockchainSvc.GetConnectionClient()
	if err != nil {
		return nil, fmt.Errorf("failed to get blockchain client: %w", err)
	}

	return &ConnectionTestService{
		client:        client,
		contractABI:   parsedABI,
		contractAddr:  common.HexToAddress(contractAddress),
		blockchainSvc: blockchainSvc,
	}, nil
}

// GetMessage retrieves the current message stored in the contract
func (s *ConnectionTestService) GetMessage() (string, error) {
	// Create the input data for the contract call
	data, err := s.contractABI.Pack("message")
	if err != nil {
		return "", fmt.Errorf("failed to pack contract call: %w", err)
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Call the contract
	result, err := s.client.CallContract(ctx, ethereum.CallMsg{
		To:   &s.contractAddr,
		Data: data,
	}, nil)
	if err != nil {
		return "", fmt.Errorf("failed to call ConnectionTest contract: %w", err)
	}

	// Unpack the result
	var message string
	err = s.contractABI.UnpackIntoInterface(&message, "message", result)
	if err != nil {
		return "", fmt.Errorf("failed to unpack contract result: %w", err)
	}

	return message, nil
}

// SetMessage sets a new message in the contract
func (s *ConnectionTestService) SetMessage(newMessage string) (string, error) {
	// Create transaction auth
	auth, err := s.blockchainSvc.CreateTransactionAuth()
	if err != nil {
		return "", err
	}

	// Create the input data
	input, err := s.contractABI.Pack("setMessage", newMessage)
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
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(s.blockchainSvc.GetChainID()), s.blockchainSvc.privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), connection.ConnectionTimeout)
	defer cancel()

	// Send transaction
	err = s.client.SendTransaction(ctx, signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return signedTx.Hash().Hex(), nil
}

// InitializeConnectionTest initializes the ConnectionTest service with the contract address
func InitializeConnectionTest() (*ConnectionTestService, error) {
	// Get blockchain service
	blockchainSvc := GetService()
	if blockchainSvc == nil {
		return nil, errors.New("blockchain service not initialized, call Initialize() first")
	}

	// Get contract address from environment
	contractAddress := os.Getenv("CONNECTION_TEST_CONTRACT_ADDRESS")
	if contractAddress == "" {
		return nil, errors.New("CONNECTION_TEST_CONTRACT_ADDRESS environment variable not set")
	}

	// Create ConnectionTest service
	connectionTestSvc, err := NewConnectionTestService(blockchainSvc, contractAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize ConnectionTest service: %w", err)
	}

	return connectionTestSvc, nil
}

// GetConnectionTestContractAddress returns the contract address for ConnectionTest
func GetConnectionTestContractAddress() string {
	addr := os.Getenv("CONNECTION_TEST_CONTRACT_ADDRESS")
	if len(addr) > 2 && addr[:2] == "0x" {
		return addr[2:] // Remove "0x" prefix if present
	}
	return addr
}
