package main

import (
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/kataras/iris"
	"github.com/kataras/iris/context"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func main() {
	session, err := mgo.Dial(os.Getenv("URLS_MONGO"))

	if err != nil {
		log.Fatal(err)
	}

	defer session.Close()
	session.SetMode(mgo.Monotonic, true)

	app := newApp(session)
	app.Run(iris.Addr(":8080"))
}

func newApp(session *mgo.Session) *iris.Application {
	app := iris.Default()
	coll := session.DB(os.Getenv("URLS_DB")).C("entities")

	repo := NewRepository(DefaultGenerator, coll)

	execShortURL := func(ctx context.Context, key string) {
		if key == "" {
			ctx.StatusCode(iris.StatusBadRequest)
			return
		}

		obj, _ := repo.FindByKey(key)

		if (obj == Entity{}) {
			ctx.StatusCode(iris.StatusNotFound)
			ctx.Writef("Short URL for key: '%s' not found", key)
			return
		}

		// update visitors counter
		obj.Visitors++
		_ = repo.Collection.Update(bson.M{"key": key}, obj)

		ctx.Redirect(obj.URI, iris.StatusTemporaryRedirect)
	}

	app.StaticWeb("/site", "./client/public")
	app.RegisterView(iris.HTML("./client/public", ".html"))

	app.Get("/", func(ctx context.Context) {
		ctx.View("index.html")
	})

	app.Post("/shorten", func(ctx context.Context) {
		value := &struct {
			URL       string `json:"url"`
			CustonKey string `json:"custom_key"`
		}{}

		err := ctx.ReadJSON(&value)

		if err != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			return
		}

		_, err = url.ParseRequestURI(value.URL)

		if err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(map[string]string{"status": "error", "url": "Invalid URL"})
		} else {
			data := Entity{}

			if value.CustonKey != "" {
				if len(strings.Split(value.CustonKey, " ")) != 1 {
					ctx.StatusCode(iris.StatusBadRequest)
					ctx.JSON(map[string]string{"status": "error", "custom_key": "Custom URL is invalid"})
					return
				}

				obj, _ := repo.FindByKey(value.CustonKey)

				if (obj == Entity{}) {
					data, err = repo.NewWithCustomKey(value.URL, value.CustonKey)
				} else {
					ctx.StatusCode(iris.StatusBadRequest)
					ctx.JSON(map[string]string{"status": "error", "custom_key": "This key already used"})
					return
				}

			} else {
				data, err = repo.New(value.URL)
			}

			if err != nil {
				ctx.StatusCode(iris.StatusInternalServerError)
			} else {
				ctx.StatusCode(iris.StatusOK)
				shortenURL := "http://" + app.ConfigurationReadOnly().GetVHost() + "/" + data.Key

				ctx.JSON(map[string]string{
					"url":          shortenURL,
					"original_url": data.URI,
					"visitors":     strconv.Itoa(data.Visitors),
					"timestamp":    data.Timestamp.Format("Jan _2 15:04"),
					"title":        data.URI,
				})
			}
		}
	})

	app.Get("/{shortkey}", func(ctx context.Context) {
		execShortURL(ctx, ctx.Params().Get("shortkey"))
	})

	return app
}
