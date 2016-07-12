#Data collection

###First look around
Starting off our collaboration with the theme movies, summer movies would be even better, as long as there was some connection to me personally. Since I'm not keeping tabs on all of the movies I've ever watched, the personal touch was a bit vague to me at the start. So I started by searching for movie data in general. 

I came across budget and gross information per movie pretty quickly. But the gorgeous ["Spotlight on Profitability" by Krisztina Szücs](http://krisztinaszucs.com/?my-product=hollywood) is one of my favorite dataviz pieces and I didn't want to try and do something with similar data which could never compare to the quality of Krisztina's work.

####IMDb
The [OMDb API](http://www.omdbapi.com/) (the O stands for Open) seemed very interesting to get detailed information about a movie. But you needed to either provide a movie title or IMDb ID. Luckily IMDb actually has an [ftp](http://www.imdb.com/interfaces) where you can download huge files with all of the information on movies & series on a particular subject; genre, cast, release date, budgets and much more. Having access to such a large database seemed like a very interesting angle to start working with, but it wasn't very personal yet.

####Lord of the Rings
So, instead I left that and started looking for data on my favorite movie (trilogy), the Lord of the Rings. I still remember, as a 12-year old girl, waiting at the movie theatre more than 1.5 hours in advance with my parents to get the best spots in the theatre (it was still first come, first serve back then). Collecting magazine clippings and posters and later fondly watching all of the extra's (even for a second time). It's more than 9 hours of film that I can watch year after year.

With the huge fanbase that the movies and the books have I expected to find loads of interesting datasets on the film, but I was actually a bit dissapointed. I could only find the [LotR Project](http://lotrproject.com/statistics/), but that is about the book, which I couldn't use, besides the fact that I couldn't find any raw data, just charts. 

####The number of words spoken - per character per scene
And then I came across the GitHub of [jennybc](https://github.com/jennybc/lotr) who had a fascinating dataset about the number of words spoken by each character in the actual extended editions of all 3 films. She seems to have gotten the data herself from Many Eyes, but since that no longer exists I cannot trace the data farther back. I did do several manual checks, comparing the word count to [scripts available online](http://www.ageofthering.com/) (which serendipitously & sadly seems to have expired only 2 days after I finished my data preparation...) and they coincided very well. 

###Enriching the data
In the data, I have information on the number of words spoken by each character by scene and what race that character is. However, I found scenes to be a bit arbitrary. They are attached to the making of the movie, not the movie experience perse. So instead I went ahead and manually added an on-screen location to each of the ±800 rows of data. For this I (again) relied heavily on the Age of the Ring scripts of the extended editions and the original scripts of the non-extended editions found on [IMSDb](http://www.imsdb.com/). These scripts sometimes mention the location when they talk about the scene in general. And of course, I used my own memory of watching the movies time and time again. 

I made two columns, one with a broad location (Gondor for example) and an extra with a more detailed location (Minas Tirith). I feel that the general location was straightforward to find. The only issue was that I didn't quite know where to group certain very specific location to. The Grey Havens for example; not the Shire or Rivendell... or Emyn Muil (& the Dead Marshes) not yet in Mordor and doesn't really fit with Rohan. But both are too small to really are their own broad location. 

The detailed location, on the other hand, was sometimes just not known, too general or I couldn't find any mention of it in the scripts, but I think that about 90% have good detailed locations. 

I also sometimes split up the words of a character within one scene because he or she was present in multiple detailed locations. So I had to recount the words belonging to each detailed location. Eventually this was a labor of love, during a lovely Sunday, and I tried my very best to add the right data to each scene. After finishing, it felt like a dataset that I had a personal connection to and wanted to try and visualize.
