# Thoth

Why this name: The Egyptian God of Messeges. The server acts as a messenger between different optimzation algorithms to fetch details between them.

## Api's needed:

## Need to work on

- image to s3
- proto file merging with other services




- Admin Login
- Get all routes (rider may or maynot exist) (with grouping based on package)
- change rider of a route, can even assign
- Get Route details of a particular route
- Get all package list (with sku_id and awb_id as query param too)
- For a particular package return all its details with all status.
## Day-2


-   Change rider endpoint

-   For a particular route
    -   Return all details of a route



-   route and rider
    {
    latest_status:
    status: []
    }

-   Get all routes

    -   If rider present, return details of rider as well
    -   need no. of points , no of packages with a wrapper to return only the locations..
    -   if rider id is given return for that rider.
-   For a rider Id, all routes date wise sorted
-  done Error Calculation: return error percentage calculation

<!--
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

````go

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
``` -->

```


- awb_id - unique product  , sku_id - item
- length weight height breadth - errorenous

- pickup package: skuid ,
```
