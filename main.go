package main

import (
	"html/template"
	"log"
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
	coll := session.DB(os.Getenv("URLS_DB")).C("entities")

	repo := NewRepository(DefaultGenerator, coll)
	tmpl := iris.HTML("./templates", ".html").Reload(true)

	tmpl.AddFunc("IsPositive", func(n int) bool {
		if n > 0 {
			return true
		}

		return false
	})

	app.RegisterView(tmpl)
	app.StaticWeb("/static", "./resources")

	indexHandler := func(ctx context.Context) {
		ctx.ViewData("URL_COUNT", 100)
		ctx.View("index.html")
	}

	app.Get("/", indexHandler)

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

	app.Get("/u/{shortkey}", func(ctx context.Context) {
		execShortURL(ctx, ctx.Params().Get("shortkey"))
	})

	app.Post("/shorten", func(ctx context.Context) {
		formValue := ctx.FormValue("url")
		if formValue == "" {
			ctx.ViewData("FORM_RESULT", "You need to a enter a URL")
			ctx.StatusCode(iris.StatusLengthRequired)
		} else {
			data, err := repo.New(formValue)

			if err != nil {
				ctx.ViewData("FORM_RESULT", "Invalid URL")
				ctx.StatusCode(iris.StatusBadRequest)
			} else {
				ctx.StatusCode(iris.StatusOK)
				shortenURL := "http://" + app.ConfigurationReadOnly().GetVHost() + "/u/" + data.Key
				ctx.ViewData("FORM_RESULT", template.HTML("<pre><a target='_new' href='"+shortenURL+"'>"+shortenURL+" </a></pre>"))
			}
		}

		indexHandler(ctx)
	})

	return app
}
