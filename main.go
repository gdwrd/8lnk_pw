package main

import (
	"log"
	"net/url"
	"os"

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

	db := session.DB(os.Getenv("URLS_DB"))
	coll := db.C("entities")
	repo := NewEntityRepository(DefaultGenerator, coll)

	u_coll := db.C("users")
	u_repo := NewUserRepository(u_coll)

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

		ctx.Redirect(obj.OriginalURL, iris.StatusTemporaryRedirect)
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

			data, err = repo.New(value.URL)

			if err != nil {
				ctx.StatusCode(iris.StatusInternalServerError)
			} else {
				ctx.StatusCode(iris.StatusOK)
				// shortenURL := "http://" + app.ConfigurationReadOnly().GetVHost() + "/" + data.Key

				ctx.JSON(data)
			}
		}
	})

	app.Get("/{shortkey}", func(ctx context.Context) {
		execShortURL(ctx, ctx.Params().Get("shortkey"))
	})

	app.Get("/k/{shortkey}", func(ctx context.Context) {
		key := ctx.Params().Get("shortkey")

		data, err := repo.FindByKey(key)

		if err != nil {
			ctx.JSON(map[string]string{"status": "error", "key": "key is invalid"})
			return
		}

		ctx.JSON(data)
	})

	app.Post("/user_login", func(ctx context.Context) {
		obj := User{}
		err := ctx.ReadJSON(&obj)

		if err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			ctx.JSON(map[string]string{"status": "error", "body": "invalid body"})
			return
		}

		user, err := u_repo.FindBySocID(obj.SocialID)

		if (user == User{}) {
			user, err = u_repo.New(obj)

			if err != nil {
				ctx.StatusCode(iris.StatusBadRequest)
				ctx.JSON(map[string]string{"status": "error", "user": "user is invalid"})
				return
			}
		}

		ctx.JSON(user)
	})

	app.Post("/links_data", func(ctx context.Context) {
		obj := &struct {
			Links []string `json:"links"`
		}{}

		err := ctx.ReadJSON(&obj)

		if err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			return
		}

		data := []Entity{}

		for _, item := range obj.Links {
			entity, err := repo.FindByLink(item)

			if err == nil {
				data = append(data, entity)
			}
		}

		ctx.JSON(data)
	})

	app.Patch("/u_title", func(ctx context.Context) {
		obj := &struct {
			Key   string `json:"key"`
			Title string `json:"title"`
		}{}

		err := ctx.ReadJSON(&obj)

		if err != nil {
			ctx.StatusCode(iris.StatusBadRequest)
			return
		}

		data, _ := repo.UpdateTitle(obj.Key, obj.Title)

		ctx.JSON(data)
	})

	return app
}
