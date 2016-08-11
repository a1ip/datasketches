setwd("/Volumes/Documents Nadieh-4/Data Visualization/2. D3 works/1. My works/2016 - Data sketches/August 2016 - Olympics/Data")
library(countrycode)

############################################################################################
#################################### 1896 - 2008 ###########################################
############################################################################################

#Save xlsx as UTF-16 then open in text editor and save as utf-8
olympicData <- read.table("Medal data/Summer Olympic medallists 1896 to 2008.txt", header=T, sep="\t", stringsAsFactors = F, quote="")
#olympicData <- read.csv2("Medal data/Summer Olympic medallists 1896 to 2008.csv", stringsAsFactors = F)

#Investigate data
#summary(olympicData)
#table(olympicData$Edition[olympicData$Discipline == "Sailing" & olympicData$Gender == "Women"])
#table(olympicData$Edition[olympicData$Discipline == "Athletics" & olympicData$Gender == "Men"])

#Only keep the gold medals
olympicData <- subset(olympicData, olympicData$Medal == "Gold")
olympicData$Medal <- NULL

#Rename the discipline Canoe / Kayak F to Sprint
olympicData$Discipline[olympicData$Discipline == "Canoe / Kayak F"] <- "Canoe Sprint"
#Rename the discipline Canoe / Kayak S to Slalom
olympicData$Discipline[olympicData$Discipline == "Canoe / Kayak S"] <- "Canoe Slalom"

#4529 unique
############################################################################################
###################################### 2012 London #########################################
############################################################################################

#Add the 2012 data
olympic2012 <- read.table("Medal data/London 2012 gold medal winners.txt", header=T, sep="\t", stringsAsFactors = F, quote="")
#olympic2012 <- read.csv("Medal data/London 2012 gold medal winners.csv", stringsAsFactors = F)

#Put columns in right order
olympic2012$City <- "London"
olympic2012$Edition <- 2012
olympic2012 <- olympic2012[,c("City","Edition","Sport","Discipline","Athlete","NOC","Gender","Event","Event_gender")]

#Paste under the other years
olympicData <- rbind(olympicData, olympic2012)

rm(olympic2012)
#306 unique - 302 events and some mixed/double genders
############################################################################################
###################################### 2016 Brazil #########################################
############################################################################################

#Add the 2016 data
olympic2016 <- read.table("Medal data/Rio 2016 gold medal winners.txt", header=T, sep="\t", stringsAsFactors = F, quote="")
#olympic2016 <- read.csv2("Medal data/Rio 2016 gold medal winners.csv", stringsAsFactors = F)

#Put columns in right order
olympic2016$City <- "Rio de Janeiro"
olympic2016$Edition <- 2016
olympic2016 <- olympic2016[,c("City","Edition","Sport","Discipline","Athlete","NOC","Gender","Event","Event_gender")]

#Paste under the other years
olympicData <- rbind(olympicData, olympic2016)

rm(olympic2016)
#311 unique for now - will become 306
############################################################################################
################################### Make unique on event ###################################
############################################################################################

#Find the duplicates on all columns except athlete - these are the teams
dupColumns <- names(olympicData)[-which(names(olympicData) == "Athlete")]
dups <- duplicated(olympicData[,dupColumns]) | duplicated(olympicData[,dupColumns], fromLast = TRUE)
#Take the duplicated data from the total set
olympicDups <- olympicData[dups,] 
#Make these unique on all by removing athlete - these are the teams
olympicDups$Athlete <- ""
olympicDups <- unique(olympicDups) #1235

#Select the unique rows from the data
olympicData <- olympicData[dups == FALSE,] #3911

#Now paste them back together
olympicData <- rbind(olympicData, olympicDups)

#Order again
olympicData <- olympicData[order(olympicData$Edition, olympicData$Sport, olympicData$Discipline, olympicData$Event),]

#olympicData$Athlete <- stri_trans_general(olympicData$Athlete, "Latin-ASCII")

rm(olympicDups, dups, dupColumns)

#olympicSave <- olympicData

#5146 unique
############################################################################################
####################################### Data check #########################################
############################################################################################

# #Data check: check the number of events per olympic games to see if an event is missing
# #Compare this with information found in the wiki pages like https://en.wikipedia.org/wiki/2012_Summer_Olympics
# #It is now correct / deviations have been consiously chosen and explained in the "Number of events per Olympic game" file
# editions <- unique(olympicData$Edition)
# eventsPerEdition <- NULL
# for (i in 1:length(editions)) {
# 
#   #Make a unique subset of events
#   editionData <- subset(olympicData, olympicData$Edition == editions[i])
#   editionData <- editionData[,c("Sport","Discipline","Event","Event_gender")]
#   editionData <- unique(editionData)
# 
#   eventsPerEdition <- rbind(eventsPerEdition, data.frame(edition = editions[i],
#                                                          numEvents = nrow(editionData),
#                                                          numDisciplines = length(unique(editionData$Discipline)),
#                                                          numSports = length(unique(editionData$Sport)),
#                                                          stringsAsFactors = F))
# }#for i
# rm(i, editions, editionData)

############################################################################################
################################ Attach Olympic Continents #################################
############################################################################################

countryData <- read.csv("Extra data/Olympic country codes.csv", stringsAsFactors = F, na.string = c(""))
#countryData$Country <- NULL

#Had to map the following no-longer used Olympic codes to their current counterparts
#It only has to be approximate so the continent will match
#"ANZ" "EUA" "EUN" "FRG" "GDR" "ROU" "RU1" "TCH" "URS" "YUG" "ZZX"

#ZZX = Mixed Team - will be its own color category
#ANZ = Australasia was mapped to Australia because it is the same olympic continent
#EUN = Unified Team was mapped to Russia because it is the same olympic continent
#TCH = Czechoslovakia was mapped to the Czech Republic because it is the same olympic continent
#URS = Sovjet Union was mapped to Russia because it is the same olympic continent
#YUG = Yugoslavia was mapped to Serbia because it is the same olympic continent

#Merge to the olympic data
olympicData <- merge(olympicData, countryData, by="NOC", all.x = T)

#Attach the continent
olympicData$Continent <- countrycode(olympicData$ISO, "iso2c", "continent")

#The library doesn't do Taiwan (TPE / TW) set this to Asia
olympicData$Continent[which(olympicData$NOC == "TPE")] <- "Asia"
#The library doesn't do Kosovo (KOS / XK) set this to Europe
olympicData$Continent[which(olympicData$NOC == "KOS")] <- "Europe"
#Set the mixed teams to their own "continent"
olympicData$Continent[which(olympicData$NOC == "ZZX")] <- "Mixed"

#Although not designed to represent continents (https://en.wikipedia.org/wiki/Olympic_symbols) 
#I will use the general accepted coloring of:
#Americas - Red
#Europe - Blue
#Africa - Black
#Asia - Yellow
#Oceania - Green

rm(countryData)

############################################################################################
################################### Double medal winners ###################################
############################################################################################

#Get uniques for loops
Ed <- unique(olympicData$Edition)
Di <- unique(olympicData$Discipline)
Ge <- unique(olympicData$Gender[!is.na(olympicData$Gender) & olympicData$Gender != ""])
EG <- unique(olympicData$Event_gender)

#Check which medals where shared between multiple persons from different countries or in mixed gender events
#(if it was from the same country, they are already "uniqued" out and that doesn't mind for our analysis
#since they both (or more) together represent 1 medal for that country)
medalsPerEventTotal <- NULL
for(i in 1:length(Di)) {
  #for(j in 1:length(Ge)) {
    for(k in 1:length(Ed)) {
      for(l in 1:length(EG)) {
        
        #Get the discipline, edition and gender subset from the total data
        sport <- subset(olympicData, olympicData$Discipline == Di[i] & olympicData$Edition == Ed[k] & 
                          olympicData$Event_gender == EG[l])
        
        #Go to the next one if this combination leads to no medals
        if(nrow(sport) == 0) next
        
        #If there is a mixed sport loop through events to see if it was a case of
        #either a woman or a man won, or both a woman and a man won a medal
        if(EG[l] == "X") {
          medalsPerEvent <- NULL
          events <- unique(sport$Event)
          for(m in 1:length(events)) {
            sportEvent <- subset(sport, sport$Event == events[m])
            medalsPerEvent <- rbind(medalsPerEvent, data.frame(Event = events[m], NumMedals = nrow(sportEvent)))
          }#for m
        } else {
          #Find the number of medals per event
          medalsPerEvent <- data.frame(table(sport$Event))
          names(medalsPerEvent) <- c("Event","NumMedals")
        }#else
        
        #Build up data frame
        medalsPerEvent$Edition <- Ed[k]
        medalsPerEvent$Event_gender <- EG[l]
        medalsPerEvent$Discipline <- Di[i]
        
        medalsPerEventTotal <- rbind(medalsPerEventTotal, medalsPerEvent)
      }#for l
    }#for k
  #}#for j
}#for i
rm(i,k,l,m,events,medalsPerEvent,sport,sportEvent)

#Merge it to the total dataset
olympicData <- merge(olympicData, medalsPerEventTotal, by=c("Edition","Discipline","Event","Event_gender"), all = T)
#How much does each medal "count"
olympicData$Value <- 1/olympicData$NumMedals

rm(medalsPerEventTotal)

#Final raw data about gold medallists at the summer olympics
write.csv(olympicData, file = "Summer olympic gold medal count per event - 1986 - 2016.csv", row.names=F, na="")

