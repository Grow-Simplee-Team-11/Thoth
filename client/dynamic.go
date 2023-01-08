package client

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/Grow-Simplee-KGP/Thoth/database"
	"github.com/Grow-Simplee-KGP/Thoth/proto/dynamic"
	"github.com/go-redis/redis/v9"
	"google.golang.org/grpc"
)

type Coordinate struct {
	Latitude  float64 `json:"latitude,string"`
	Longitude float64 `json:"longitude,string"`
}

type Package struct {
	Rider int64 `json:"rider,string"`
}

var (
	dynamicGrpcService       = "10.146.222.142:50051"
	dynamicGrpcServiceClient dynamic.DynamicRoutingClient
)

type DynamicRoutingClient struct {
}

type Location []redis.GeoLocation

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

func fetchLocations(pickup *dynamic.Object) []int32 {
	locations, err := database.Db.GeoSearch("location", float64(pickup.Location.X), float64(pickup.Location.Y))
	objectId := []int32{}
	for _, key := range locations {
		i, _ := strconv.ParseInt(key.Name, 10, 32)
		objectId = append(objectId, int32(i))
	}

	if err != nil {
		panic(err)
	}
	return objectId
}

func getRider(objectId int32) int32 {
	key := fmt.Sprintf("package:%d", objectId)
	data, err := database.Db.Get(key)
	if err != nil {
		panic(err)
	}

	var pkg Package
	json.Unmarshal([]byte(data), &pkg)
	return int32(pkg.Rider)
}

func getPath(riderId int32) []int32 {
	return []int32{1, 2, 3}
}

func fetchPaths(locations []int32) []*dynamic.ObjectPaths {
	paths := []*dynamic.ObjectPaths{}
	for _, objectId := range locations {
		riderId := getRider(objectId)
		// path := getPath(riderId)
		paths = append(paths, &dynamic.ObjectPaths{Vehicle: riderId, Objects: []*dynamic.Object{}})
	}

	return paths
}

func fetchHub() dynamic.Location {
	val, err := database.Db.Get("hub")
	if err != nil {
		panic(err)
	}

	var hub dynamic.Location
	err = json.Unmarshal([]byte(val), &hub)
	if err != nil {
		panic(err)
	}

	return hub
}

func (dc *DynamicRoutingClient) RunDynamic(c *context.Context, pickup *dynamic.Object) (string, error) {
	if err := prepareDynamicGrpcClient(c); err != nil {
		return "", err
	}

	//fetch nearby riders with their paths
	objects := fetchLocations(pickup)
	hub := fetchHub()
	//fetch paths of each rider
	// paths := fetchPaths(locations)
	// objects := []int32{500, 501, 503, 504, 502, 505}
	// pick := &dynamic.Object{Id: 1011, Length: 2, Breadth: 2, Height: 2, IsDelivery: false, Location: &dynamic.Location{X: 0, Y: 5}}

	pick2 := &dynamic.Object{Id: 500, Length: 1, Breadth: 1, Height: 3, IsDelivery: true, Location: &dynamic.Location{X: -1, Y: 0}}
	pick3 := &dynamic.Object{Id: 501, Length: 1, Breadth: 1, Height: 6, IsDelivery: true, Location: &dynamic.Location{X: 1, Y: 0}}
	pick4 := &dynamic.Object{Id: 502, Length: 1, Breadth: 1, Height: 2, IsDelivery: true, Location: &dynamic.Location{X: 2, Y: -1}}
	pick5 := &dynamic.Object{Id: 503, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 0, Y: -1}}
	pick6 := &dynamic.Object{Id: 504, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 2, Y: 0}}
	pick7 := &dynamic.Object{Id: 505, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 3, Y: 0}}
	path := []*dynamic.Object{pick2, pick3, pick4}
	path2 := []*dynamic.Object{pick5, pick6, pick7}
	paths := []*dynamic.ObjectPaths{{Vehicle: 10, Objects: path, Volume: 4, Weight: 1, Start: &dynamic.Location{X: -1, Y: -1}}, {Vehicle: 1, Objects: path2, Volume: 1, Weight: 1, Start: &dynamic.Location{X: 0, Y: -2}}}
	res, err := dynamicGrpcServiceClient.RunDynamic(*c, &dynamic.DynamicRequest{Pickup: pickup, ObjectIds: objects, Paths: paths, Hub: &hub})
	if err != nil {
		return "", errors.New("could not call dynamic request service")
	}

	fmt.Println(res.Vehicle)

	return res.String(), nil
}
