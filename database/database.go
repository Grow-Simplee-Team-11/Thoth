package database

var (
	Db Database
)

func SetupDb() error {
	Db, _ = Factory("redis")
	return nil
}
