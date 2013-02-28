// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var articlesList;
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;
    var isSuspended = false;
    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
                isSuspended = false;
            }

            var articlelistElement = document.getElementById("articlelist");
            articlelistElement.addEventListener("iteminvoked", rssReader.itemClicked);
            submitFeedUrl.addEventListener("click", rssReader.handleSubmittedUrl);

            articlesList = new WinJS.Binding.List();
            var publicMembers = { ItemList: articlesList };
            WinJS.Namespace.define("Spark8Rss", publicMembers);

            //$("a").on("click", function (e) {
            //    e.preventDefault();
            //    var uri = new Windows.Foundation.Uri(this.attr("href"));
            //    Windows.System.Launcher.launchUriAsync(uri);
            //});

            args.setPromise(WinJS.UI.processAll().then(rssReader.init()));
        }
    };

    app.oncheckpoint = function (args) {
        isSuspended = true;
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
        var feedUrl;
        var lastUpdated;
        pub.init = function () {
            

            var feedTxtBox = document.getElementById("txtFeedUrl").value;

            if (feedTxtBox == "")
                feedUrl = localSettings.values["feedUrl"];
            else {
                feedUrl = feedTxtBox;
            }

            if (feedUrl != undefined) {
                localSettings.values["feedUrl"] = feedUrl;
                priv.downloadGitHubFeed();
            }
        };
        pub.handleSubmittedUrl = function (e) {
            pub.init();
        };
        pub.itemClicked = function (eventObject) {
            var item = articlesList.getAt(eventObject.detail.itemIndex);
            var uri = new Windows.Foundation.Uri(item.url);
            Windows.System.Launcher.launchUriAsync(uri);
        };
        priv.downloadGitHubFeed = function () {
            WinJS.xhr({ url: feedUrl }).then(function (rss) {
                var updated = rss.responseXML.querySelector("updated").textContent;
                if (lastUpdated == updated)
                    return;

                lastUpdated = updated;
                articlesList.splice(0, articlesList.length);
                var items = rss.responseXML.querySelectorAll("entry");
                for (var n = 0; n < items.length; n++) {
                    var article = {};
                    var item = items[n];
                    article.title = item.querySelector("title").textContent;
                    article.date = item.querySelector("published").textContent;
                    //article.content = item.querySelector("content").textContent;
                    article.url = item.querySelector("link").attributes["href"].value;
                    articlesList.push(article);
                }

            });

            if (isSuspended)
                return;

            setTimeout(function () {
                priv.downloadGitHubFeed();
            }, 60000);
        };
        return pub;
    }();
})();



