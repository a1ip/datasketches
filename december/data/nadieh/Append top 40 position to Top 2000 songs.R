setwd("~/Downloads/Top 2000")
#Web scraper explanation
#https://blog.rstudio.org/2014/11/24/rvest-easy-web-scraping-with-r/
library(rvest)
library(stringr)
library(tidyr)
library(stringdist)

# cleanURLs <- function(DF) {
#   #Get the artist separately
#   DF$artist_from_url <- gsub(".*\\/(.*)\\/.*", "\\1", DF$url)
#   #Remove the possible "-" at the end and number
#   DF$artist_from_url <- gsub("-[[:digit:]]$", "", DF$artist_from_url)
#   
#   #Get the song separately
#   DF$song_from_url <- gsub(".*\\/.*?\\/(.*)", "\\1", DF$url)
#   #Remove the artist part
#   for(i in 1:nrow(DF)) {
#     DF$song_from_url[i] <- gsub(pattern = paste0("^",DF$artist_from_url[i],"-"), replacement = "", DF$song_from_url[i])
#   }
#   #Remove the possible "-" at the end and number
#   DF$song_from_url <- gsub("-[0-9]*$", "", DF$song_from_url)
#   
#   #Replace all the "-"
#   DF$song_from_url <- gsub("-", " ", DF$song_from_url)
#   DF$artist_from_url <- gsub("-", " ", DF$artist_from_url)
#   
#   return (DF)
# }#function cleanURLs

cleanArtistSongs <- function(variable) {
  #Convert all to lower 
  variable <- tolower(variable)
  #Replace & with and
  variable <- gsub("&", "and", variable)
  #Featuring vs ft
  variable <- gsub("featuring", "ft", variable)
  #Replace '
  variable <- gsub("'", "", variable)
  #Replace .
  variable <- gsub("\\.([a-z])", "\\1", variable)
  variable <- gsub("\\. ", " ", variable)
  #Remove everything between ( )
  variable <- gsub("\\(.*\\)", "", variable)
  variable <- gsub("\\[.*\\]", "", variable)
  #Replace stuff
  variable <- gsub("[[:punct:]]", " ", variable)
  #Replace weird space thing
  variable <- gsub(" ", " ", variable)
  #Remove multiple spaces
  variable <- gsub(" +", " ", variable)
  variable <- str_trim(variable)
  
  return (variable)
}#function cleanArtistSongs


manualMatch <- function(top2000_unknown, rank, id, topData = bestSongDF, type = "top40") {
  found <- which(topData$id == id)
  pos <- which(top2000_unknown$rank == rank)
  if(length(pos) == 0) return (top2000_unknown)
  
  top2000_unknown$bestRank[pos] <- topData$bestRank[found]
  top2000_unknown$year[pos] <- topData$year[found]
  top2000_unknown$week[pos] <- topData$week[found]
  top2000_unknown$numWeeksBest[pos] <- topData$numWeeksBest[found]
  if(type == "top40") { 
    top2000_unknown$numWeeks[pos] <- topData$numWeeksTop40[found]
  } else {
    top2000_unknown$numWeeks[pos] <- topData$numWeeksTip[found]
  }
  top2000_unknown$url[pos] <- topData$url[found]
  
  return (top2000_unknown)
}#function manualMatch

# ##############################################################################
# ########################### Top 2500 all time ################################
# ##############################################################################
# Wasn't enough
# #https://www.top40.nl/bijzondere-lijsten/top-2500?page=1
# numPages <- 10
# songList <- NULL
# for(i in 1:numPages) {
#   url <- paste('https://www.top40.nl/bijzondere-lijsten/top-2500?page=',i,sep="")
#   webpage <- read_html(url)
#   
#   #Get the 2500 songs
#   songListPage <- webpage %>%
#     html_nodes(".titlecredit-wrapper.pull-left a") %>%
#     html_attr("href")
#   songListPage <- unique(songListPage)
#   songListPage <- songListPage[which(!is.na(songListPage))]
#   
#   songList <- append(songList, songListPage)
# }#for i
# #save the list
# songListDF <- data.frame(url = songList, stringsAsFactors = F)
# rm(songList, songListPage, webpage, url, numPages)
# 
# #Clean the data
# songs2500DF <- cleanURLs(songListDF)
# 
# ##############################################################################
# ############################ Top 100 per year ################################
# ##############################################################################
# Wasn't enough
# #https://www.top40.nl/bijzondere-lijsten/top-100-jaaroverzichten/2015
# songList <- NULL
# for(i in 1965:2015) {
#   url <- paste('https://www.top40.nl/bijzondere-lijsten/top-100-jaaroverzichten/',i,sep="")
#   webpage <- read_html(url)
#   
#   #Get the 100 songs
#   songListPage <- webpage %>%
#     html_nodes(".titlecredit-wrapper.pull-left a") %>%
#     html_attr("href")
#   songListPage <- unique(songListPage)
#   songListPage <- songListPage[which(!is.na(songListPage))]
#   
#   songList <- append(songList, songListPage)
# }#for i
# #save the list
# songListDF <- data.frame(url = songList, stringsAsFactors = F)
# rm(songList, songListPage, webpage, url)
# 
# #Make unique
# songs100DF <- unique(songs100DF)
# #Clean the data
# songs100DF <- cleanURLs(songListDF)

##############################################################################
########################## Top 40 per week per year ##########################
##############################################################################
#
#Only had to be done once, took about an hour
# songList <- NULL
# #Loop over all possible years and weeks
# for(i in 1965:2016) {
#   print(paste("Starting on year: ", i))
#   for(j in 1:53) {
#     #https://www.top40.nl/top40/2012/week-10
#     url <- paste('https://www.top40.nl/top40/',i,'/week-',j,sep="")
#     webpage <- tryCatch(read_html(url), warning = function(w) { return (NA)}, 
#                       error = function(e) { return (NA)})
#     #Continue of the website doesn't exist
#     if(is.na(webpage[1])) {
#       print(paste("failed: ",i,"week:",j))
#       gc()
#       next
#     }#if
#   
#     num <- 40
#     
#     #Get the song title
#     songTitle <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left .title") %>%
#       html_text()
#  
#     #Get the artist name 
#     songArtist <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left .credit") %>%
#       html_text()
#     
#     #Get the top 40 songs
#     songURL <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left a") %>%
#       html_attr("href")
#     songURL <- songURL[which(!is.na(songURL))]
#     songURL <- unique(songURL)
#     
#     #Save new info
#     songList <- rbind(songList, data.frame(rank = 1:num, year = rep(i,num), week = rep(j, num), 
#                                            artist = songArtist[1:num], title = songTitle[1:num],
#                                            url = songURL[1:num], stringsAsFactors = F))
#   }#for j
# }#for i
# #save the data
# songListDF <- songList
# saveRDS(songListDF, file="All top 40 weeks.rds")
# rm(songList, webpage, url, songTitle, songArtist, songURL, num, i, j)

#Read the saved data from above back in
songListDF <- readRDS("All top 40 weeks.rds")

# #Get the highest rank per song - url makes unique?
# songs <- unique(songListDF$url)
# bestSongDF <- NULL
# for (i in 1:length(songs)) {
#   songData <- songListDF[which(songListDF$url == songs[i]),]
#   if(length(songData) == 0) {
#     stop("songs not found")
#   }#if
#   bestRank <- min(songData$rank)
#   #Which year was that highest rank (for the 1st time)
#   firstTime <- songData[which(songData$rank == bestRank),]
#   #Save info in new df
#   bestSongDF <- rbind(bestSongDF, data.frame(bestRank = bestRank, year = firstTime$year[1], week = firstTime$week[1], 
#                                              numWeeksBest = nrow(firstTime), numWeeksTop40 = nrow(songData),
#                                              artiest = songData$artist[1], titel = songData$title[1],
#                                              url = songs[i], stringsAsFactors = F))
#   
#   if(i%%1000 == 0) print(i)
# }#for i
# rm(songData, bestRank, firstTime, i, songs)
# saveRDS(bestSongDF, file="Unique top 40 songs.rds")

bestSongDF <- readRDS("Unique top 40 songs.rds")
bestSongDF$id <- 1:nrow(bestSongDF)

#Clean the data
bestSongDF$artist <- cleanArtistSongs(bestSongDF$artiest)
bestSongDF$song <- cleanArtistSongs(bestSongDF$titel)

##############################################################################
########################## Prepare top 2000 data #############################
##############################################################################

#Read in the top 2000 data
top2000 <- read.table("TOP-2000-2016.txt", stringsAsFactors = F, header=T, sep="\t", quote="")
top2000 <- top2000[order(top2000$rank),]
top2000 <- top2000[,c("rank","titel","artiest","jaar")]

#Clean up artist and song title
top2000$artist <- cleanArtistSongs(top2000$artiest)
top2000$song <- cleanArtistSongs(top2000$titel)

##############################################################################
########################### Merge to top 2000 ################################
##############################################################################

#Try to merge on artist + song exact match
top2000 <- merge(top2000, bestSongDF[,c("bestRank","year","week","numWeeksBest","numWeeksTop40","artist","url","song")], by=c("artist","song"), all.x=T)
round(sum(is.na(top2000$url))/nrow(top2000)*100,2)

#A few duplicated
#which(duplicated(top2000$rank))
#Remove
top2000 <- top2000[-c(270, 696, 1244, 1337, 1646, 1784, 1785),]

#Take all songs that don't yet have a url
top2000_known <- top2000[which(!is.na(top2000$url)),]
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000[which(is.na(top2000$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

#Try to see if there's a match of the top 2000 title in the song or artist in each other
for(i in 1:nrow(top2000_unknown)) {
  matchesSong <- grep(top2000_unknown$song[i], bestSongDF$song, ignore.case = T)
  if(length(matchesSong) > 0) {
    matchesArtist <- grep(top2000_unknown$artist[i], bestSongDF$artist[matchesSong], ignore.case = T)
    if(length(matchesArtist) > 0) {
      if(length(matchesArtist) > 1) {
        print(i)
      }
      #Choose the oldest one, thus the 1st
      found <- matchesSong[matchesArtist[1]]
      #Manual fix for Alicia Keys
      if(top2000_unknown$rank[i] == 221) found <- matchesSong[matchesArtist[2]]
      
      top2000_unknown$url[i] <- bestSongDF$url[found]
      top2000_unknown$bestRank[i] <- bestSongDF$bestRank[found]
      top2000_unknown$year[i] <- bestSongDF$year[found]
      top2000_unknown$week[i] <- bestSongDF$week[found]
      top2000_unknown$numWeeksBest[i] <- bestSongDF$numWeeksBest[found]
      top2000_unknown$numWeeksTop40[i] <- bestSongDF$numWeeksTop40[found]
    }#if
  }#if
}#for i
rm(matchesArtist, matchesSong, found, i)

#Manual - remove wrong matches
wrong <- c(10,19,126,193)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeksTop40")] <- NA 

#Take all songs that don't yet have a url
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

#Also do it the other way around
for(i in 1:nrow(bestSongDF)) {
  matchesSong <- grep(bestSongDF$song[i], top2000_unknown$song, ignore.case = T)
  if(length(matchesSong) > 0) {
    matchesArtist <- grep(bestSongDF$artist[i], top2000_unknown$artist[matchesSong], ignore.case = T)
    if(length(matchesArtist) > 0) {
      if(length(matchesArtist) > 1) {
        print(i)
      }
      #Choose the oldest one, thus the 1st
      found <- matchesSong[matchesArtist[1]]
      
      top2000_unknown$bestRank[found] <- bestSongDF$bestRank[i]
      top2000_unknown$year[found] <- bestSongDF$year[i]
      top2000_unknown$week[found] <- bestSongDF$week[i]
      top2000_unknown$numWeeksBest[found] <- bestSongDF$numWeeksBest[i]
      top2000_unknown$numWeeksTop40[found] <- bestSongDF$numWeeksTop40[i]
      top2000_unknown$url[found] <- bestSongDF$url[i]
    }#if
  }#if
}#for i
rm(matchesArtist, matchesSong, found, i)

#Manual - remove wrong matches
wrong <- c(236,399,893,1884)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeksTop40")] <- NA 

#Take all songs that don't yet have a url
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

##############################################################################
############################# Fuzzy matching #################################
##############################################################################

#For example: dont stop till you get enough / dont stop til you get enough

for(i in 1:nrow(top2000_unknown)) {
  distanceSong <- stringdist(top2000_unknown$song[i], bestSongDF$song, method="dl")
  #Choose the ones that need < X changes
  possibleSong <- which(distanceSong < 3)
  if(length(possibleSong) > 0) {
    #check the artists
    distanceArtist <- stringdist(top2000_unknown$artist[i], bestSongDF$artist[possibleSong], method="dl")
    possibleArtist <- which(distanceArtist < 3)
    if(length(possibleArtist) > 0) {
      if(length(possibleArtist) > 1) {
        print(i)
      }
      #Choose the best matching one
      #Add up the changes in song and artist
      totalDist <- distanceArtist[possibleArtist] + distanceSong[possibleSong[possibleArtist]]
      #Which is the smallest
      smallest <- which.min(totalDist)
      #And choose that one
      found <- possibleSong[possibleArtist[smallest[1]]]
      
      top2000_unknown$bestRank[i] <- bestSongDF$bestRank[found]
      top2000_unknown$year[i] <- bestSongDF$year[found]
      top2000_unknown$week[i] <- bestSongDF$week[found]
      top2000_unknown$numWeeksBest[i] <- bestSongDF$numWeeksBest[found]
      top2000_unknown$numWeeksTop40[i] <- bestSongDF$numWeeksTop40[found]
      top2000_unknown$url[i] <- bestSongDF$url[found]
    }#if
  }#if
}#for i
rm(distanceSong, possibleSong, distanceArtist, possibleArtist, found, totalDist, smallest, i)

#Manual - remove wrong matches
wrong <- c(893)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeksTop40")] <- NA 

#Take all songs that don't yet have a url
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

#These found are all top40
top2000_known$type <- "top40"
#Rename one variable
top2000_known$numWeeks <- top2000_known$numWeeksTop40
top2000_known$numWeeksTop40 <- NULL

##############################################################################
######################### Tipparade per week per year ########################
##############################################################################

#See if the remaining songs at least made the tipparade...

# #Only had to be done once
# songList <- NULL
# #Loop over all possible years and weeks
# for(i in 1967:2016) {
#   print(paste("Starting on year: ", i))
#   for(j in 1:53) {
#     #It started in week 28 of 1967
#     if(i == 1967 & j < 28) next
#     #https://www.top40.nl/tipparade/2012/week-10
#     url <- paste('https://www.top40.nl/tipparade/',i,'/week-',j,sep="")
#     webpage <- tryCatch(read_html(url), warning = function(w) { return (NA)},
#                       error = function(e) { return (NA)})
#     #Continue of the website doesn't exist
#     if(is.na(webpage[1])) {
#       print(paste("failed: ",i,"week:",j))
#       gc()
#       next
#     }#if
# 
#     #Before 1969 week 38 there were only 20 songs in the tipparade
#     if(i < 1969 | (i == 1969 & j < 38)) {
#       num <- 20
#     } else {
#       num <- 30
#     }#else
# 
#     #Get the song title
#     songTitle <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left .title") %>%
#       html_text()
# 
#     #Get the artist name
#     songArtist <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left .credit") %>%
#       html_text()
# 
#     #Get the top 40 songs
#     songURL <- webpage %>%
#       html_nodes(".titlecredit-wrapper.pull-left a") %>%
#       html_attr("href")
#     songURL <- songURL[which(!is.na(songURL))]
#     songURL <- unique(songURL)
# 
#     #Save new info
#     songList <- rbind(songList, data.frame(rank = 1:num, year = rep(i,num), week = rep(j, num),
#                                            artist = songArtist[1:num], title = songTitle[1:num],
#                                            url = songURL[1:num], stringsAsFactors = F))
#   }#for j
# }#for i
# #save the data
# tipListDF <- songList
# saveRDS(tipListDF, file="All tipparade weeks.rds")
# rm(songList, webpage, url, songTitle, songArtist, songURL, num, i, j)

#Read the saved data from above back in
tipListDF <- readRDS("All tipparade weeks.rds")

# #Make the tip hits unique and save some extra info about it
# tips <- unique(tipListDF$url)
# bestTipDF <- NULL
# for (i in 1:length(tips)) {
#   songData <- tipListDF[which(tipListDF$url == tips[i]),]
#   if(length(songData) == 0) {
#     stop("songs not found")
#   }#if
#   bestRank <- min(songData$rank)
#   #Which year was that highest rank (for the 1st time)
#   firstTime <- songData[which(songData$rank == bestRank),]
#   #Save info in new df
#   bestTipDF <- rbind(bestTipDF, data.frame(bestRank = bestRank, year = firstTime$year[1], week = firstTime$week[1], 
#                                              numWeeksBest = nrow(firstTime), numWeeksTip = nrow(songData),
#                                              artiest = songData$artist[1], titel = songData$title[1],
#                                              url = tips[i], stringsAsFactors = F))
#   
#   if(i%%1000 == 0) print(i)
# }#for i
# rm(songData, bestRank, firstTime, i, tips)
# saveRDS(bestTipDF, file="Unique tipparade songs.rds")

bestTipDF <- readRDS("Unique tipparade songs.rds")
bestTipDF$id <- 1:nrow(bestTipDF)

#Clean the data
bestTipDF$artist <- cleanArtistSongs(bestTipDF$artiest)
bestTipDF$song <- cleanArtistSongs(bestTipDF$titel)

##############################################################################
########################### Merge to top 2000 ################################
##############################################################################

top2000_unknown$bestRank <- top2000_unknown$year <- top2000_unknown$week <- 
  top2000_unknown$numWeeksBest <- top2000_unknown$numWeeksTop40 <- top2000_unknown$url <- NULL
#Try to merge on artist + song exact match
top2000_unknown <- merge(top2000_unknown, bestTipDF[,c("bestRank","year","week","numWeeksBest","numWeeksTip","artist","url","song")], by=c("artist","song"), all.x=T)
round(sum(is.na(top2000_unknown$url))/nrow(top2000_unknown)*100,2)

#Mark as found from tipparade
top2000_unknown$type <- ""
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "tip"
#Rename variable to match top40
top2000_unknown$numWeeks <- top2000_unknown$numWeeksTip
top2000_unknown$numWeeksTip <- NULL

#Take all songs that don't yet have a url
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

#Try to see if there's a match of the top 2000 title in the song or artist in each other
for(i in 1:nrow(top2000_unknown)) {
  matchesSong <- grep(top2000_unknown$song[i], bestTipDF$song, ignore.case = T)
  if(length(matchesSong) > 0) {
    matchesArtist <- grep(top2000_unknown$artist[i], bestTipDF$artist[matchesSong], ignore.case = T)
    if(length(matchesArtist) > 0) {
      if(length(matchesArtist) > 1) {
        print(i)
      }
      #Choose the oldest one, thus the 1st
      found <- matchesSong[matchesArtist[1]]
      
      top2000_unknown$url[i] <- bestTipDF$url[found]
      top2000_unknown$bestRank[i] <- bestTipDF$bestRank[found]
      top2000_unknown$year[i] <- bestTipDF$year[found]
      top2000_unknown$week[i] <- bestTipDF$week[found]
      top2000_unknown$numWeeksBest[i] <- bestTipDF$numWeeksBest[found]
      top2000_unknown$numWeeks[i] <- bestTipDF$numWeeksTip[found]
    }#if
  }#if
}#for i
rm(matchesArtist, matchesSong, found, i)

#Manual - remove wrong matches
wrong <- c(10,19,1160)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeks")] <- NA 

#Take all songs that don't yet have a url
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "tip"
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

#Also do it the other way around
for(i in 1:nrow(bestTipDF)) {
  matchesSong <- grep(bestTipDF$song[i], top2000_unknown$song, ignore.case = T)
  if(length(matchesSong) > 0) {
    matchesArtist <- grep(bestTipDF$artist[i], top2000_unknown$artist[matchesSong], ignore.case = T)
    if(length(matchesArtist) > 0) {
      if(length(matchesArtist) > 1) {
        print(i)
      }
      #Choose the oldest one, thus the 1st
      found <- matchesSong[matchesArtist[1]]

      top2000_unknown$url[found] <- bestTipDF$url[i]      
      top2000_unknown$bestRank[found] <- bestTipDF$bestRank[i]
      top2000_unknown$year[found] <- bestTipDF$year[i]
      top2000_unknown$week[found] <- bestTipDF$week[i]
      top2000_unknown$numWeeksBest[found] <- bestTipDF$numWeeksBest[i]
      top2000_unknown$numWeeks[found] <- bestTipDF$numWeeksTip[i]

    }#if
  }#if
}#for i
rm(matchesArtist, matchesSong, found, i)

#Manual - remove wrong matches
wrong <- c(236, 612, 772, 893, 1806, 1884)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeks")] <- NA 

#Take all songs that don't yet have a url
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "tip"
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

##############################################################################
############################# Fuzzy matching #################################
##############################################################################

#For example: dont stop till you get enough / dont stop til you get enough

for(i in 1:nrow(top2000_unknown)) {
  distanceSong <- stringdist(top2000_unknown$song[i], bestTipDF$song, method="dl")
  #Choose the ones that need < X changes
  possibleSong <- which(distanceSong < 3)
  if(length(possibleSong) > 0) {
    #check the artists
    distanceArtist <- stringdist(top2000_unknown$artist[i], bestTipDF$artist[possibleSong], method="dl")
    possibleArtist <- which(distanceArtist < 3)
    if(length(possibleArtist) > 0) {
      if(length(possibleArtist) > 1) {
        print(i)
      }
      #Choose the best matching one
      #Add up the changes in song and artist
      totalDist <- distanceArtist[possibleArtist] + distanceSong[possibleSong[possibleArtist]]
      #Which is the smallest
      smallest <- which.min(totalDist)
      #And choose that one
      found <- possibleSong[possibleArtist[smallest[1]]]
      
      top2000_unknown$bestRank[i] <- bestTipDF$bestRank[found]
      top2000_unknown$year[i] <- bestTipDF$year[found]
      top2000_unknown$week[i] <- bestTipDF$week[found]
      top2000_unknown$numWeeksBest[i] <- bestTipDF$numWeeksBest[found]
      top2000_unknown$numWeeks[i] <- bestTipDF$numWeeksTip[found]
      top2000_unknown$url[i] <- bestTipDF$url[found]
    }#if
  }#if
}#for i
rm(distanceSong, possibleSong, distanceArtist, possibleArtist, found, totalDist, smallest, i)

#Manual - remove wrong matches
wrong <- c(893)
top2000_unknown[which(top2000_unknown$rank %in% wrong),c("url","bestRank","year","week","numWeeksBest","numWeeks")] <- NA 

#Take all songs that don't yet have a url
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "tip"
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

##############################################################################
############################## Manual links ##################################
##############################################################################

#Not found Top 2000 vs Top 40:
#top2000_unknown <- manualMatch(top2000_unknown, rank Top 2000, id Top 40) 

#Pastorale | Ramses Shaffy & Liesbeth List vs Pastorale | Liesbeth List met Ramses Shaffy
top2000_unknown <- manualMatch(top2000_unknown, 69, 1191) 
  
#Window Of My Eyes | Cuby & The Blizzards vs Window of my eyes | Cuby + Blizzards
top2000_unknown <- manualMatch(top2000_unknown, 259, 909) 

#Laat Me (Vivre) | Ramses Shaffy & Liesbeth List & Alderliefste vs Laat me | ramses shaffy alderliefste met ramses shaffy en liesbeth list ramses shaffy alderliefste met ramses shaffy en liesbeth list
top2000_unknown <- manualMatch(top2000_unknown, 351, 3858)

#Time To Say Goodbye | Andrea Bocelli & Sarah Brightman vs Time to say goodbye a tribute to henry maske | Sarah Brightman & Andrea Bocelli
top2000_unknown <- manualMatch(top2000_unknown, 828, 9245)

#Zonder Jou | Paul De Leeuw & Simone Kleinsma vs Zonder jou | Simone Kleinsma - Duet met Paul De Leeuw
top2000_unknown <- manualMatch(top2000_unknown, 692, 8947)

#Droomland | Paul De Leeuw & André Hazes vs Droomland | André Hazes en Paul De Leeuw
top2000_unknown <- manualMatch(top2000_unknown, 1015, 8285)

#One (2005) | U2 & Mary J. Blige vs One | Mary J Blige and U2
top2000_unknown <- manualMatch(top2000_unknown, 236, 11579)

#Tonight | Tina Turner & David Bowie vs Tonight - live | Tina Turner - Duet with David Bowie
top2000_unknown <- manualMatch(top2000_unknown, 612, 6880)

#Numb/Encore | Linkin Park & Jay Z vs Numb/encore | Jay-Z & Linkin Park
top2000_unknown <- manualMatch(top2000_unknown, 772, 11231)

#This Is Not America | David Bowie & Pat Metheny Group vs 
top2000_unknown <- manualMatch(top2000_unknown, 491, 5741)

#Can't Stop The Feeling | Justin Timberlake vs Can't stop the feeling! | JT
top2000_unknown <- manualMatch(top2000_unknown, 363, 13587)

#Mirrors | Justin Timberlake vs Mirrors | JT
top2000_unknown <- manualMatch(top2000_unknown, 1099, 13065)

#Just Give Me A Reason | P!nk & Nate Ruess vs Just give me a reason | p!nk featuring nate ruess
top2000_unknown <- manualMatch(top2000_unknown, 562, 13043)

#Boogie Wonderland | Earth Wind & Fire feat. The Emotions vs Boogie wonderland | Earth Wind & Fire with The Emotions
top2000_unknown <- manualMatch(top2000_unknown, 595, 4025)

#Waterloo | ABBA vs Waterloo | Björn, Benny Anna & Frida (ABBA)
top2000_unknown <- manualMatch(top2000_unknown, 742, 2540)

#Where The Wild Roses Grow | Nick Cave & Kylie Minogue vs Where the wild roses grow | Nick Cave and The Bad Seeds + Kylie Minogue
top2000_unknown <- manualMatch(top2000_unknown, 934, 8902)

#When Love Comes To Town | U2 & B.B. King vs U2 with B.B. King | When love comes to town
top2000_unknown <- manualMatch(top2000_unknown, 954, 6963)

#Can't Hold Us | Macklemore & Ryan Lewis vs Can't hold us | macklemore x ryan lewis
top2000_unknown <- manualMatch(top2000_unknown, 975, 13087)

#Peter Gunn Theme | Emerson Lake & Palmer vs Peter gunn | ELP : Emerson, Lake & Palmer
top2000_unknown <- manualMatch(top2000_unknown, 992, 4368)

#Titanium | David Guetta & Sia vs Titanium | David Guetta feat. Sia
top2000_unknown <- manualMatch(top2000_unknown, 1008, 12771)

#Vluchten Kan Niet Meer | Frans Halsema & Jenny Arean vs Vluchten kan niet meer | Jenny Arean en Frans Halsema
top2000_unknown <- manualMatch(top2000_unknown, 1139, 3593)

#The Living Years | Mike & The Mechanics vs The living years | M1ke + The MeChaN1C5
top2000_unknown <- manualMatch(top2000_unknown, 1168, 6926)

#Appleknockers Flophouse | Cuby & The Blizzards vs Appleknockers flophouse | Cuby + The Blizzards
top2000_unknown <- manualMatch(top2000_unknown, 1232, 1224)

#Hall Of Fame | The Script & will.i.am vs Hall of fame | the script feat. will.i.am
top2000_unknown <- manualMatch(top2000_unknown, 1270, 12965)

#Une Belle Histoire | Paul de Leeuw & Alderliefste vs Une belle histoire - een mooi verhaal | Alderliefste & Paul De Leeuw
top2000_unknown <- manualMatch(top2000_unknown, 1290, 11656)

#Lucky Man | Emerson Lake & Palmer vs Lucky man | E.L.P.
top2000_unknown <- manualMatch(top2000_unknown, 1304, 1588)

#Same Love | Macklemore & Ryan Lewis vs Same love | Macklemore x Ryan Lewis featuring Mary Lambert
top2000_unknown <- manualMatch(top2000_unknown, 1340, 13144)

#Lean On | Major Lazor & DJ Snake Feat Mo Lean on | Major Lazer x DJ Snake feat. Mø
top2000_unknown <- manualMatch(top2000_unknown, 1443, 13411)

#Easy Lover | Phil Collins & Philip Bailey vs Easy lover | Philip Bailey - Duet with Phil Collins
top2000_unknown <- manualMatch(top2000_unknown, 1508, 5713)

#California Love | 2Pac & Dr. Dre vs California love | 2Pac featuring Dr Dre
top2000_unknown <- manualMatch(top2000_unknown, 1523, 9018)

#You Don't Bring Me Flowers | Barbra Streisand & Neil Diamond vs You don't bring me flowers | Barbra & Neil
top2000_unknown <- manualMatch(top2000_unknown, 1532, 3896)

#Blurred Lines | Robin Thicke Feat. Pharrell vs Blurred lines | robin thicke feat. t.i. + pharrell
top2000_unknown <- manualMatch(top2000_unknown, 1543, 13092)

#Forever Autumn | Jeff Wayne & Justin Hayward vs Forever autumn | Jeff Wayne featuring Justin Hayward
top2000_unknown <- manualMatch(top2000_unknown, 1579, 3871)

#Niggas In Paris | Kanye West & Jay Z vs Niggas in paris | jay z & kanye west
top2000_unknown <- manualMatch(top2000_unknown, 1675, 12944)

#I Got You Babe | UB40 & Chrissie Hynde vs I got you babe | UB40 - Guest Vocals By Chrissie Hynde
top2000_unknown <- manualMatch(top2000_unknown, 1930, 5883)

#After The Love Has Gone | Earth Wind & Fire vs After the love has gone | Earth, Wind v Fire
top2000_unknown <- manualMatch(top2000_unknown, 1991, 4101)

#Moves Like Jagger | Maroon 5 & Christina Aguilera vs Moves like jagger | Maroon 5 featuring Christina Aguilera
top2000_unknown <- manualMatch(top2000_unknown, 1999, 12748)

# #Manually check for perfect title match
# for(i in 1:nrow(top2000_unknown)) {
#   matchesSong <- grep(top2000_unknown$song[i], bestSongDF$song, ignore.case = T)
#   if(length(matchesSong) > 0) {
#     print(paste("Top 2000:", top2000_unknown$artiest[i], top2000_unknown$titel[i]))
#     print("Top 40:")
#     print(paste(bestSongDF$artiest[matchesSong], bestSongDF$titel[matchesSong]))
#   }#if
# }#for i

#Seven Nation Army | The White Stripes vs 7 nation army | The White Stripes
top2000_unknown <- manualMatch(top2000_unknown, 137, 10826)

#Get Back | The Beatles vs Get back | Beatles featuring Billy Preston
top2000_unknown <- manualMatch(top2000_unknown, 816, 1066)

#Il Volo | Zucchero Fornaciari vs Il volo | Zucchero Sugar Fornaciari
top2000_unknown <- manualMatch(top2000_unknown, 1157, 9159)

#Senza Una Donna | Zucchero Fornaciari vs Senza una donna | Zucchero Sugar Fornaciari
top2000_unknown <- manualMatch(top2000_unknown, 1273, 6654)

#Don't Leave Me This Way | The Communards vs Don't leave me this way | Communards with Sarah Jane Morris
top2000_unknown <- manualMatch(top2000_unknown, 1366, 6205)

#Sky And Sand | Paul Kalkbrenner vs Sky and sand | Paul & Fritz Kalkbrenner
top2000_unknown <- manualMatch(top2000_unknown, 1410, 12294)

#Traffic | Dj Tiesto vs Traffic | Tiësto
top2000_unknown <- manualMatch(top2000_unknown, 1558, 10921)

#Bombay | Golden Earring vs G. Earring | Bombay
top2000_unknown <- manualMatch(top2000_unknown, 1826, 3331)

#Laat Het Los | Van Dik Hout vs Laat het los - live op lowlands | Vandikhout
top2000_unknown <- manualMatch(top2000_unknown, 1883, 9196)

#Take all songs that don't yet have a url
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "top40"
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

# #Manually check for perfect title match
# for(i in 201:nrow(top2000_unknown)) {
#   matchesSong <- grep(top2000_unknown$song[i], bestTipDF$song, ignore.case = T)
#   if(length(matchesSong) > 0) {
#     print(paste("Top 2000:", top2000_unknown$artiest[i], top2000_unknown$titel[i]))
#     print("Tip:")
#     print(paste(bestTipDF$artiest[matchesSong], bestTipDF$titel[matchesSong]))
#   }#if
# }#for i

#Personal Jesus | Depeche Mode vs Personal jesus | DM
top2000_unknown <- manualMatch(top2000_unknown, 1052, 10625, topData = bestTipDF, type = "tip")

#Guitar Man | Elvis Presley vs Guitar man | Elvis
top2000_unknown <- manualMatch(top2000_unknown, 1806, 294, topData = bestTipDF, type = "tip")

#Take all songs that don't yet have a url
top2000_unknown$type[!is.na(top2000_unknown$url)] <- "tip"
top2000_known <- rbind(top2000_known, top2000_unknown[which(!is.na(top2000_unknown$url)),])
top2000_known <- top2000_known[order(top2000_known$rank),]
top2000_unknown <- top2000_unknown[which(is.na(top2000_unknown$url)),]
top2000_unknown <- top2000_unknown[order(top2000_unknown$rank),]

##############################################################################
########################## Bring back together ###############################
##############################################################################

top2000_final <- rbind(top2000_known, top2000_unknown)
top2000_final <- top2000_final[order(top2000_final$rank),]

#Final clean up
top2000_final$artist <- top2000_final$song <- top2000_final$url <- NULL
names(top2000_final) <- c("rank","title","artist","releaseYear","listHighestRank","listYear","listWeek",
                          "listNumWeeksBest","listType","listNumWeeks")

#Write to file
write.csv(top2000_final[,c("rank","artist","title","releaseYear","listHighestRank","listYear","listWeek",
                           "listNumWeeksBest","listNumWeeks","listType")], file = "top2000_2016.csv", row.names = F, na="")


##############################################################################
################################ Final info ##################################
##############################################################################

#Oldest song
top2000_final[which.min(top2000_final$releaseYear),]
#1989 | Strange Fruit | Billie Holiday

#Most common artist
sort(table(top2000_final$artist), decreasing = T)[1:10]
#The Beatles with 38 songs

#Highest song released in 2016
top2000_final[which(top2000_final$releaseYear == 2016)[1],]
#363 | Can't Stop The Feeling | Justin Timberlake

#Starman van David Bowie is de hoogste nieuwe binnenkomer in de NPO Radio 2 Top 2000. Het nummer uit 1972 staat op plaats 270
top2000_final[270,]

#Highest rising song: When We Were Young van Adele stijgt maar liefst 1559 plaatsen: van 1703 naar 144
top2000_final[144,]
#Metallica zorgt voor de op één na hoogste nieuwkomer in de Top 2000 met 'The Unforgiven', een hit uit 1991

#Er is dit jaar massaal op overleden muzikale helden gestemd. David Bowie staat met acht nummers meer dan vorig jaar 
#in de lijst (van achttien naar zesentwintig) met 'Heroes' op 7 als hoogste notering. Prince heeft dit jaar zeventien 
#noteringen, waarvan zeven nieuwe binnenkomers. 'Purple Rain' van Prince & The Revolution staat op nummer 13. 
#Het aantal nummers van Leonard Cohen in de Top 2000 is verdubbeld van drie naar zes met 'Hallelujah' op plaats 29

#David Bowie
DB <- grep("David Bowie", top2000_final$artist, ignore.case = T)
top2000_final[DB,]
#Voor het eerst in de geschiedenis van de Top 2000 belandt Bowie in de top 10, 
#met Heroes, dat voorheen nooit hoger kwam dan nummer 34.

#Prince
PR <- grep("Prince", top2000_final$artist, ignore.case = T)
top2000_final[PR,]
#Net als in voorgaande jaren is Purple Rain de hoogst genoteerde plaat van Prince. 
#Dit jaar stijgt de filmhit van nummer 62 naar nummer 13

#Pokemon - Vorig jaar kwam het energieke liedje binnen op nummer 1.666 en in 2016 stijgt 
#het plaatje 1.434 plekken en komt dus terecht op nummer 232
top2000_final[232,]

#http://www.nporadio2.nl/nieuws/13585/stijgers-dalers-en-re-entries-in-top-2001

