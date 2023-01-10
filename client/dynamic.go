package client

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/Grow-Simplee-KGP/Thoth/database"
	"github.com/Grow-Simplee-KGP/Thoth/proto/dynamic"
	"google.golang.org/grpc"
)

type Coordinate struct {
	Latitude  float64 `json:"latitude,string"`
	Longitude float64 `json:"longitude,string"`
}

type Package struct {
	Rider int32 `json:"rider,omitempty"`
	dynamic.Object
}

var (
	dynamicGrpcService       = "10.146.222.142:50051"
	dynamicGrpcServiceClient dynamic.DynamicRoutingClient
)

type DynamicRoutingClient struct {
}

func prepareDynamicGrpcClient(c *context.Context) error {
	conn, err := grpc.DialContext(*c, dynamicGrpcService, []grpc.DialOption{
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

type Rider struct {
	Vehicle int32             `json:"vehicle,omitempty"`
	Objects []int32           `json:"objects,omitempty"`
	Volume  int32             `json:"volume,omitempty"`
	Weight  int32             `json:"weight,omitempty"`
	Start   *dynamic.Location `json:"start,omitempty"`
}

func getRiderId(objectId int32) *Package {
	key := fmt.Sprintf("package:%d", objectId)
	data, err := database.Db.Get(key)
	if err != nil {
		panic(err)
	}
	var pkg Package
	json.Unmarshal([]byte(data), &pkg)
	return &pkg
}

func getRider(riderId int32) Rider {
	key := fmt.Sprintf("rider:%d", riderId)
	data, err := database.Db.Get(key)
	if err != nil {
		panic(err)
	}

	var pkg Rider
	json.Unmarshal([]byte(data), &pkg)
	return pkg
}

func addPath(objects []int32) []*dynamic.Object {
	var path []*dynamic.Object
	for _, value := range objects {
		key := fmt.Sprintf("package:%d", value)
		data, err := database.Db.Get(key)
		if err != nil {
			panic(err)
		}

		var pkg *dynamic.Object
		json.Unmarshal([]byte(data), &pkg)
		path = append(path, pkg)
	}
	return path
}

func fetchPaths(locations *[]int32) []*dynamic.ObjectPaths {
	paths := []*dynamic.ObjectPaths{}
	for _, objectId := range *locations {
		riderId := getRiderId(objectId)
		rider := getRider(riderId.Rider)
		path := addPath(rider.Objects)

		new_rider := &dynamic.ObjectPaths{Vehicle: rider.Vehicle, Objects: path, Volume: rider.Volume, Weight: rider.Weight, Start: rider.Start}

		paths = append(paths, new_rider)
	}

	return paths
}

func FetchHub() *dynamic.Location {
	val, err := database.Db.Get("hub")
	if err != nil {
		panic(err)
	}

	var hub dynamic.Location
	err = json.Unmarshal([]byte(val), &hub)
	if err != nil {
		panic(err)
	}

	return &hub
}

func saveRider(rider Rider) {
	key := fmt.Sprintf("rider:%d", rider.Vehicle)
	data, err := json.Marshal(rider)
	if err != nil {
		panic(err)
	}
	database.Db.Set(key, data)
}

func saveRoute(response *dynamic.DynamicResponse) {
	rider := getRider(response.Vehicle)
	rider.Objects = response.ObjectIds
	saveRider(rider)
}

func (dc *DynamicRoutingClient) RunDynamic(c *context.Context, pickup *dynamic.Object) (string, error) {
	if err := prepareDynamicGrpcClient(c); err != nil {
		return "", err
	}

	// fetch nearby riders with their paths
	objects := fetchLocations(pickup)
	hub := FetchHub()
	paths := fetchPaths(&objects)
	//fetch paths of each rider
	// paths := fetchPaths(locations)
	// objects := []int32{500, 501, 503, 504, 502, 505}
	// pick := &dynamic.Object{Id: 1011, Length: 2, Breadth: 2, Height: 2, IsDelivery: false, Location: &dynamic.Location{X: 0, Y: 5}}

	// pick2 := &dynamic.Object{Id: 500, Length: 1, Breadth: 1, Height: 3, IsDelivery: true, Location: &dynamic.Location{X: -1, Y: 0}}
	// pick3 := &dynamic.Object{Id: 501, Length: 1, Breadth: 1, Height: 6, IsDelivery: true, Location: &dynamic.Location{X: 1, Y: 0}}
	// pick4 := &dynamic.Object{Id: 502, Length: 1, Breadth: 1, Height: 2, IsDelivery: true, Location: &dynamic.Location{X: 2, Y: -1}}
	// pick5 := &dynamic.Object{Id: 503, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 0, Y: -1}}
	// pick6 := &dynamic.Object{Id: 504, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 2, Y: 0}}
	// pick7 := &dynamic.Object{Id: 505, Length: 1, Breadth: 1, Height: 1, IsDelivery: true, Location: &dynamic.Location{X: 3, Y: 0}}
	// path := []*dynamic.Object{pick2, pick3, pick4}
	// path2 := []*dynamic.Object{pick5, pick6, pick7}
	// paths := []*dynamic.ObjectPaths{{Vehicle: 10, Objects: path, Volume: 4, Weight: 1, Start: &dynamic.Location{X: -1, Y: -1}}, {Vehicle: 1, Objects: path2, Volume: 1, Weight: 1, Start: &dynamic.Location{X: 0, Y: -2}}}
	res, err := dynamicGrpcServiceClient.RunDynamic(*c, &dynamic.DynamicRequest{Pickup: pickup, ObjectIds: objects, Paths: paths, Hub: hub})
	if err != nil {
		return "", errors.New("could not call dynamic request service")
	}

	saveRoute(res)
	// res := dynamic.DynamicResponse{}

	return res.String(), nil
}
