package main

import (
	"crypto/sha256"
	"encoding/base64"
	"time"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type Generator func(bv string) string

var DefaultGenerator = func(bv string) string {
	hasher := sha256.New()
	hasher.Write([]byte(bv))
	hasher.Write([]byte(time.Now().String()))
	return base64.URLEncoding.EncodeToString(hasher.Sum(nil))[0:7]
}

type Entity struct {
	Key       string
	URI       string
	Visitors  int
	Timestamp time.Time
}

type Repository struct {
	Collection *mgo.Collection
	Generator  Generator
}

func NewRepository(generator Generator, collection *mgo.Collection) *Repository {
	return &Repository{
		Collection: collection,
		Generator:  generator,
	}
}

// NewWithCustomKey mmethod
// params: uri string, key string
// response: Entity, error
func (r *Repository) NewWithCustomKey(uri string, key string) (data Entity, err error) {
	data.URI = uri
	data.Key = key
	data.Visitors = 0
	data.Timestamp = time.Now()

	err = r.Collection.Insert(data)

	if err != nil {
		return data, err
	}

	return data, nil
}

// New method
// params: uri string
// result: Entiry, error
func (r *Repository) New(uri string) (data Entity, err error) {
	key := r.Generator(uri)

	for {
		obj, _ := r.FindByKey(key)

		if (obj == Entity{}) {
			break
		} else {
			key = r.Generator(uri)
		}
	}

	data.URI = uri
	data.Key = key
	data.Visitors = 0
	data.Timestamp = time.Now()

	err = r.Collection.Insert(data)

	if err != nil {
		return data, err
	}

	return data, nil
}

// FindByKey method
// params: key string
// result: Entity{} struct, error
func (r *Repository) FindByKey(key string) (Entity, error) {
	data := Entity{}
	err := r.Collection.Find(bson.M{"key": key}).One(&data)

	return data, err
}
