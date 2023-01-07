package client

import (
	"context"
	"errors"

	"github.com/Grow-Simplee-KGP/Thoth/proto/dynamic"
	"google.golang.org/grpc"
)

type Pickup struct {
	Latitude  float32 `json:"latitude,string"`
	Longitude float32 `json:"longitude,string"`
}

var (
	dynamicGrpcService       = "localhost:50051"
	dynamicGrpcServiceClient dynamic.DynamicRoutingClient
)

type DynamicRoutingClient struct {
}

func prepareDynamicGrpcClient(c *context.Context) error {
	conn, err := grpc.DialContext(*c, dynamicGrpcService, []grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithBlock()}...,
	)
	if err != nil {
		dynamicGrpcServiceClient = nil
		return errors.New("connection to dynamic gRPC failed")

	}
	if dynamicGrpcServiceClient != nil {
		conn.Close()
		return nil
	}

	dynamicGrpcServiceClient = dynamic.NewDynamicRoutingClient(conn)
	return nil
}

func (dc *DynamicRoutingClient) RunDynamic(c *context.Context, pickup Pickup) (string, error) {
	if err := prepareDynamicGrpcClient(c); err != nil {
		return "", err
	}

	res, err := dynamicGrpcServiceClient.RunDynamic(*c, &dynamic.DynamicRequest{})
	if err != nil {
		return "", errors.New("Could not error")
	}

	return res.String(), nil
}

// func CallDynamicRouting(client proto.TransportClient) {
// 	log.Println("Calling Dynamic Routing service")
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	dynamic := []*proto.SingleDynamicPath{{}}
// 	data, err := client.RunDynamix(ctx, &proto.DynamicRequest{Response: dynamic})

// }
