package constants

type Exchange int

const (
	BINANCE Exchange = iota
	GEMINI
	KRAKEN
)

var exchange = map[Exchange]string{
	BINANCE: "binance",
	GEMINI:  "gemini",
	KRAKEN:  "kraken",
}
