
/* Warren Seto ~ Cloud ~ Players App (v2) */

import Foundation

/*  */
public struct VideoEntry :Decodable {
    let result    :VideoResult,
        detail    :VideoDetail
}

/*  */
public struct VideoResult  :Decodable {
    let title       :String,
        thumbnail   :URL,
        videoid     :String,
        channelname :String,
        channelid   :String,
        duration    :String,
        viewcount   :String
}

/*  */
public struct VideoDetail  :Decodable {
    let description :String?,
        mp4         :URL?,
        like        :String?,
        dislike     :String?
}

public struct ChannelDetail:Decodable {
    let description :String,
        thumbnail   :URL?
}

/*  */
public struct SearchResult :Decodable {
    let nextToken   :String,
        results     :[VideoResult]
}

/*  */
public struct SearchQuery : CustomStringConvertible {
    
    public var query = "",
        nextPageToken = " ",
        option = " "
    
    public init() {
        query = ""
        nextPageToken = " "
        option = " "
    }
    
    mutating func resetSearch(newQuery:String) {
        query = newQuery
        nextPageToken = " "
        option = " "
    }
    
    public var description: String {
        return "\(query.addingPercentEncoding(withAllowedCharacters: .alphanumerics)!)/\(nextPageToken.addingPercentEncoding(withAllowedCharacters: .alphanumerics)!)/\(option.addingPercentEncoding(withAllowedCharacters: .alphanumerics)!)"
    }
}

public final class Cloud
{
    /** Returns an array of recent videos from an array of Channel ID Strings */
    public class func get(subscriptions:[String], results callback: @escaping ([VideoResult]) -> Void) {
        
        self._GET("https://custom_backend.com/channel/\(subscriptions.joined(separator: ","))") { (code, data) in
            if code == 200 {
                do {
                    return callback(try JSONDecoder().decode([VideoResult].self, from: data!))
                } catch {
                    return callback([])
                }
            } else {
                callback([])
            }
        }
    }
    
    /** Return only the full description and MP4 from a given video ID String */
    public class func get (video ID:String, withQuality quality:String, details callback: @escaping (VideoDetail?) -> Void) {
        
        self._GET("https://custom_backend.com/video/detail/\(ID)/\(quality)") { (code, data) in
            if code == 200 {
                do {
                    return callback(try JSONDecoder().decode(VideoDetail.self, from: data!))
                } catch {
                    return callback(nil)
                }
            } else {
                return callback(nil)
            }
        }
    }
    
    /** Return the full video information including name, view count, etc and MP4 from a given video ID String */
    public class func get (video ID:String, withQuality quality:String, entry callback: @escaping (VideoEntry?) -> Void) {
        
        self._GET("https://custom_backend.com/video/\(ID)/\(quality)") { (code, data) in
            if code == 200 {
                do {
                    return callback(try JSONDecoder().decode(VideoEntry.self, from: data!))
                } catch {
                    return callback(nil)
                }
            } else {
                callback(nil)
            }
        }
    }
    
    /** Returns an array of videos from a given Search Query */
    public class func get (search payload:SearchQuery, results callback:@escaping (SearchResult?)->()) {
        
        self._GET("https://custom_backend.com/search/\(payload)") { (code, data) in
            if code == 200 {
                do {
                    return callback(try JSONDecoder().decode(SearchResult.self, from: data!))
                } catch {
                    return callback(nil)
                }
            } else {
                return callback(nil)
            }
        }
    }
    
    /** Return only the description, subscriber count, and thumbnail from a given Channel ID String */
    public class func get (channel ID:String, details callback:@escaping (ChannelDetail?)->()) {
        
        self._GET("https://custom_backend.com/channel/detail/\(ID)") { (code, data) in
            if code == 200 {
                do {
                    return callback(try JSONDecoder().decode(ChannelDetail.self, from: data!))
                } catch {
                    return callback(nil)
                }
            } else {
                callback(nil)
            }
        }
    }
    
    public class func _GET (_ url: String, response: @escaping (Int?, Data?) -> Void) {
        URLSession.shared.dataTask(with: URL(string: url)!) { (data, res, err) in
            response(((res as? HTTPURLResponse)?.statusCode), data)
            }.resume()
    }
    
    public class func _GET (_ url: URL, response: @escaping (Int?, Data?) -> Void) {
        URLSession.shared.dataTask(with: url) { (data, res, err) in
            response(((res as? HTTPURLResponse)?.statusCode), data)
            }.resume()
    }
}
