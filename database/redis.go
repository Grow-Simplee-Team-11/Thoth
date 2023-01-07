package database

import (
	"context"
	"time"

	"github.com/go-redis/redis/v9"
)

type redisDatabase struct {
	client *redis.Client
}

func createRedisDatabase() (Database, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       1,
	})
	_, err := client.Ping(context.Background()).Result()
	if err != nil {
		return nil, &CreateDatabaseError{}
	}
	return &redisDatabase{client: client}, nil
}

func (r *redisDatabase) Set(key string, value string) (string, error) {
	_, err := r.client.Set(context.Background(), key, value, time.Hour).Result()
	if err != nil {
		return generateError("set", err)
	}
	return key, nil
}

func (r *redisDatabase) GeoAdd(key string, latitude float64, longitude float64) (int64, error) {
	num, err := r.client.GeoAdd(context.Background(), "point1", &redis.GeoLocation{Latitude: float64(latitude), Longitude: float64(longitude), Name: key}).Result()
	if err != nil {
		return 0, err
	}
	return num, nil
}

func (r *redisDatabase) GeoSearch(key string, latitude float64, longitude float64) ([]redis.GeoLocation, error) {
	response, err := r.client.GeoSearchLocation(context.Background(), "point1", &redis.GeoSearchLocationQuery{GeoSearchQuery: redis.GeoSearchQuery{Latitude: latitude, Longitude: longitude, Radius: 50, Sort: "ASC"}, WithCoord: true}).Result()
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (r *redisDatabase) Get(key string) (string, error) {
	value, err := r.client.Get(context.Background(), key).Result()
	if err != nil {
		return generateError("get", err)
	}
	return value, nil
}

func (r *redisDatabase) Delete(key string) (string, error) {
	_, err := r.client.Del(context.Background(), key).Result()
	if err != nil {
		return generateError("delete", err)
	}
	return key, nil
}

func generateError(operation string, err error) (string, error) {
	if err == redis.Nil {
		return "", &OperationError{operation}
	}
	return "", &DownError{}
}
