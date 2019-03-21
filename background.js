function clearLocalStorage()
{
    chrome.storage.local.set({"search_started" : false}, function(){
      console.log("LOCAL STORAGE HAS BEEN CLEARED...");
    }); 
}

setInterval(function(){

chrome.storage.local.get(["search_started"], function(result){

	if(result.search_started.searchFinished == "undefined")
	{
		result.search_started.searchFinished = false;
	}

	console.log("SEARCH STARTED INFO:");
	console.log(result.search_started);

	if(result.search_started == false)
	{
		console.log("Search still not finished");
		return;
	}

	if(result.search_started.searchFinished == false)
	{
		console.log("Search still not finished");
		return;
	}


	if(!result.search_started.nextSearchDoesNotExists)
	{
		console.log("Search still not finished");
		return;
	}


	console.log("SEARCH FINISHED..");


	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://cars.dmitriybuteiko.com/chrome_search_generate_exel_2.php", true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	var testArray = {
		data : result.search_started.eventsResultsArray
	};


	console.log("SENDING RESULT ARRAY TO THE SERVER...");
	xhr.send(JSON.stringify(testArray));


	xhr.onload = function() {
  		console.log("GENERATION RESPONSE:")
  		console.log(this.responseText);
	}

	clearLocalStorage();
});

},500);
