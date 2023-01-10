package client

import (
	"context"
	"errors"

	"github.com/Grow-Simplee-KGP/Thoth/proto/clustering"
	"google.golang.org/grpc"
)

var (
	clusteringGrpcService       = "10.146.222.142:50051"
	clusteringGrpcServiceClient clustering.ClusteringClient
)

type ClusteringClient struct {
}

func prepareClusteringGrpcClient(c *context.Context) error {
	conn, err := grpc.DialContext(*c, clusteringGrpcService, []grpc.DialOption{
		grpc.WithBlock()}...,
	)
	if err != nil {
		clusteringGrpcServiceClient = nil
		return errors.New("connection to Clustering gRPC failed")

	}
	if clusteringGrpcServiceClient != nil {
		conn.Close()
		return nil
	}

	clusteringGrpcServiceClient = clustering.NewClusteringClient(conn)
	return nil
}

func (cc *ClusteringClient) CreateClusters(c *context.Context) (string, error) {
	if err := prepareClusteringGrpcClient(c); err != nil {
		return "", err
	}

	res, err := clusteringGrpcServiceClient.GetClusters(*c, &clustering.ClusteringRequest{})
	if err != nil {
		return "", errors.New("Could not Call Clustering request service")
	}

	return res.String(), nil
}
