package database

import "github.com/go-redis/redis/v9"

type Database interface {
	Set(key string, value string) (string, error)
	Get(key string) (string, error)
	Delete(key string) (string, error)
	GeoAdd(key string, latitude float64, longitiude float64) (int64, error)
	GeoSearch(key string, latitude float64, longitude float64) ([]redis.GeoLocation, error)
}

func Factory(databaseName string) (Database, error) {
	switch databaseName {
	case "redis":
		return createRedisDatabase()
	default:
		return nil, &NotImplementedDatabaseError{databaseName}
	}
}
