# Thoth

Why this name: The Egyptian God of Messeges. The server acts as a messenger between different optimzation algorithms to fetch details between them.

## Installing / Getting started

A quick introduction of the minimal setup you need to get the development environment setup

```shell
yarn 
yarn dev
```

## API reference

`baseurl`: http://127.0.0.1:3000/v1

### Login

#### Admin Login

Endpoint for admin login

```shell
POST /auth/admin
```

<details>
<summary>Request Body</summary>
{
    "email":"yo@admin.com",
    "password":"Admin098"
}
</details>

<details>
<summary>Response</summary>
{
    "message": "Logged in"
}
</details>

#### Rider Login

Endpoint for rider login

```shell
POST /auth/rider
```

<details>
<summary>Request Body</summary>
{
    "email":"Clair11@gmail.com",
    "password":"Rider098"
}
</details>

<details>
<summary>Response</summary>
{
    "message": "Login Success",
    "rider": {
        "_id": "63d1295758fa89399775d87d",
        "name": "Merle Rogahn",
        "phone": "+919279512912",
        "email": "Clair11@gmail.com",
        "createdAt": "2023-01-25T13:06:31.418Z",
        "updatedAt": "2023-01-25T13:06:31.418Z",
        "__v": 0
    }
}
</details>

### Rider

#### Get All Riders

Endpoint for getting list of all riders

```shell
GET /rider/all
```

<details>
<summary>Response</summary>
{
    "message": "Riders",
    "riders": [
        {
            "_id": "63d1295758fa89399775d87d",
            "name": "Merle Rogahn",
            "phone": "+919279512912",
            "email": "Clair11@gmail.com",
            "createdAt": "2023-01-25T13:06:31.418Z",
            "updatedAt": "2023-01-25T13:06:31.418Z",
            "__v": 0,
            "assigned": true
        }
    ]
</details>

#### Add Rider

Endpoint for adding a new rider to the database

```shell
POST /rider/add
Content-Type: application/json

{
    "name": "Merle Rogahn",
    "phone": "+919279512912",
    "email": "Clair11@gmail.com"
}
```

#### Get Rider Location

Endpoint for getting rider's last known location (locations are being stored in redis geohashes)

```shell
GET /rider/location?rider_id=63c717fee9c8bd67b877e46f
```

Returns all rider locations if no rider_id is found in query

```shell
GET /rider/location
```

#### Set Rider Location

Endpoint for setting rider's location (pass scaled coordinates)

```shell
POST /rider/location
Content-Type: application/json

{
    "rider_id": "63c717fee9c8bd67b877e46f",
    "value" : {
        "coordinates": {
            "latitude": 12907009,
            "longitude": 77585678
        }
    }
}
```

### Package

#### Get Package Details

Endpoint for getting package details from package_id

```shell
GET /package/details?package_id=63d1285d70bb48a2ca4ec16b
```

#### Get Package List

Endpoint for getting package list

```shell
GET /package/list
```

#### Add Delivery Package

Endpoint for adding a delivery package

```shell
POST /package/delivery
Content-Type: application/json

{
    "awb_id": "DEF",
    "sku_id": "SKU_1",
    "deliver_to": {
        "name": "PQR",
        "phone_number": "9876543210"
    },
    "address": "1260, SY 35/4, SJR Tower's, 7th Phase, 24th Main, Puttanhalli, JP Nagar, Bangalore",
    "dimensions": {
        "length": 4,
        "breadth": 4,
        "height": 4,
        "weight": 3
    },
    "type":"DELIVERY"
}
```


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
