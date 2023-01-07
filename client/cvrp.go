package client

// import (
// 	"context"
// 	"log"
// 	"time"

// 	"github.com/Grow-Simplee-KGP/Thoth/proto"
// )

// // Function that calls the CVRP microservice
// func CallCVRP(client proto.TransportClient) {
// 	log.Println("Calling CVRP Service")
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	// //Get value as paramater
// 	// bin := &proto.Bin{Id: 1, Length: 1, Breadth: 1, Height: 1, Weight: 1}
// 	// location := &proto.Location{Latitude: 10, Longitude: 10}
// 	// package1 := []*proto.Package{{Id: 1, Bin: bin, Location: location}}
// 	// vehicle := []*proto.Vehicle{{Id: 1, Weight: 12, Volume: 12}}
// 	// value := &proto.CVRPRequest{VehicleCount: 1, PackageCount: 1, Packages: package1, Vehicles: vehicle}

// 	data, err := client.RunCVRP(ctx, &proto.CVRPRequest{})
// 	if err != nil {
// 		log.Fatalf("Call CVRP failed with %s", err)
// 	}

// 	log.Print(data)
// }
