package main

import (
	"fmt"
	"log"

	"github.com/Grow-Simplee-KGP/Thoth/client"
	"github.com/Grow-Simplee-KGP/Thoth/database"
)

func main() {
	client.StartClient()
	db, err := database.Factory("redis")
	if err != nil {
		panic(err)
	}

	db.Set("hello", "meow")
	value, _ := db.Get("school:1")
	log.Println(value)

	db.GeoAdd("point2", 42.129085, -88.027485)
	db.GeoAdd("point3", 42.179085, -88.077485)
	db.GeoAdd("point4", 42.133454, -88.043144)
	db.GeoAdd("point5", 42.183454, -88.093144)
	db.GeoAdd("point6", 42.129422, -88.037895)

	cat, _ := db.GeoSearch("point1", 42.179422, -88.087895)
	fmt.Println(cat)

}
