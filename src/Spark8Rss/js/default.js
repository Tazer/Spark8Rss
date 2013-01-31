// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var articlesList;
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            var articlelistElement = document.getElementById("articlelist");
            //articlelistElement.addEventListener("iteminvoked", itemInvoked);
            submitFeedUrl.addEventListener("click", rssReader.handleSubmittedUrl);

            articlesList = new WinJS.Binding.List();
            var publicMembers = { ItemList: articlesList };
            WinJS.Namespace.define("Spark8Rss", publicMembers);


            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.start();
    

    var rssReader = function () {
        var pub = {};
        var priv = {};
        var feedUrl = "";
        pub.init = function (url) {
            feedUrl = url;
            priv.downloadGitHubFeed();
        };
        pub.handleSubmittedUrl = function (e) {
            pub.init(document.getElementById("txtFeedUrl").value);
        };
        priv.downloadGitHubFeed = function () {
            WinJS.xhr({ url: feedUrl }).then(function (rss) {
                articlesList.splice(0, articlesList.length);
                var items = rss.responseXML.querySelectorAll("entry");
                for (var n = 0; n < items.length; n++) {
                    var article = {};
                    article.title = items[n].querySelector("title").textContent;
                    var thumbs = items[n].querySelectorAll("thumbnail");
                    if (thumbs.length > 1) {
                        article.thumbnail = thumbs[1].attributes.getNamedItem("url").textContent;
                        article.content = items[n].textContent;

                    }
                    articlesList.push(article);
                }
            });

            setTimeout(function () {
                priv.downloadGitHubFeed();
            }, 6000);
        };
        return pub;
    }();
})();



