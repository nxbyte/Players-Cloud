//  Warren Seto
//  CORE.js
//  A backend for accessing data from the red and white play button

"use strict"

/** Initializing libraries needed for running */

/* Setup Server Rules */
var server = require('express')()
server.use(require('compression')())
server.set('view engine', 'ejs')
server.set('views', __dirname + '/html')

/* Setup HTTP client */
var https = require('https')
https.globalAgent.maxSockets = Infinity

/* Setup Async */
var async = require('async')

/* Setup Sorting System */
var TimSort = require('timsort');

/* Google Youtube API Key. Recommended: Register with Google for a unique key */
const APIKEY = "INSERT API KEY HERE" 

/* Setup Youtube Internal Engine */
var ytdl = require('ytdl-core')

/** REST APIs */

/* Returns a String of recent videos from an array of Channel IDs */
server.get('/now', function(input, output)
{
    input = input.query
    
    if (!input.c)
        return output.sendStatus(404)

    input = input.c.split(",")
    let feed = []

    async.each(input, function(e, cb)
    {
        download("https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + e + "&order=date&type=video&maxResults=15&key=" + APIKEY, function(data1) 
        {
            if (data1)
            {
                data1 = JSON.parse(data1).items
                
                let size = data1.length
                while (size--)
                {
                    feed.push
                    ({    
                           "time":data1[size].snippet.publishedAt,
                          "title":data1[size].snippet.title, 
                      "thumbnail":data1[size].snippet.thumbnails.medium.url, 
                        "videoID":data1[size].id.videoId,
                    "channelName":data1[size].snippet.channelTitle, 
                      "channelId":data1[size].snippet.channelId
                    })
                }
            }
                cb()
        })
    }, 
    function(r)
    {
        TimSort.sort(feed, nowSort)
        
        let size = feed.length
                
        if (size > 30)
            size = 30
                
        feed = feed.slice(-1 * size)
                
        size--
                
        let vids = feed[size].videoID  
        while (size--) { vids += "," + feed[size].videoID }
        
        download("https://www.googleapis.com/youtube/v3/videos?id=" + vids + "&key=" + APIKEY + "&part=contentDetails,statistics", function(data2)
        { 
            data2 = JSON.parse(data2).items

            vids = ""
            
            let repeat = 0
            size = data2.length 
            while (size--)   
            { 
                vids  +=            feed[size].title
                      + "///:///" + feed[size].thumbnail 
                      + "///:///" + parseDuration(data2[repeat].contentDetails.duration) 
                      + "///:///" + numberWithCommas(data2[repeat].statistics.viewCount)
                      + "///:///https://www.youtube.com/watch?v=" + feed[size].videoID 
                      + "///:///" + feed[size].channelName 
                      + "///:///" + feed[size].channelId
                      + "///:///"
                       
                repeat++
            }
                return output.send(vids)
        })
    })
})

/* Returns a string with the url of the video's MP4 */
server.get('/video', function(input, output)
{
    input = input.query
    
    if (!input.q || !input.u)
        return output.sendStatus(404)
   
    ytdl.getInfo(input.u, {downloadURL: true}, function(err, data) 
    {    
        if (!err)
        {
            data = data.formats
            const size = data.length
            
            if (input.q === '720p')
                for (let count = 0; count < size; count++)
                    if (data[count].itag === '22')
                        return output.send(data[count].url)  

            for (let count = 0; count < size; count++)
                if (data[count].itag === '18')
                    return output.send(data[count].url)  
        }

        else
            return output.sendStatus(500)
    })
})

/* Returns a String of videos from a query */
server.get('/search', function(input, output)
{
    input = input.query
    if (!input.i || !input.s) 
        return output.sendStatus(404)
    
    input.i = parseInt(input.i) + 25

    download("https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + input.s + "&maxResults=" + input.i + "&type=video&key=" + APIKEY, function(data1) 
    {
        data1 = JSON.parse(data1)
        
        let size = data1.pageInfo.totalResults
        if (size > 26) { size = 25 }
        input.i = size
        size--
        
        data1 = data1.items.splice(-1 * input.i)
        
        let feed = data1[size].id.videoId
        while (size--) { feed += "," + data1[size].id.videoId }
        
        download("https://www.googleapis.com/youtube/v3/videos?id=" + feed + "&key=" + APIKEY + "&part=contentDetails,statistics", function(data2) 
        {
            var count = 0
            
            feed = ""
            size = input.i
            
            data2 = JSON.parse(data2).items
            
            while (size--)
            {
               feed +=            data1[count].snippet.title 
                    + "///:///" + data1[count].snippet.thumbnails.medium.url 
                    + "///:///" + parseDuration(data2[size].contentDetails.duration) 
                    + "///:///" + numberWithCommas(data2[size].statistics.viewCount)
                    + "///:///https://www.youtube.com/watch?v=" + data1[count].id.videoId 
                    + "///:///" + data1[count].snippet.channelTitle 
                    + "///:///" + data1[count].snippet.channelId 
                    + "///:///"
               
               count++
            }
                return output.send(feed)
        })
    })
})

/* Returns a String of recent videos from an associated Channel ID */
server.get('/channel', function(input, output)
{
    input = input.query
    
    if (!input.c) 
        return output.sendStatus(404)

    download("https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=" + input.c + "&order=date&type=video&maxResults=25&key=" + APIKEY, function(data1) 
    {
        let result1 = JSON.parse(data1).items
        
        TimSort.sort(result1, channelSort)
        
        let feed = result1[24].id.videoId, size = 24
        
        while (size--) { feed += "," + result1[size].id.videoId }
        
        download("https://www.googleapis.com/youtube/v3/videos?id=" + feed + "&key=" + APIKEY + "&part=contentDetails,statistics", function(data2)
        { 
            let count = 0
            
            feed = ""
            size = 25
            
            data2 = JSON.parse(data2).items
            
            while (size--)   
            {
               feed +=            result1[count].snippet.title 
                    + "///:///" + result1[count].snippet.thumbnails.medium.url 
                    + "///:///" + parseDuration(data2[size].contentDetails.duration) 
                    + "///:///" + numberWithCommas(data2[size].statistics.viewCount)
                    + "///:///https://www.youtube.com/watch?v=" + result1[count].id.videoId 
                    + "///:///" + result1[count].snippet.channelTitle 
                    + "///:///" + result1[count].snippet.channelId 
                    + "///:///"
               
               count++
            }
                return output.send(feed)
        })
    })
})

/* Returns a String with urls associated with a Channel ID's: Official Name and Thumbnail */
server.get('/chInfo', function(input, output)
{
    input = input.query
    
    if (!input.c)
        return output.sendStatus(404)
    
    download("https://www.googleapis.com/youtube/v3/channels?part=snippet&id=" + input.c + "&key=" + APIKEY, function(data) 
    {
        data = JSON.parse(data).items[0].snippet
        
        return output.send(data.title + "///:///" + data.thumbnails.medium.url)
    })
})

/* Default Homepage */
server.get('*', function (q, s) 
{
    s.render('index')
})

/** Utility Functions */

/* Download function */
function download(url, callback) {
    https.get(url, function (res) {
        let data = "";
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on("end", function () {
            callback(data);
        });
    }).on("error", function () {
        callback(null);
    });
}

/* Sorting based on time */
function nowSort(a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0 }

/* Sorting based on time published */
function channelSort(a, b) { return a.snippet.publishedAt > b.snippet.publishedAt ? -1 : a.snippet.publishedAt < b.snippet.publishedAt ? 1 : 0 }

/* Regular Expression to formalize number string with appropriate commas */
const numCommaRegEx = /\B(?=(\d{3})+(?!\d))/g
function numberWithCommas(x) { return x.toString().replace(numCommaRegEx, ",") }

/* Regular Expression to formalize ISO 8601 string into H:M:S */
function parseDuration(e){var n=e.replace(/D|H|M/g,":").replace(/P|T|S/g,"").split(":");if(1==n.length)2!=n[0].length&&(n[0]="0"+n[0]),n[0]="0:"+n[0];else for(var l=1,r=n.length-1;r>=l;l++)2!=n[l].length&&(n[l]="0"+n[l],2!=n[l].length&&(n[l]="0"+n[l]));return n.join(":")}

server.listen(process.env.PORT || '8000')