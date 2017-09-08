package main

import (
	"crypto/sha256"
	"encoding/base64"
	"net/url"
	"time"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type Generator func() string

var DefaultGenerator = func() string {
	hasher := sha256.New()
	return base64.URLEncoding.EncodeToString(hasher.Sum(nil))[0:9]
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

// New method
// params: Entity struct
// result: error
func (r *Repository) New(uri string) (data Entity, err error) {
	key := r.Generator()
	_, err = url.ParseRequestURI(uri)

	if err != nil {
		return data, err
	}

	for {
		obj, _ := r.FindByKey(key)

		if (obj == Entity{}) {
			break
		} else {
			key = r.Generator()
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
