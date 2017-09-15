package main

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"golang.org/x/net/html"
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
	Key         string    `json:"key"`
	URI         string    `json:"url"`
	OriginalURL string    `json:"original_url"`
	Visitors    int       `json:"visitors"`
	Timestamp   time.Time `json:"timestamp"`
	Title       string    `json:"title"`
}

type EntityRepository struct {
	Collection *mgo.Collection
	Generator  Generator
}

func NewEntityRepository(generator Generator, collection *mgo.Collection) *EntityRepository {
	return &EntityRepository{
		Collection: collection,
		Generator:  generator,
	}
}

// New method
// params: uri string
// result: Entiry, error
func (r *EntityRepository) New(uri string) (data Entity, err error) {
	key := r.Generator(uri)

	for {
		obj, _ := r.FindByKey(key)

		if (obj == Entity{}) {
			break
		} else {
			key = r.Generator(uri)
		}
	}

	data.OriginalURL = uri
	data.Title = GetURLTitle(uri)
	data.Key = key
	data.URI = os.Getenv("LNK_HOST") + key
	data.Visitors = 0
	data.Timestamp = time.Now()

	err = r.Collection.Insert(data)

	if err != nil {
		return data, err
	}

	return data, nil
}

func GetURLTitle(url string) string {
	resp, err := http.Get(url)

	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	if title, ok := GetHtmlTitle(resp.Body); ok {
		return title
	} else {
		return url
	}
}

func isTitleElement(n *html.Node) bool {
	return n.Type == html.ElementNode && n.Data == "title"
}

func traverse(n *html.Node) (string, bool) {
	if isTitleElement(n) {
		return n.FirstChild.Data, true
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		result, ok := traverse(c)
		if ok {
			return result, ok
		}
	}

	return "", false
}

func GetHtmlTitle(r io.Reader) (string, bool) {
	doc, err := html.Parse(r)
	if err != nil {
		panic("Fail to parse html")
	}

	return traverse(doc)
}

func (r *EntityRepository) UpdateTitle(key string, title string) (data Entity, err error) {
	r.Collection.Update(bson.M{"key": key}, bson.M{"$set": bson.M{"title": title}})

	r.Collection.Find(bson.M{"key": key}).One(&data)

	return data, err
}

// FindByKey method
// params: key string
// result: Entity{} struct, error
func (r *EntityRepository) FindByKey(key string) (Entity, error) {
	data := Entity{}
	err := r.Collection.Find(bson.M{"key": key}).One(&data)

	return data, err
}

func (r *EntityRepository) FindByLink(uri string) (data Entity, err error) {
	err = r.Collection.Find(bson.M{"uri": uri}).One(&data)
	fmt.Println(uri)
	return data, err
}
