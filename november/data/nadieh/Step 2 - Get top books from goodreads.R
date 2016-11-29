#Get the titles (and some other info) on the ±10 most popular books for each of the top 100 Fantasy authors
#Taken on November 7th 2016

#https://github.com/Famguy/rgoodreads
library(rgoodreads)
library(rvest)
library(xml2)
library(stringr)

#Set your own Goodreads key
Sys.setenv(GOODREADS_KEY = "Your Goodreads KEY")

#Get the top 100 author's names
authors <- read.csv("top100FantasyAuthorsAmazon.csv")

# #Get the GoodReads author id per top 100
# #Takes some time ±3 minutes or so
# authors$id <- NA
# for(i in 1:nrow(authors)) {
#   a <- author_by_name(authors$author[i])
#   authors$id[i] <- a$id
#   if(i%%10 == 0) print(i)
# }#for i
# rm(a, i)
# #Write to file again - so next time I don't have to do it again
# write.csv(authors, file="top100FantasyAuthorsAmazon.csv", row.names = F)

#Examples:
#https://www.goodreads.com/author/list/38550?format=xml&key=KEY&sort=popularity
#https://www.goodreads.com/review/list/4085451?key=KEY&sort=rating&per_page=5&shelf=scifi

authorBooks <- NULL
for(i in 1:nrow(authors)) {

  #https://www.goodreads.com/api/index#author.books
  url <- paste("https://www.goodreads.com/author/list/",authors$id[i],"?format=xml&key=",Sys.getenv("GOODREADS_KEY"),"&sort=popularity",sep="")
  goodReadsResult <- read_xml(url, encoding="UTF-8")

  #Find the books section
  #https://blog.rstudio.org/2015/04/21/xml2/
  books <- xml_find_all(goodReadsResult, ".//books/book")

  #Check how many books there are
  titles <- xml_text(xml_child(books, "title"))
  maxBooks <- min(length(titles), 10)
  
  #Create new author books data frame
  topBooks <- data.frame(bookRank = 1:maxBooks, stringsAsFactors = F)
  #Get in some author info
  topBooks$author <- authors$author[i]
  topBooks$authorRank <- authors$rank[i]
  
  #Find the names of the most popular books
  topBooks$title <- xml_text(xml_child(books, "title"))[1:maxBooks]
  #Find the average rating
  topBooks$avg_rating <- xml_double(xml_child(books, "average_rating"))[1:maxBooks]
  #Find the number of ratings
  topBooks$num_ratings <- xml_integer(xml_child(books, "ratings_count"))[1:maxBooks]
  #Find the publication year
  topBooks$publication_year <- xml_integer(xml_child(books, "published"))[1:maxBooks]
  #Find the number of pages
  topBooks$num_pages <- xml_integer(xml_child(books, "num_pages"))[1:maxBooks]
  
  #take first (max) 5 letters from book
  topBooks$titleLength <- nchar(topBooks$title)
  topBooks$titleSub <- str_sub(topBooks$title, 1, min(5, topBooks$titleLength))
  #Strip any books that are not written in latin script (I wish there was a "language" field to select on...)
  #So instead I look at the first 5 letters and see if they are all none-ASCII to at least get some non latin alphabets out
  #http://stackoverflow.com/questions/34613761/detect-non-ascii-characters-in-a-string
  nonLatinBooks <- grep("\032\032\032\032\032", stri_enc_toascii(topBooks$title))
  if(length(nonLatinBooks) > 0) topBooks <- topBooks[-nonLatinBooks,]
  topBooks$titleSub <- NULL
  
  #See if a title has a reference to a series (with the () )
  topBooks$book_series <- ""
  seriesBooks <- grep("\\#", topBooks$title)
  if(length(seriesBooks) > 0) {
    topBooks$book_series[seriesBooks] <- topBooks$title[seriesBooks]
    #http://stackoverflow.com/questions/13498843/regex-to-pickout-some-text-between-parenthesis
    topBooks$book_series <- gsub(".*\\((.*) #.*\\).*", "\\1", topBooks$book_series)
    topBooks$book_series <- gsub(",", "", topBooks$book_series)
    topBooks$book_series <- str_trim(topBooks$book_series)
  }#if
  
  #Strip this series info from the title
  topBooks$title <- str_trim(gsub("\\(.*\\)", "", topBooks$title))
  
  #Add the info to the longer list with all authors
  authorBooks <- rbind(authorBooks, topBooks)
  
  if(i%%10 == 0) print(i)
}#for i

write.csv(authorBooks, file="top10BooksPerAuthor.csv", row.names=F, fileEncoding="UTF-8")
