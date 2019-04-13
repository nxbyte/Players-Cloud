// Warren Seto
"use strict"

// Setup Server Rules
const server = require('express')()
server.use(require('compression')())

// Setup HTTP client
const https = require('https')
https.globalAgent.maxSockets = Infinity

// Setup Async
const asyncEach = require('async/each'),
      asyncParallel = require('async/parallel')

// Setup Faster Sorting
const TimSort = require('timsort')

// Youtube API Key
const APIKEY = process.env.YOUTUBE_API_KEY

if (!APIKEY) {
    throw new Error('CRASH PROBLEM: NO YOUTUBE API KEY SET process.env.YOUTUBE_API_KEY')
}

// Setup Youtube Internal Engine
const ytdl = require('ytdl-core')


// Strings used for GoogleAPIs
const VideoAPIQuery = 'https://www.googleapis.com/youtube/v3/videos?key=' + APIKEY + '&id=',
      SearchAPIQuery = 'https://www.googleapis.com/youtube/v3/search?key=' + APIKEY + '&part=snippet&type=video&fields=items/snippet,items/id/videoId',
      ChannelAPIQuery = 'https://www.googleapis.com/youtube/v3/channels?key=' + APIKEY + '&part=snippet&fields=items/snippet/description,items/snippet/customUrl,items/snippet/thumbnails/medium&id='


/**
 * @typedef {Object} VideoResult
 * @property {String} title
 * @property {String} thumbnail
 * @property {String} videoid
 * @property {String} channelname
 * @property {String} channelid
 * @property {String} duration
 * @property {String} viewcount
 */

/**
 * Returns 
 * @params {String} ID
 * @return {VideoResult[]}
 */
server.get('/channel/:ID', function(input, output)
{
    var feed = []
    
    asyncEach(input.params.ID.split(','), function(e, cb)
    {
        download(SearchAPIQuery + '&channelId=' + e + '&order=date&maxResults=15', function(data1) 
        {
            data1 = JSON.parse(data1).items
            
            if (data1)
            {
                var size = data1.length
                while (size--)
                {
                    feed.push
                    ({    
                           time: data1[size].snippet.publishedAt,
                          title: data1[size].snippet.title, 
                      thumbnail: data1[size].snippet.thumbnails.medium.url, 
                        videoid: data1[size].id.videoId,
                    channelname: data1[size].snippet.channelTitle, 
                      channelid: data1[size].snippet.channelId
                    })
                }
            }
            
            cb()
        })
    }, 
    function(r)
    {
        TimSort.sort(feed, nowSort)
        
        if (feed.length == 0) { return output.send([]); }
        
        var size = feed.length

        if (size > 30)
            size = 30   
            
        feed = feed.slice(0, size)
        
        size--
        var vids = feed[size].videoid  
 
        while (size--)
            vids += ',' + feed[size].videoid                  

        download(VideoAPIQuery + vids + '&part=contentDetails,statistics&fields=items/contentDetails/duration,items/statistics/viewCount', function(data2)
        { 
            data2 = JSON.parse(data2).items

            var repeat = 0
            size = data2.length 
            while (size--)   
            { 
                feed[size].duration = parseDuration(data2[repeat].contentDetails.duration)
                feed[size].viewcount = data2[repeat].statistics.viewCount ? numberWithCommas(data2[repeat].statistics.viewCount) : 0
                delete feed[size].time
                repeat++
            }
                return output.send(feed)
        })
    })
})



/**
 * @typedef {Object} VideoDetail
 * @property {String} description
 * @property {String} mp4
 */

/**
 * Returns 
 * @params {String} ID
 * @params {String} format
 * @return {VideoDetail}
 */
server.get('/video/detail/:ID/:format', function(input, output)
{
    asyncParallel({
        mp4 : function(cb) {
           ytdl.getInfo(input.params.ID, {downloadURL: true}, function(err, data) 
            {    
                if (!err) {
                    data = data.formats
                    const size = data.length

                    if (input.params.format === 'hd')
                        for (var count = 0; count < size; count++)
                            if (data[count].itag === '22')
                                cb(null, data[count].url)  

                    for (var count = 0; count < size; count++)
                        if (data[count].itag === '18')
                            cb(null, data[count].url)  
                }

                else
                    cb(null, "")
            })
        },
        parts : function(cb) {

            download(VideoAPIQuery + input.params.ID + '&part=snippet,statistics&fields=items/snippet/description,items/statistics/likeCount,items/statistics/dislikeCount', function(data1) {
                
                data1 = JSON.parse(data1).items[0]

                cb(null, {
                    mp4: "", 
                    description: data1.snippet.description, 
                    like: data1.statistics && data1.statistics.likeCount ? numberWithCommas(data1.statistics.likeCount) : "-",
                    dislike: data1.statistics && data1.statistics.dislikeCount ? numberWithCommas(data1.statistics.dislikeCount) : "-"
                })
            })
        }
    },
    function(err, outputData) 
    {
        outputData.parts.mp4 = outputData.mp4
        
        return output.send(outputData.parts)
    })
})



/**
 * @typedef {Object} VideoEntry
 * @property {VideoResult} result
 * @property {VideoDetail} detail
 */

/**
 * Returns 
 * @params {String} ID
 * @params {String} format
 * @return {VideoEntry}
 */
server.get('/video/:ID/:format', function(input, output)
{
    asyncParallel({
        mp4 : function(cb) {
           ytdl.getInfo(input.params.ID, {downloadURL: true}, function(err, data) {    
               
               if (!err) {
                    data = data.formats
                    const size = data.length

                    if (input.params.format === 'hd')
                        for (var count = 0; count < size; count++)
                            if (data[count].itag === '22')
                                cb(null, data[count].url)  

                    for (var count = 0; count < size; count++)
                        if (data[count].itag === '18')
                            cb(null, data[count].url)  
                   
               }
                else
                    return output.sendStatus(500)
            })
        },
        parts : function(cb) {
            download(VideoAPIQuery + input.params.ID + '&part=contentDetails,snippet,statistics&fields=items/snippet,items/contentDetails/duration,items/statistics/viewCount,items/statistics/likeCount,items/statistics/dislikeCount', function(data1) {
                
                data1 = JSON.parse(data1).items[0]

                if (data1) {
                    cb(null, {
                        one: { 
                            mp4: "",
                            description: data1.snippet.description,
                            like: data1.statistics && data1.statistics.likeCount ? numberWithCommas(data1.statistics.likeCount) : "-",
                            dislike: data1.statistics && data1.statistics.dislikeCount ? numberWithCommas(data1.statistics.dislikeCount) : "-"
                        },
                        two: { title:data1.snippet.title, 
                              thumbnail: data1.snippet.thumbnails.medium.url, 
                              videoid:input.params.ID, 
                              channelname:data1.snippet.channelTitle, 
                              channelid:data1.snippet.channelId, 
                              duration: parseDuration(data1.contentDetails.duration), 
                              viewcount: data1.statistics ? numberWithCommas(data1.statistics.viewCount) : "0"
                             }
                    })
                } else {
                    cb(null, {})
                }
            })
        }
    },
    function (err, outputData) {
        outputData.parts.one.mp4 = outputData.mp4
        
        return output.send({result: outputData.parts.two, detail: outputData.parts.one})
    })
})



/**
 * @typedef {Object} SearchResult
 * @property {nextToken} results
 * @property {VideoResult[]} nextToken
 */

/**
 * Returns 
 * @params {String} query
 * @params {String} nextToken
 * @params {String} options
 * @return {SearchResult}
 */
server.get('/search/:query/:nextToken/:options', function(input, output)
{
    download(SearchAPIQuery + ',nextPageToken&q=' + input.params.query + '&maxResults=25' + (input.params.nextToken === ' ' ? '' : '&pageToken=' + input.params.nextToken) + (input.params.options === ' ' ? '' : '&' + input.params.options), function(data1) 
    {
        data1 = JSON.parse(data1)

        if (!data1) {
            return output.send([])
        }
        
        var feed = '',
            size = data1.items.length
        
        while (size--)
            feed += ',' + data1.items[size].id.videoId
        
        download(VideoAPIQuery + feed + '&part=contentDetails,statistics&fields=items/contentDetails/duration,items/statistics/viewCount', function(data2) 
        {
            const outputJSON = {nextToken : data1.nextPageToken, results : []}
            var repeat = 0
            
            data2 = JSON.parse(data2).items
            size = data2.length
            
            while (size--)
            {
                outputJSON.results.push
                ({    
                        title: data1.items[repeat].snippet.title, 
                    thumbnail: data1.items[repeat].snippet.thumbnails.medium.url, 
                      videoid: data1.items[repeat].id.videoId,
                  channelname: data1.items[repeat].snippet.channelTitle, 
                    channelid: data1.items[repeat].snippet.channelId,
                     duration: parseDuration(data2[size].contentDetails.duration),  
                    viewcount: data2[repeat].statistics ? numberWithCommas(data2[repeat].statistics.viewCount) : "0"
                })

                repeat++
            }
                return output.send(outputJSON)
        })
    })
})



/**
 * @typedef {Object} ChannelDetail
 * @property {String} description
 * @property {String} thumbnail
 */

/**
 * Returns 
 * @params {String} ID
 * @return {ChannelDetail} 
 */
server.get('/channel/detail/:ID', function(input, output)
{
    download(ChannelAPIQuery + input.params.ID, function(data) 
    {
        data = JSON.parse(data).items[0].snippet
        
        if (data) {
            return output.send({description: data.description, thumbnail: data.thumbnails.medium.url})
        }
        
        return output.send({})
    })
})

//---------------------------------------------------------------------------------

server.get('*', function(q, s) { s.redirect('https://github.com/nextseto/Players-Cloud') })

//---------------------------------------------------------------------------------

function download(url, callback) {
    https.get(url, function (res) {
        var data = ''
        res.on('data', function (chunk) {
            data += chunk
        })
        res.on('end', function () {
            callback(data)
        })
    }).on('error', function () {
        callback(null)
    })
}

function nowSort(a, b) { return a.time > b.time ? -1 : a.time < b.time ? 1 : 0 }

function channelSort(a, b) { return a.snippet.publishedAt > b.snippet.publishedAt ? -1 : a.snippet.publishedAt < b.snippet.publishedAt ? 1 : 0 }

const numCommaRegEx = /\B(?=(\d{3})+(?!\d))/g
function numberWithCommas(x) { return x.toString().replace(numCommaRegEx, ',') }

function parseDuration(e){var n=e.replace(/D|H|M/g,':').replace(/P|T|S/g,'').split(':');if(1==n.length)2!=n[0].length&&(n[0]='0'+n[0]),n[0]='0:'+n[0];else for(var l=1,r=n.length-1;r>=l;l++)2!=n[l].length&&(n[l]='0'+n[l],2!=n[l].length&&(n[l]='0'+n[l]));return n.join(':')}

server.listen(process.env.PORT || '2000')

//---------------------------------------------------------------------------------
