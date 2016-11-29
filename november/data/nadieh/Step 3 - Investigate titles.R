#Perform text cleaning on the titles
#Get the hypernyms of the nouns in the titles
#Perform a clustering anaysis on the cleaned titles

# options(java.parameters = "- Xmx1024m")
# http://www.bramschoenmakers.nl/en/node/726
options( java.parameters = "-Xmx4g" )

library(stringr)
library(tm) #text mining
library(tau) #wordcount
library(slam) #col_sums
library(wordcloud)
library(ggplot2)
library(RColorBrewer)
library(wordnet) #hypernym
library(NLP) #word tagging
library(openNLP)

#read in the most popular books per author
books <- read.csv("top10BooksPerAuthor.csv", stringsAsFactors = F)

#######################################################################
########################### data cleaning #############################
#######################################################################

#I don't want authors who only had one good book - 
#or co-wrote 1 book with a very very famous person 
#Check median number of ratings per author, such as:
#Jack Thorne & John Tiffany for Harry Potter and the cursed child
authorRatings <- tapply(books$num_ratings, books$author, median)
authorRatings <- sort(authorRatings)
#plot(authorRatings, 1:length(authorRatings), type="p", xlim=c(0,2000))

#Assumption - Author needs a median of at least 20 ratings for his/her books
#(~at least half of the books with > 20 reviews)
removeAuthors <- names(authorRatings[which(authorRatings < 20)])
books <- books[-which(books$author %in% removeAuthors),]

#If a book title occurs too often, it was written by too many others 
#(and thus usually some "combined" book title which I'm not looking for)
numPerTitle <- sort(table(books$title), decreasing = T)
#Remove those titles with more than 2 occurences
removeBooks <- names(numPerTitle)[which(numPerTitle > 2)]
books <- books[-which(books$title %in% removeBooks),]
#Also remove boxes and sets
removeBooks <- grep("(boxed|set|library|edition|collected|novels|magazine|chapters|versions)", books$title, ignore.case=T)
books <- books[-removeBooks,]

#Remove duplicated books by the same author
books <- books[!duplicated(books[,c("title","author")]),]

#Remove books with 0 ratings
books <- books[-which(books$num_ratings == 0),]

rm(authorRatings, removeAuthors, numPerTitle, removeBooks)

#######################################################################
########################### text cleaning #############################
#######################################################################

#Count the number of words in the title
#http://stackoverflow.com/questions/8920145/count-the-number-of-words-in-a-string-in-r
titleClean <- gsub("[[:punct:]]", "", books$title)
books$numWords <- sapply(gregexpr("[[:alpha:]]+", titleClean), function(x) sum(x > 0))

books$titleClean <- books$title
#Remove some very specific terms
books$titleClean <- gsub("(Parts One and Two|Part One|Book One)", " ", books$titleClean)
#Remove punctuation
books$titleClean <- gsub("[[:punct:]]", " ", books$titleClean)
books$titleClean <- gsub("'", " ", books$titleClean)
#Remove numbers
books$titleClean <- gsub("[[:digit:]]", " ", books$titleClean)
#Remove leading and trailing spaces
books$titleClean <- str_trim(books$titleClean)
#Remove multiple spaces
books$titleClean <- gsub(" +", " ", books$titleClean)
#Convert to lower cases
books$titleClean <- tolower(books$titleClean)

#Split the text in words
bookTitle <- books$titleClean
bookTitle <- strsplit(bookTitle," ")
  
#Remove Words
toBeRemoved <- c(stopwords('english'), "part", "parts","(^| )can( |$)","(^| )don( |$)","(^| )june( |$)","series",
                 "titles","(^| )vol( |$)","volume","episode","prequels",
                 "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z")
bookTitleCleaned <- lapply(bookTitle,removeWords,toBeRemoved)
bookTitleCleaned <- sapply(bookTitleCleaned, paste, collapse = " ")

#Removal of words has re-introduced multiple blanks
#Remove leading and trailing spaces
books$titleClean <- str_trim(bookTitleCleaned)
books$titleClean <- gsub(" +", " ", books$titleClean)

#Remove to clean up
rm(toBeRemoved, bookTitleCleaned, bookTitle, titleClean)

#######################################################################
########################### text stemming #############################
#######################################################################

#Have decided not to do stemming, because I'm mostly interested in nouns anyway

#######################################################################
########################### save result ###############################
#######################################################################

write.csv(books, file = "top10BooksPerAuthorCleaned.csv", row.names=F)

#######################################################################
############################ word count ###############################
#######################################################################

#Check the duplicated - is there anything to take out completely?
books$titleClean[duplicated(books$titleClean)]

#Do a quick word count of what's left of the titles
chosentxt <- books$titleClean #unique(books$titleClean)

#Count unique words. Use minimum number of occurences
wordcountSingle <- textcnt(chosentxt,n=1L,method="string",lower=1L) #single words
wordcountDouble <- textcnt(chosentxt,n=2L,method="string",lower=1L) #double words
wordcount <- append(wordcountSingle,wordcountDouble)

#Find the top 100 most common words
rankWords <- wordcount[order(wordcount, decreasing=TRUE)][1:100]
ranking <- data.frame(word = names(rankWords), numOccurences = rankWords)
row.names(ranking) <- NULL

#How many different authors used that word in a title
ranking$numAuthor <- NA
for(i in 1:nrow(ranking)) {
  #It should be the word in itself, either surrounded by spaces, or start/end of string
  occurences <- grep(paste("(^| )",ranking$word[i],"( |$)",sep=""), books$titleClean, ignore.case=T)
  ranking$numAuthor[i] <- length(unique(books$author[occurences]))
}#for i

#clean up
rm(chosentxt, wordcountSingle, wordcountDouble, wordcount, rankWords, occurences, i)

#######################################################################
########################## find hypernyms #############################
#######################################################################

# #Only needed the very first time to get the hyprenyms
# wordcount <- textcnt(books$titleClean,n=1L,method="string",lower=0L)
# d <- names(wordcount)

# #http://stackoverflow.com/questions/2970829/extracting-nouns-and-verbs-from-text
# #http://stackoverflow.com/questions/28764056/could-not-find-function-tagpos
# tagPOS <-  function(x, ...) {
#   s <- as.String(x)
#   word_token_annotator <- Maxent_Word_Token_Annotator()
#   a2 <- Annotation(1L, "sentence", 1L, nchar(s))
#   a2 <- NLP::annotate(s, word_token_annotator, a2)
#   gc()
#   a3 <- NLP::annotate(s, Maxent_POS_Tag_Annotator(), a2)
#   gc()
#   a3w <- a3[a3$type == "word"]
#   POStags <- unlist(lapply(a3w$features, `[[`, "POS"))
#   POStagged <- paste(sprintf("%s/%s", s[a3w], POStags), collapse = " ")
#   list(POStagged = POStagged, POStags = POStags)
# }#function tagPOS
# 
# #function to find the closest hypernym to a word
# getHypernym <- function(word) {
#   #https://cran.r-project.org/web/packages/wordnet/wordnet.pdf
#   #https://cran.r-project.org/web/packages/wordnet/vignettes/wordnet.pdf
#   filter <- getTermFilter("ExactMatchFilter", word, TRUE)
#   terms <- getIndexTerms("NOUN", 1, filter)
#   #sapply(terms, getLemma)
#   
#   synsets <- tryCatch( getSynsets(terms[[1]]), warning=function(w) {return(NA)}, error=function(e) {return(NA)} )
#   if(is.na(synsets[1])) return(NA)
#   
#   #Hypernym = @ - http://wordnet.princeton.edu/man/wnsearch.3WN.html#sect4
#   related <- tryCatch( getRelatedSynsets(synsets[[1]], "@"), warning=function(w) {return(NA)}, error=function(e) {return(NA)} )
#   if(!is.na(related)) {
#     relatedWord <- sapply(related, getWord)
#     if(is.list(relatedWord)) {
#       return(relatedWord[[1]][1])
#     } else if(is.null(dim(relatedWord))) { 
#       return(relatedWord[1])
#     } else {
#       return(relatedWord[1,1])
#     }#else
#   } else {
#     return(NA)
#   }#else
# }#function getHypernym
#
# #Add a possible hypernym to the nouns in this list
# wordcount <- data.frame(word = d, num = as.numeric(wordcount))
# wordcount$tag <- wordcount$hypernym <- NA
# for(i in 1:nrow(wordcount)) {
#   tagWord <- tagPOS(wordcount$word[i])
#   wordcount$tag[i] <- tagWord$POStags
#   #https://cs.nyu.edu/grishman/jet/guide/PennPOS.html
#   if(tagWord$POStags %in% c("NNP","NN","NNS","NNPS")) {
#     wordcount$hypernym[i] <- getHypernym(d[i])
#   }#if
#   if(i%%25 == 0) print(i)
# }#for i
# rm(tagWord,i)
# 
# write.csv(wordcount, file="hypernymWords.csv", row.names=F, na="")

#######################################################################
################## replace words with "hypernyms"  ####################
#######################################################################

#Replace uncommen words with general terms
replaceWords <- read.csv2("hypernymWordsTagged.csv", stringsAsFactors = F)
#Only keep the ones that need to be replaced
replaceWords <- replaceWords[-which(replaceWords$group == ""),]
for(i in 1:nrow(replaceWords)) {
  #http://stackoverflow.com/questions/22888646/making-gsub-only-replace-entire-words
  books$titleClean <- gsub(paste0('\\<',str_trim(replaceWords$word[i]),'\\>'), 
                           str_trim(replaceWords$group[i]), books$titleClean, ignore.case = T)
}#for i
rm(replaceWords,i)

#######################################################################
############################ create dtm ###############################
#######################################################################

#Create wordlist to use in making of DocumentTermMatric
wordcount <- textcnt(books$titleClean,n=1L,method="string",lower=1L)
d <- names(wordcount)
wordcount <- data.frame(word = d, num = as.numeric(wordcount))

#Create corpus
textCorpus <- Corpus(VectorSource(books$titleClean))

#Create a dtm
#Didn't do a tf-idf on purpose because it's short titles and all the words in there should be (equally) relevant
dtm <- DocumentTermMatrix(textCorpus, control = list(dictionary = d, weighting=weightTf))
dim(dtm)
summary(row_sums(dtm))

#Remove empty rows
dtm <- dtm[row_sums(dtm) > 0,] 
dim(dtm)
#Remaining books
booksLeft <- books[as.numeric(dtm$dimnames[1]$Docs),]

#Clean up
rm(textCorpus, d)

# #Inspect results - Find associates to a certain wih with a correlation higher than given number
# freqTerms <- findFreqTerms(dtm, lowfreq=round(mean(col_sums(dtm))))
# findAssocs(dtm, 'magic', 0.04)
# findAssocs(dtm, 'fire', 0.01)
# rm(freqTerms)

#######################################################################
#################### visualize most frequent terms ####################
#######################################################################

termFrequency <- col_sums(dtm)
termFrequency <- sort(subset(termFrequency, termFrequency > 5))
termOrder <- reorder(names(termFrequency), termFrequency)
termFrequency <- data.frame(term = factor(names(termFrequency),levels=termOrder), freq = termFrequency, stringsAsFactors = F)
p <- ggplot(termFrequency, aes(y = freq, x = term)) +
  geom_bar(stat="identity") +
  ylab("Occurence of words") + xlab("") + ggtitle("Most occuring words") +
  coord_flip()
plot(p)
#ggsave(filename="Most occuring words.png", p)
rm(termOrder, p)

termFrequency <- termFrequency[order(termFrequency$freq, decreasing = T),]
row.names(termFrequency) <- NULL

#######################################################################
###################### wordcloud just for fun #########################
#######################################################################

# #Create vector to be visualized based on sum of columns
# wordFreq <- sort(col_sums(dtm.sparse), decreasing=TRUE)
# wordFreqDF <- data.frame(word = names(wordFreq), freq = wordFreq)
# set.seed(123) #to make it reproducible
# 
# #Old wordcloud
# wordcloud(words=names(wordFreq), freq=wordFreq, scale=c(4,.5), min.freq=2, max.words=Inf, 
#           random.order=FALSE, rot.per=.15, colors=brewer.pal(9, "BuGn"))
# 
# #Determing colors for the words
# #Colors <- brewer.pal(8,"Dark2")
# range01 <- function(x){(x-min(x))/(max(x)-min(x))}
# Colors <- gray(range01(wordFreq))
# 
# #Create a wordcloud
# wordcloud2(wordFreqDF, color=Colors, minRotation = -pi/2, maxRotation = -pi/2,
#            fontFamily = 'King Basil Lite')
# #Clean up
# rm(wordFreq, wordFreqDF, Colors, range01)

#######################################################################
############################ clustering ###############################
#######################################################################

library(tsne)
library(Rtsne)
library(fpc) #plotcluster
library(ggrepel)
library(TSP) #Traveling Salesman Problem

bookWordVector <- as.matrix(dtm)

# #Hierarchical Agglomerative Clustering
# d <- dist(bookWordVector, method = "euclidean")
# fit <- hclust(d, method="ward.D")
# plot(fit)
# rect.hclust(fit, k=14, border="red")
# rm(d,fit)
# 
# #Determine number of clusters
# #http://www.statmethods.net/advstats/cluster.html
# wss <- (nrow(bookWordVector)-1)*sum(apply(bookWordVector,2,var))
# for (i in 2:50) wss[i] <- sum(kmeans(bookWordVector, centers=i)$withinss)
# plot(1:length(wss), wss, type="b", xlab="Number of Clusters", ylab="Within groups sum of squares")
# rm(wss,i)
# 
# #Kmeans Cluster with X centers and iterations =10000
# set.seed(19)
# km <- kmeans(bookWordVector,14,10000)
# plotcluster(bookWordVector, km$cluster, pch=16)
# booksLeft$cluster <- km$cluster
# 
# #Run principle component analysis
# pc <- prcomp(bookWordVector)
# plot(pc$x[,1], pc$x[,2],col=km$cluster,pch=16)

# #Run Rtsne
# set.seed(19)
# rtsneBooks <- Rtsne(bookWordVector, check_duplicates = F)
# plot(rtsneBooks$Y, xlab="", ylab="", pch=16, cex=0.6, col=rgb(0, 0, 0, 0.5))
# booksLeft$x <- rtsneBooks$Y[,1]
# booksLeft$y <- rtsneBooks$Y[,2]

#Run tsne
set.seed(19)
tsneBooks <- tsne(bookWordVector, k=2, max_iter=500)
plot(tsneBooks[,1], tsneBooks[,2], xlab="", ylab="", asp=1, pch=16, cex=0.6, col=rgb(0, 0, 0, 0.5))
booksLeft$x <- tsneBooks[,1]
booksLeft$y <- tsneBooks[,2]

#Plot where the books ended up with certain popular terms
par(mfrow=c(6,7))
par(mar=c(1,1,4.1,1))
for(i in 1:42) {
  titlesChosen <- grep(paste0('\\<',termFrequency$term[i],'\\>'), booksLeft$titleClean)
  plot(booksLeft$x[titlesChosen], booksLeft$y[titlesChosen], main=termFrequency$term[i], 
       xlim=c(-50,50), ylim=c(50,-50), xlab="", ylab="", xaxt="n", yaxt="n", 
       pch=16, cex=0.6, col=rgb(0, 0, 0, 0.5), asp=1)
}#for i
rm(titlesChosen)
par(mfrow=c(1,1))
par(mar=c(5.1,4.1,4.1,2.1))

# ggplot(booksLeft, aes(x,y)) + 
#   geom_point(size = 1, alpha = 0.5) +
#   geom_text(label = titlesLeft, size=1) +
#   theme_minimal()

# #Plot the result with non-overlapping labels
# p <- ggplot(booksLeft, aes(x,y)) + 
#   geom_point(aes(size = sqrt(num_ratings)), alpha = 0.5) +
#   geom_text_repel(aes(size = num_ratings, label = title), 
#                   point.padding = NA, segment.size = 0.2, segment.color = '#e5e5e5') +
#   theme_minimal()
# plot(p)
# ggsave(filename="tsne for books 4.pdf", plot=p, width=60, height=40, units="cm")

#######################################################################
################### plot the clustering results #######################
#######################################################################

#Find centers for most popular terms
termFrequency$x <- termFrequency$y <- NA
for(i in 1:nrow(termFrequency)) {
  titlesFound <- grep(paste0('\\<',termFrequency$term[i],'\\>'), booksLeft$titleClean)
  termFrequency$x[i] <- mean(booksLeft$x[titlesFound])
  termFrequency$y[i] <- mean(booksLeft$y[titlesFound])
}#for i
rm(i, titlesFound)

#Plot the books and centers of common words
plot(booksLeft$x, booksLeft$y, xlab="", ylab="", xaxt="n", yaxt="n", 
     asp=1, pch=16, cex=0.6, col=rgb(0, 0, 0, 0.5))
#text(booksLeft$x, booksLeft$y, labels=booksLeft$title, cex = 0.4)
text(termFrequency$x, termFrequency$y, labels=termFrequency$term, cex = 0.8)

#Find the closest book, to link books from the same author
authorsLeft <- unique(booksLeft$authorRank)
booksLeft$pathOrder <- NA
for(i in 1:length(authorsLeft)) {
  chosenRows <- which(booksLeft$authorRank == authorsLeft[i])
  chosenBooks <- booksLeft[chosenRows,]

  #Find the shortest path trough thes books
  #http://stackoverflow.com/questions/27363653/find-shortest-path-from-x-y-coordinates-with-start-%E2%89%A0-end
  tsp <- TSP(dist(chosenBooks[,c("x","y")], method = "euclidean"))
  tsp <- insert_dummy(tsp, label = "cut")
  tour <- solve_TSP(tsp, method="2-opt", control=list(rep=10))
  path.tsp <- unname(cut_tour(tour, "cut"))
  #path.tsp
  
  #Plot the path
  lines(chosenBooks$x[path.tsp], chosenBooks$y[path.tsp], col=rgb(0, 0, 0, 0.2), lwd=0.5)
  
  #Attach the route in the right order to the data
  pathOrder <- data.frame(originalOrder = 1:length(chosenRows), pathOrder = path.tsp)
  pathOrder <- pathOrder[order(pathOrder$pathOrder),]
  booksLeft$pathOrder[chosenRows] <- pathOrder$originalOrder
}#for i
rm(chosenBooks,i,tsp,tour,path.tsp,pathOrder,chosenRows,authorsLeft)

#Add some more information
booksLeft$id <- 1:nrow(booksLeft)
#Mark my favorite books (most of Brandon, Patrick and JK, some of Terry and Brent)
favs <- c(62,65,58,59,60,61,1,4,2,7,6,258,259,257,541,544,545,129,130,131)
booksLeft$favBook <- 0
booksLeft$favBook[which(booksLeft$id %in% favs)] <- 1
#Mark my favorite authors: Brandon Sanderson, Patrick Rothfuss, J.K. Rowling
favAuthors <- c(7,30,1)
booksLeft$favAuthor <- 0
booksLeft$favAuthor[which(booksLeft$authorRank %in% favAuthors)] <- 1
rm(favs,favAuthors)
#Rounding to save some space
booksLeft$x <- round(booksLeft$x,3)
booksLeft$y <- round(booksLeft$y,3)
#Order on author then path
booksLeft <- booksLeft[order(booksLeft$authorRank, booksLeft$pathOrder),]

#Save the resulting locations to a file
write.csv(booksLeft[,c("id","author","authorRank","title","avg_rating",
                       "num_ratings","publication_year","num_pages",
                       "book_series","numWords","favBook","favAuthor",
                       "x","y","pathOrder")], 
          file="topAuthorBooksLocations.csv", row.names=F, na="")
#Save the top word locations to a file
write.csv(termFrequency, file="topTermLocations.csv", row.names=F, na="")


#Write all
saveRDS(booksLeft, file="booksLeft.rds")
