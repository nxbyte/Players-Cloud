![image](https://github.com/nextseto/ytn-cloud/blob/master/assets/banner.png)

**Players-Cloud** is a nodeJS backend to access and parse youtube video metadata. This works well with the iOS front-end called Players-iOS

## Purpose

#### Introduction

I love watching videos in my spare time. Whether its watching TV shows on my TiVo or online via Youtube/Twitch. When I first got my iPod Touch in 2009, I religiously used the built in Youtube app to watch Gaming Let's Plays and other content. When Apple removed the Youtube app in iOS 6, I tried to find alternatives, however, as time went on these apps got bloated and I eventually got frustrated. I spent more time closing the built in popup ads and "Rate me!" dialogues than actually enjoying the purpose of the app, watching my favorite youtube channels.

I was just so fed up with other apps that I took it to myself to make something to satisfy my hunger of watching great content on Youtube.

#### Development Requirements

I made a list of things I wanted in this REST API:

- nodeJS: A simple lightweight server environment to quickly get up and running

- express: To build some webpages and the REST API part of the service

- async: Performance win using Async.each(...)

- timsort: Performance win using a battle-tested fast sorting algorithm

- node-ytdl: An abstraction over Youtube to access metadata for YouTube information

#### Roadmap

I initally I wrote this in 2014 and I've been slowly working on it to improve its performance and reliability on both the front/back-end side. With the front-end, I had to update the source to conform to the changes to the Swift language. With the back-end, I had to try different package and javascript techniques to shave milliseconds off the processing/response time.

I then updated the REST API to use default REST API conventions and be able to support JSON responses.

## Setup

##### Option 1: Local Server

Download the source and in the source folder type the following in the terminal:

```
YOUTUBE_API_KEY=<Insert Youtube API Key Here> node CORE.js
```

##### Option 2: Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Note

REST APIs in Version 2 will not work with v1.x iOS application.

## License

All source code in Players-Cloud is released under the MIT license. See LICENSE for details.