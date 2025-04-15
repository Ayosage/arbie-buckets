package connection

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	// ReconnectInterval defines how often to attempt reconnection
	ReconnectInterval = 30 * time.Second

	// HealthCheckInterval defines how often to check connection health
	HealthCheckInterval = 1 * time.Minute

	// ConnectionTimeout defines timeout for connection operations
	ConnectionTimeout = 10 * time.Second
)

// ConnectionStatus represents the current state of the blockchain connection
type ConnectionStatus int

const (
	StatusDisconnected ConnectionStatus = iota
	StatusConnecting
	StatusConnected
	StatusError
)

// String returns a string representation of the connection status
func (s ConnectionStatus) String() string {
	switch s {
	case StatusDisconnected:
		return "Disconnected"
	case StatusConnecting:
		return "Connecting"
	case StatusConnected:
		return "Connected"
	case StatusError:
		return "Error"
	default:
		return "Unknown"
	}
}

// ConnectionManager handles blockchain connection with resilience features
type ConnectionManager struct {
	client         *ethclient.Client
	url            string
	mutex          sync.RWMutex
	status         ConnectionStatus
	lastError      error
	stopChan       chan struct{}
	reconnectChan  chan struct{}
	isReconnecting bool
}

// NewConnectionManager creates a new blockchain connection manager
func NewConnectionManager(rpcURL string) *ConnectionManager {
	if rpcURL == "" {
		rpcURL = "https://sepolia.base.org" // Default to Base Sepolia testnet
	}

	return &ConnectionManager{
		url:           rpcURL,
		status:        StatusDisconnected,
		stopChan:      make(chan struct{}),
		reconnectChan: make(chan struct{}, 1),
	}
}

// Connect establishes a connection to the blockchain
func (cm *ConnectionManager) Connect() error {
	cm.mutex.Lock()
	if cm.status == StatusConnecting {
		cm.mutex.Unlock()
		return errors.New("connection attempt already in progress")
	}

	if cm.client != nil {
		cm.mutex.Unlock()
		return nil // Already connected
	}

	cm.status = StatusConnecting
	cm.mutex.Unlock()

	// Create a context with timeout for the connection
	ctx, cancel := context.WithTimeout(context.Background(), ConnectionTimeout)
	defer cancel()

	// Connect to blockchain
	client, err := ethclient.DialContext(ctx, cm.url)
	if err != nil {
		cm.mutex.Lock()
		cm.status = StatusError
		cm.lastError = err
		cm.mutex.Unlock()
		return fmt.Errorf("failed to connect to blockchain at %s: %w", cm.url, err)
	}

	// Verify connection by getting network ID
	networkID, err := client.NetworkID(ctx)
	if err != nil {
		client.Close()
		cm.mutex.Lock()
		cm.status = StatusError
		cm.lastError = err
		cm.mutex.Unlock()
		return fmt.Errorf("failed to get network ID: %w", err)
	}

	// Set the client if everything is successful
	cm.mutex.Lock()
	cm.client = client
	cm.status = StatusConnected
	cm.lastError = nil
	cm.mutex.Unlock()

	// Start health check routine when connecting for the first time
	if cm.stopChan != nil {
		go cm.startHealthCheck()
	}

	log.Printf("Connected to blockchain at %s (Network ID: %s)", cm.url, networkID.String())
	return nil
}

// Client returns the ethclient.Client instance, creating a connection if needed
func (cm *ConnectionManager) Client() (*ethclient.Client, error) {
	cm.mutex.RLock()
	if cm.client != nil && cm.status == StatusConnected {
		client := cm.client
		cm.mutex.RUnlock()
		return client, nil
	}
	cm.mutex.RUnlock()

	// If not connected, try to connect
	if err := cm.Connect(); err != nil {
		// If connection fails, trigger reconnect attempt
		cm.TriggerReconnect()
		return nil, fmt.Errorf("blockchain client not available: %w", err)
	}

	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	return cm.client, nil
}

// Status returns the current connection status
func (cm *ConnectionManager) Status() (ConnectionStatus, error) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	return cm.status, cm.lastError
}

// CheckHealth checks if the blockchain connection is healthy
func (cm *ConnectionManager) CheckHealth() bool {
	cm.mutex.RLock()
	if cm.client == nil {
		cm.mutex.RUnlock()
		return false
	}
	client := cm.client
	cm.mutex.RUnlock()

	// Create a context with timeout for the health check
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Try to get the block number as a simple health check
	_, err := client.BlockNumber(ctx)
	if err != nil {
		log.Printf("Blockchain connection health check failed: %v", err)
		return false
	}
	return true
}

// TriggerReconnect triggers a reconnection attempt if not already reconnecting
func (cm *ConnectionManager) TriggerReconnect() {
	cm.mutex.Lock()
	if !cm.isReconnecting {
		cm.isReconnecting = true
		cm.mutex.Unlock()

		// Non-blocking send to reconnect channel
		select {
		case cm.reconnectChan <- struct{}{}:
		default:
			// Channel already has a pending reconnect
		}
	} else {
		cm.mutex.Unlock()
	}
}

// startHealthCheck starts a background routine that checks connection health
// and triggers reconnection when necessary
func (cm *ConnectionManager) startHealthCheck() {
	healthTicker := time.NewTicker(HealthCheckInterval)
	reconnectTicker := time.NewTicker(ReconnectInterval)
	defer healthTicker.Stop()
	defer reconnectTicker.Stop()

	for {
		select {
		case <-cm.stopChan:
			return
		case <-healthTicker.C:
			if !cm.CheckHealth() {
				log.Println("Connection health check failed, triggering reconnect")
				cm.TriggerReconnect()
			}
		case <-reconnectTicker.C:
			// Periodically check if we need to reconnect
			cm.mutex.RLock()
			needsReconnect := cm.status != StatusConnected && cm.client == nil
			cm.mutex.RUnlock()

			if needsReconnect {
				cm.TriggerReconnect()
			}
		case <-cm.reconnectChan:
			cm.handleReconnect()
		}
	}
}

// handleReconnect performs the actual reconnection process
func (cm *ConnectionManager) handleReconnect() {
	cm.mutex.Lock()
	log.Println("Attempting to reconnect to blockchain...")

	// Close any existing client
	if cm.client != nil {
		cm.client.Close()
		cm.client = nil
	}

	cm.status = StatusConnecting
	cm.mutex.Unlock()

	// Attempt to connect
	err := cm.Connect()

	cm.mutex.Lock()
	if err != nil {
		cm.status = StatusError
		cm.lastError = err
		log.Printf("Reconnection failed: %v", err)
	} else {
		cm.status = StatusConnected
		log.Println("Successfully reconnected to blockchain")
	}
	cm.isReconnecting = false
	cm.mutex.Unlock()
}

// Close stops all goroutines and closes the client connection
func (cm *ConnectionManager) Close() {
	// Signal stop to health check goroutine
	close(cm.stopChan)

	cm.mutex.Lock()
	defer cm.mutex.Unlock()

	// Close the client if it exists
	if cm.client != nil {
		cm.client.Close()
		cm.client = nil
	}
	cm.status = StatusDisconnected
}
