function makeSearch(search_keyword)
{
  console.log("Making search...");
  window.location.href = "https://www.ticketmaster.com/search?q=" + search_keyword + "&radius=10000&dateRange=all&sort=date%2Casc&radius=10000&unit=miles&dateRange=all&tab=events&action=searchStarted";
}


function ProcessEachWindow(currentResultsSearchCounter, allEventsResult, currentHandledSearch, search_finished)
{
    if(currentResultsSearchCounter == allEventsResult.length)
    {
        if(search_finished)
        {
            chrome.storage.local.get(["search_started"], function(result){
                var search_started = result.search_started || false;


                if(search_started)
                {
                    search_started.searchFinished = true;

                    chrome.storage.local.set({"search_started" : search_started}, function(result){
                    });
                }
            });
        }
        else
        {
            makeSearch(currentHandledSearch);
        }

        return true;
    }

    console.log("ALL EVENTS RESULT: ");
    console.log(allEventsResult);
    console.log("CURRENT WINDOW TO HANDLE: " + allEventsResult[currentResultsSearchCounter].href);

    var openedWindow = handleNewWindow(allEventsResult[currentResultsSearchCounter].href);


    var hrefCheckingInterval = setInterval(function(){
        chrome.storage.local.get(['search_started'], function(result){
          var search_started = result.search_started || false;

          console.log("STARTING LOCAL STORAGE LINKS CHECKING...");

          console.log("CURRENT LOCAL STORAGE VALUE:");
          console.log(search_started.eventsResultsArray);


          for(var v = 0; v < search_started.eventsResultsArray.length; v++)
          {
              console.log(search_started.eventsResultsArray[v].href);
              console.log(allEventsResult[currentResultsSearchCounter].href);

              if(search_started.eventsResultsArray[v].href == allEventsResult[currentResultsSearchCounter].href)
              {

                console.log("CHECKING ANOTHER HREF...");
                console.log("CURRENT ANOTHER HREF: ");
                console.log(search_started.eventsResultsArray[v].hrefAnother);

                if(search_started.eventsResultsArray[v].hrefAnother != undefined)
                {
                   console.log("ANOTHER HREF FETCHED...");
                   console.log("CLOSING CURRENT WINDOW...");

                   openedWindow.close();
                   clearInterval(hrefCheckingInterval);
                   return ProcessEachWindow(currentResultsSearchCounter + 1, allEventsResult, currentHandledSearch, search_finished);
                }
              }
          }
        });
    }, 2000);
}

function handleNewWindow(url)
{
    var currentKey = "KEY-" + (Math.floor(Math.random() * 999999) + 1 );
    return window.open(url + "?openedvia=axsSearcher&action=fetchTix", currentKey, "width=200, height=100");
}

function clearLocalStorage()
{
    chrome.storage.local.set({"search_started" : false}, function(){
      console.log("LOCAL STORAGE HAS BEEN CLEARED...");
    }); 
}

//clearLocalStorage();
console.log("STARTING INTERVAL");


if(window.location.href == "https://www.ticketmaster.com/")
{
    console.log("CLEARING LOCAL STORAGE:");
    clearLocalStorage();
}


var lookingInterval = setInterval(function(){
	console.log("Checking search");



  var currentWindowLocation = window.location.href;

  if(currentWindowLocation.indexOf("searchStarted") > 2)
  { 

    //var ticketsMasterLink = document.querySelector("div.c-card__column2 a").getAttribute("href");

    //console.log("CURRENT TICKETS MASTER LINK: " + tixLink);

    /*chrome.storage.local.get(["search_started"], function(result){
      var search_started = result.search_started || false;

      for(var i = 0; i < search_started.eventsResultsArray.length; i++)
      {
          var oldLinkValue = search_started.eventsResultsArray[i].href;

          if(search_started.eventsResultsArray[i].href.indexOf("https") == -1)
          {
             search_started.eventsResultsArray[i].href = search_started.eventsResultsArray[i].href.replace("http" , "https");
          }


          console.log("CURRENT LOCATION: " + currentWindowLocation);
          console.log("CURRENT FOR LOOP LOCATION: " + search_started.eventsResultsArray[i].href);

          console.log(currentWindowLocation.indexOf(search_started.eventsResultsArray[i].href));

          if(currentWindowLocation.indexOf(search_started.eventsResultsArray[i].href) != -1)
          { 
              console.log("PROCESSING SUITABLE LOCATION...");

              search_started.eventsResultsArray[i].hrefAnother = tixLink;
              search_started.eventsResultsArray[i].href = oldLinkValue;



              chrome.storage.local.set({"search_started" : search_started}, function(result){
              });


              break;
          }
      }
    });

    clearInterval(lookingInterval);
    return false;*/
  }



  if(document.readyState != "complete")
  {
      console.log("Document Still not loaded...");
      return false;
  }



	chrome.storage.local.get(["search_started"], function(result){

      console.log("SEARCH STARTED INFO:");
      console.log(result.search_started);

  		if(result.search_started == undefined)
  		{
  			result.search_started = false;
  		}


  		if(result.search_started)
  		{
  			var currentTime = Date.now()/1000;

  			if((currentTime - result.search_started.lastCheckingDate) > 60)
  			{
  				console.log("Clearing Clearing Clearing");
  				result.search_started.eventsResultsArray = [];
  				result.search_started.searchStarted = 0;
  			}

  			if(result.search_started.searchStarted == 1)
  			{
  				var desiredSearches = result.search_started.events_to_search.split(",");

          console.log("DESIRED SEARCHES:");
          console.log(desiredSearches);

  				if(result.search_started.currentHandledSearch == undefined)
  				{
            // IF WE PRESSING SEARCH FIRST TIME SET CURRENT HANDLED SEARCH
  					result.search_started.currentHandledSearch = desiredSearches[0];
  					result.search_started.lastCheckingDate = Date.now()/1000;
  					makeSearch(result.search_started.currentHandledSearch);
  				}
  				else
  				{
  					var nextSearchExists = false;



            // CHECKING WHETHER NEXT SEARCH EXISTS
  					for(var i = 0; i < desiredSearches.length; i++)
  					{
  						if(desiredSearches[i] == result.search_started.currentHandledSearch)
  						{
  							if(desiredSearches[i + 1])
  							{
  								nextSearchExists = true;
  								result.search_started.currentHandledSearch = desiredSearches[i + 1];

                  console.log("NEXT SEARCH EXISTS");

                  console.log("CURRENT DESIRED SEARCH:");
                  console.log(result.search_started.currentHandledSearch);

  								break;
  							}
  						}
  					}


  					//var allEventsResult = [];
  					var currentIterationScroll = 300;

            // IF WE STILL NOT FETCHED ANY EVENTS, SET EMPTY ARRAY
  					if(result.search_started.eventsResultsArray == undefined)
  					{
  						result.search_started.eventsResultsArray = [];
  					}

            var initialMoreSelectorsAmount = undefined;


  					var eventsFetchingInterval = setInterval(function(){
  					
              // GETTING EVENTS HERE
              var eventsSearchResult = document.querySelectorAll('div.srp-swipeable div[scope="All"] div[data-tid="searchResultsListRow"]');


              // IF THERE ARE AT LEAST SOME EVENTS FOUND
  						if(eventsSearchResult.length > 0)
  						{	
  							var totalEventsNeeded = parseInt(document.querySelector('a[data-tid="searchResultsTabs1"] div').innerText.replace("Events (", "").replace(")", "").replace(" ", ""));

  							result.search_started.lastCheckingDate = Date.now()/1000;

                console.log("PRESSING LOAD MORE BUTTONS...");


                setTimeout(function(){
                   // PRESSING LEARN MORE BUTTON
                    var loadMoreButtonSelectors = document.querySelectorAll('button[data-tid="LoadMoreButton"]');


                    if(initialMoreSelectorsAmount == undefined)
                    {
                        initialMoreSelectorsAmount = loadMoreButtonSelectors.length;
                    }

                    console.log("CURRENT MORE BUTTONS SELECTORS:");
                    console.log(loadMoreButtonSelectors);


                    if(initialMoreSelectorsAmount != loadMoreButtonSelectors.length || initialMoreSelectorsAmount == 0)
                    {
                        console.log("Load More button does not exist anymore...");

                        var eventsSearchResult = document.querySelectorAll('div.srp-swipeable div[scope="All"] div[data-tid="searchResultsListRow"]');

                        // LOOP TO ADD NEW EVENTS AND DON"T ADD EVENTS WHICH ALREADY EXISTS

                        var allEventsResult = [];

                        for(var j = 0; j < eventsSearchResult.length; j++)
                        {
                          var fullDate = eventsSearchResult[j].querySelector("div.date--text").innerText;

                          allEventsResult.push({
                            href : eventsSearchResult[j].querySelector('a[role="link"]').getAttribute("href"),
                            title : eventsSearchResult[j].querySelector("div.list-row--title").innerText,
                            description : eventsSearchResult[j].querySelector("div.list-row--subtitle").innerText,
                            date : fullDate
                          });
                        }


                        // SETTING EVENTS RESULTS ARRAY
                        for(var k = 0; k < allEventsResult.length; k++)
                        {
                          result.search_started.eventsResultsArray.push(allEventsResult[k]);
                        }

                        console.log("CURRENT EVENTS RESULTS ARRAY FOR ALL EVENTS:");
                        console.log(result.search_started.eventsResultsArray);

                        result.search_started.lastCheckingDate = Date.now()/1000;

                        if(!nextSearchExists)
                        {
                          var searchFinishedValue = true;
                        }
                        else
                        {
                          var searchFinishedValue = false;
                        }

                        var previousHandledSearchDump = result.search_started.currentHandledSearch;
                        var previousResultDump = result.search_started.eventsResultsArray;

                        chrome.storage.local.set({ search_started : result.search_started }, function(){
                        }); 


                        // IF THERE ARE NO NEXT SEARCH
                        if(!nextSearchExists)
                        {
                          console.log("NEXT SEARCH DOES NOT EXISTS");
                          result.search_started.searchStarted = 0;
                          result.search_started.nextSearchDoesNotExists = true;
                          alert("FETCHING FINISHED...");
                    
                          console.log("SAVING result.search_started VALUES:");
                          chrome.storage.local.set({ search_started : result.search_started }, function(){
                          });

                        }
                        else
                        {
                          makeSearch(result.search_started.currentHandledSearch);
                        }


                        clearInterval(eventsFetchingInterval);
                        return;
                  }
                  else
                  {
                      for(var i = 0; i < loadMoreButtonSelectors.length; i++)
                      {
                        loadMoreButtonSelectors[i].click();
                      }
                  }


                }, 3000);

               
  						}
  					}, 5000);

            // EVENTS FETCHING INTERVAL END

  				}

          console.log("SAVING result.search_started VALUES:");
  				chrome.storage.local.set({ search_started : result.search_started }, function(){
  				});

  				clearInterval(lookingInterval);
  			}

        clearInterval(lookingInterval);
  		}

  		chrome.storage.local.set({ search_started : result.search_started }, function(){
  		});	
  });
}, 1000);


function filterUrls(callback)
{

}
