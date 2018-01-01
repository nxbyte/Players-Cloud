//: # REST API Guide for Cloud Server
//: ## Test between the Players iOS client with the Players_Cloud server

import UIKit
import PlaygroundSupport

// Playground Setup : Run all async functions
PlaygroundPage.current.needsIndefiniteExecution = true

// Playground Setup : After 5 seconds, stop testing
DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
    PlaygroundPage.current.finishExecution()
}


//: Test 1: Check if the server can get all the details for a given youtube video ID

Cloud.get(video: "cWQ3NXh5tUE", withQuality: "sd", entry: { (entry) in
    if let validEntry = entry {
        print(validEntry)
    }
})


//: Test 2: Check if the server can get some details for a given youtube video ID

Cloud.get(video: "cWQ3NXh5tUE", withQuality: "sd", details: { (details) in
    if let validDetails = details {
        print(validDetails)
    }
})


//: Test 3: Check if the server can retrieve the most recent videos for a given array of channel IDs

Cloud.get(subscriptions: ["UCddiUEpeqJcYeBxX1IVBKvQ","UC3XTzVzaHQEd30rQbuvCtTQ", "UCX6b17PVsYBQ0ip5gyeme-Q"]) { (results) in
    if !results.isEmpty {
        print(results)
    }
}


//: Test 4: Check if the server can retrieve the most recent videos for a given channel ID

Cloud.get(channel: "UCddiUEpeqJcYeBxX1IVBKvQ") { (details) in
    if let validDetails = details {
        print(validDetails)
    }
}

 
//: Test 5: Check if the server can retrieve the a list of videos for a given query

var query = SearchQuery()
    query.query = "cinemasins"

Cloud.get(search: query) { (results) in
    if let validResults = results {
        print(validResults)
    }
}


//: Test 6: Check if the server can retrieve the a list of videos for a given query and filter option

query.option = "order%3Ddate"

Cloud.get(search: query) { (results) in
    if let validResults = results {
        print(validResults)
    }
}


//: Test 7: Check if the server can get channel metadata for a given channel ID

Cloud.get(channel: "UCddiUEpeqJcYeBxX1IVBKvQ") { (details) in
    if let validDetails = details {
        print(validDetails)
    }
}
