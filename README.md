# Thoth

Why this name: The Egyptian God of Messeges. The server acts as a messenger between different optimzation algorithms to fetch details between them.

To generate the .pb.go file for go using protoc from the root Directory:

```shell
protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/*.proto
```

## Running server

```
go get .
cd server
go run ./server.go
```

### Running Client

```
From root directory of project
go run .
```

## Current Structs of proto file:

#### 3D Bin Packing

```go
struct Box{
	length  float
	breadth float
	height  float
	id      int32
    weight  float
}

struct Position{
	x float
	y float
	z float
}

struct BinPackingRequest{
    Bin     Box
    Items   Box[]
}

struct BinPackingResponse{
    Items       Box[]
    Positions   Position[]
}
```

#### Route Planner

```go

struct Package{
    length	float
    breadth float
    height	float
    lat		float
    long	flaot
    id		int32
    wieght	float
}

struct Vehicle{
    weight		float
    volume		float
    vehicle_id	int32
}
struct CVRPRequest {
    vechicle_count	int32
    package_count	int32
    package         Package[]
    vehicle         Vehicle[]
}

struct Path{
    vehicle_id  int32
    box         int32[]
}

struct CVRPResponse{
    vehicle_count   int32
    paths           Path[]
}
```
