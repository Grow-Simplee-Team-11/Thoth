package main

import (
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
	value, _ := db.Get("hello")
	log.Println(value)
}
