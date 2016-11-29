#Get the top 100 fantasy authors from Amazon
#Taken on November 7th, 2016 at 13:24 Amsterdam time

#Web scraper explanation
#https://blog.rstudio.org/2014/11/24/rvest-easy-web-scraping-with-r/
library(rvest)
library(stringr)
library(tidyr)

#https://www.amazon.com/author-rank/Fantasy/books/16190/ref=kar_mr_pg_1?_encoding=UTF8&pg=1
#https://www.amazon.com/author-rank/Fantasy/books/16190/ref=kar_mr_pg_1?_encoding=UTF8&pg=2

numPages <- 10
authorList <- NULL
for(i in 1:numPages) {
  url <- paste('https://www.amazon.com/author-rank/Fantasy/books/16190/ref=kar_mr_pg_1?_encoding=UTF8&pg=',i,sep="")
  webpage <- read_html(url)
  
  #Get the names of the authors
  #Used http://selectorgadget.com/ to figure out how to grab a hold of the author's name
  authorListPage <- webpage %>%
    html_nodes(".kar_authorName") %>%
    html_text()
  
  authorList <- append(authorList, authorListPage)
}#for i

#save the list
authorListDF <- data.frame(rank = 1:length(authorList), author = authorList, stringsAsFactors = F)
write.csv(authorListDF, file="top100FantasyAuthorsAmazon.csv", row.names = F)
