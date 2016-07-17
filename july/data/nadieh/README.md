#Data collection

###Enriching the data
In the Lord of the Rings data, I have information on the number of words spoken by each character by scene and what race that character is. However, I found scenes to be a bit arbitrary. They are attached to the making of the movie, not the movie experience perse. So instead I went ahead and manually added an on-screen location to each of the ±800 rows of data. Besides a map of Middle-Earth, I relied heavily on the Age of the Ring scripts of the extended editions and the original scripts of the non-extended editions found on [IMSDb](http://www.imsdb.com/). These scripts sometimes mention the location when they talk about the scene in general. And of course, I used my own memory of watching the movies time and time again. 

I made two columns, one with a broad location (Gondor for example) and an extra with a more detailed location (Minas Tirith). I feel that the general location was straightforward to find. The only issue was that I didn't quite know where to group certain very specific location to. The Grey Havens for example; not the Shire or Rivendell... or Emyn Muil (& the Dead Marshes) not yet in Mordor and doesn't really fit with Rohan. But both are too small to really are their own broad location. 
The detailed location, on the other hand, was sometimes just not known, too general or I couldn't find any mention of it in the scripts, but I think that about 90% have good detailed locations. 

I also sometimes split up the words of a character within one scene because he or she was present in multiple detailed locations. So I had to recount the words belonging to each detailed location. Eventually this was a labor of love, during a lovely Sunday, and I tried my very best to add the right data to each scene. After finishing, it felt like a dataset that I had a personal connection to and wanted to try and visualize.