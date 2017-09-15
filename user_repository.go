package main

import (
	"time"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type User struct {
	Email          string    `json:"email"`
	Name           string    `json:"name"`
	Timestamp      time.Time `json:"timestamp"`
	ImageURL       string    `json:"image_url"`
	SocialID       string    `json:"social_id"`
	SocialProvider string    `json:"social_provider"`
}

type UserRepository struct {
	Collection *mgo.Collection
}

func NewUserRepository(collection *mgo.Collection) *UserRepository {
	return &UserRepository{
		Collection: collection,
	}
}

func (r *UserRepository) New(obj User) (data User, err error) {
	obj.Timestamp = time.Now()

	err = r.Collection.Insert(obj)

	if err != nil {
		return data, err
	}

	return obj, nil
}

func (r *UserRepository) FindBySocID(id string) (data User, err error) {
	err = r.Collection.Find(bson.M{"socialid": id}).One(&data)

	return data, err
}
