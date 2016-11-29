#Get the updated locations after dragging the books around to minimize overlap
#and check the results and do the Traveling Salesman again, just to be sure
library(stringr)
library(ggplot2)
library(jsonlite)
library(TSP) #Traveling Salesman Problem

booksLeft <- readRDS("booksLeft.rds")

booksMoved <- fromJSON("topAuthorBooksLocationsMoved.json")
#Remove some not needed columns
booksMoved$publication_year <- booksMoved$num_pages <- 
  booksMoved$book_series <- booksMoved$numWords <- booksMoved$sweepFlag <-
  booksMoved$titleX <- booksMoved$titleY <- booksMoved$newX <- booksMoved$newY <- NULL

#Merge the cleaned title to the data
booksMoved <- merge(booksMoved, booksLeft[,c("id","titleClean")], by="id", all.x=T)

#Plot differences in moved circles
plot(booksLeft$x, booksLeft$y, xlab="", ylab="", xaxt="n", yaxt="n", asp=1, pch=16, cex=0.4, col=rgb(0, 0, 0, 0.5))
points(booksMoved$x, booksMoved$y, pch=16, cex=0.4, col=rgb(1,0,0,0.5))

#Read in the new term positions
termsMoved <- fromJSON("topTermLocationsMoved.json")

#Remove a few terms that have no clear clustering
termsMoved <- termsMoved[-which(termsMoved$term %in% c("body","letter","final","science","sound",
                                                       "emotion","information","moving")),]

#Plot where the books ended up with certain popular terms
par(mfrow=c(2,2))
par(mar=c(1,1,4.1,1))
#for(i in 1:nrow(termsMoved)) {
for(i in 8:11) {
  titlesChosen <- grep(paste0('\\<',termsMoved$term[i],'\\>'), booksMoved$titleClean)
  plot(booksMoved$x, booksMoved$y, main=termsMoved$term[i], 
       xlim=c(-50,50), ylim=c(50,-50), xlab="", ylab="", xaxt="n", yaxt="n", 
       pch=16, cex=0.4, col=rgb(0, 0, 0, 0.5), asp=1)
  points(booksMoved$x[titlesChosen], booksMoved$y[titlesChosen], 
         pch=16, cex=0.6, col=rgb(1, 0, 0))
}#for i
rm(titlesChosen)
par(mfrow=c(1,1))
par(mar=c(5.1,4.1,4.1,2.1))


#Redo travelling salesman now with the moved books
authorsLeft <- unique(booksMoved$authorRank)
booksMoved$pathOrder <- NA
for(i in 1:length(authorsLeft)) {
  chosenRows <- which(booksMoved$authorRank == authorsLeft[i])
  chosenBooks <- booksMoved[chosenRows,]
  
  #Find the shortest path trough thes books
  #http://stackoverflow.com/questions/27363653/find-shortest-path-from-x-y-coordinates-with-start-%E2%89%A0-end
  tsp <- TSP(dist(chosenBooks[,c("x","y")], method = "euclidean"))
  tsp <- insert_dummy(tsp, label = "cut")
  tour <- solve_TSP(tsp, method="2-opt", control=list(rep=10))
  path.tsp <- unname(cut_tour(tour, "cut"))
  #path.tsp
  
  #Attach the route in the right order to the data
  pathOrder <- data.frame(originalOrder = 1:length(chosenRows), pathOrder = path.tsp)
  pathOrder <- pathOrder[order(pathOrder$pathOrder),]
  booksMoved$pathOrder[chosenRows] <- pathOrder$originalOrder
}#for i
rm(chosenBooks,i,tsp,tour,path.tsp,pathOrder,chosenRows,authorsLeft)


#Rounding to save some space
booksMoved$x <- round(booksMoved$x,3)
booksMoved$y <- round(booksMoved$y,3)
#Order on author then path
booksMoved <- booksMoved[order(booksMoved$authorRank, booksMoved$pathOrder),]

#Save the resulting locations to a file
write.csv(booksMoved[,-which(names(booksMoved) %in% c("titleClean"))], file="topAuthorBooksLocationsUpdated.csv", row.names=F, na="")
#Save the top word locations to a file
write.csv(termsMoved, file="topTermLocationsUpdated.csv", row.names=F, na="")
