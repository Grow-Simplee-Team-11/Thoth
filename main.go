package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/Grow-Simplee-KGP/Thoth/client"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	dynamicRoutingClient client.DynamicRoutingClient
)

func DynamicRegister(router *gin.RouterGroup) {
	router.POST("/pickup", AddPickupPoint)
}

func AddPickupPoint(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c, time.Second)
	defer cancel()

	var pickup client.Pickup
	err := c.BindJSON(&pickup)
	if err != nil {
		response(c, nil, err)
		return
	}

	value, err := dynamicRoutingClient.RunDynamic(&ctx, pickup)
	fmt.Println(value)
	response(c, nil, err)
}

func response(c *gin.Context, data interface{}, err error) {
	statusCode := http.StatusOK
	var errorMessage string
	if err != nil {
		log.Println("Server Error Occured:", err)
		errorMessage = strings.Title(err.Error())
		statusCode = http.StatusInternalServerError
	}
	c.JSON(statusCode, gin.H{"data": data, "error": errorMessage})
}

func main() {
	log.Println("Thoth running")

	r := gin.Default()
	r.Use(cors.Default())

	api := r.Group("/api")
	DynamicRegister(api.Group("/dynamic"))

	r.Run()
	// client.StartClient()
	// db, err := database.Factory("redis")
	// if err != nil {
	// 	panic(err)
	// }

	// db.Set("hello", "meow")
	// value, _ := db.Get("school:1")
	// log.Println(value)

	// db.GeoAdd("point2", 42.129085, -88.027485)
	// db.GeoAdd("point3", 42.179085, -88.077485)
	// db.GeoAdd("point4", 42.133454, -88.043144)
	// db.GeoAdd("point5", 42.183454, -88.093144)
	// db.GeoAdd("point6", 42.129422, -88.037895)

	// cat, _ := db.GeoSearch("point1", 42.179422, -88.087895)
	// fmt.Println(cat)

}
