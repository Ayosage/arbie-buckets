package coingecko

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

var BASE_EXCHANGES_URL = "https://api.coingecko.com/api/v3/exchanges/EXCHANGE/tickers?coin_ids=bitcoin"

func GetCoinPricesFromExchange(exchange string) {
	url := strings.Replace(BASE_EXCHANGES_URL, "EXCHANGE", exchange, 1)
	fmt.Println(url)
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("accept", "application/json")
	// Ask for API Key
	req.Header.Add("x-cg-demo-api-key", "")

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		log.Fatal()
	}

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}
