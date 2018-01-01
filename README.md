![image](https://github.com/nextseto/ytn-cloud/blob/master/assets/header-ytn-cloud.png)

**ytn-cloud** is a nodeJS backend to access and parse youtube video metadata. This works well with the iOS front-end called Players (ytn-iOS repository)

## Purpose

#### Introduction

I love watching videos in my spare time. Whether its watching TV shows on my TiVo or online via Youtube. When I first got my iPod Touch in 2009, I religiously used the built in Youtube app. And when Apple deprecated it in iOS 6, I tried to find alternatives like McTube or Tubex. They worked for a while, but as time went on these apps got bloated and I eventually got frustrated. I spent more time closing the built in popup apps and "Rate me!" dialogues than actually enjoying the purpose of the app, watching my favorite youtube channels.

I was just so fed up with other apps that I took it to myself to make something to satisfy my hunger of watching great content on Youtube.

#### Development Requirements
I made a list of things I wanted in the application:

##### Front-End: iOS Application called "Players"
- Swift 1 ~ 2: The latest language for quickly building the app with

- UICollectionView: This type of view paradigm is ideal to show the metadata for a given video

- iPhone / iPad Support: Be able to support all iOS devices. Must support most screen sizes

- Easily interface to the backend: Simple GET requests to a backend for communication


##### Back-End: nodeJS web application and REST service called "ytn-cloud"
- nodeJS: A simple lightweight server environment to quickly get up and running

- Express: To build some webpages and the REST API part of the service

- async: Performance win using Async.each(...)

- timsort: Performance win using a battle-tested fast sorting algorithm

- node-ytdl: An abstraction over Youtube to access metadata for YouTube information


#### Roadmap
Now, I wrote this a year ago and I've been slowly working on it to improve its performance and reliability on both the front/back-end side. With the front-end, I had to update the source to conform to the changes to the Swift language. With the back-end, I had to try different package and javascript techniques to shave milliseconds off the processing/response time.

#### :)
It's been a long road, but 1.x is finally done. I'm proud of what is currently on GitHub.

Thank you to everyone who has helped me and this project along the way. (Friends, family, reddit testers!!)

## Setup

##### Option 1: Local Server

Download the source and in the source folder type the following in the terminal:

```
node CORE.js
```

##### Option 2: Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Note

This branch of ytn-cloud (v1.2) will work with v1.1 and v1.2 iOS application. **There are no guarantees that future front ends will be backwards compatiable with this version of the backend.**

## License

All source code in ytn-cloud is released under the MIT license. See LICENSE for details.