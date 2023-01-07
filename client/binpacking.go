package client

import (
	"context"
	"log"
	"time"

	"github.com/Grow-Simplee-KGP/Thoth/proto"
)

// Function that calls the Bin packing microservice
func Callbinpacking(client proto.TransportClient) {
	log.Println("Calling Binpacking Service")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	//Get value as paramater
	bin := &proto.Box{Id: 1, Length: 1, Breadth: 1, Height: 1, Weight: 1}
	boxes := []*proto.Box{{Id: 1, Length: 1, Breadth: 1, Height: 1, Weight: 1}, {Id: 2, Length: 2, Breadth: 2, Height: 2, Weight: 2}}
	value := &proto.BinPackingRequest{Bin: bin, Items: boxes}

	data, err := client.RunBinPacking(ctx, value)
	if err != nil {
		log.Fatalf("Call Binpack failed with %s", err)
	}

	log.Print(data)
}
