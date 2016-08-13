setwd("/Volumes/Documents Nadieh-5/Data Visualization/2. D3 works/1. My works/2016 - Data sketches/August 2016 - Olympics/Data")
library(gdata)
library(dplyr)

#Read in the cleaned and prepared olympic gold data
olympicData <- read.csv("Summer olympic gold medal count per event - 1986 - 2016.csv", stringsAsFactors = F)

# ############################################################################################
# ################################ Number of Degrees per Medal ###############################
# ############################################################################################
# 
# #Extra analysis to find the maximum number of medals that could ever be received for one discipline
# #Needed to know how many degrees each medal will get in the feathers and how many medals will "fit"
# #in one tail/circle of feathers
# maxPerDiscipline <- NULL
# Di <- unique(olympicData$Discipline)
# Ge <- unique(olympicData$Gender[!is.na(olympicData$Gender) & olympicData$Gender != ""])
# for(i in 1:length(Di)) {
# 
#   disciplineData <- subset(olympicData, olympicData$Discipline == Di[i])
#   
#   maxWomen <- 0
#   maxMen <- 0
#   for(j in 1:length(Ge)) {
# 
#     #Get the discipline and gender subset from the total data
#     sport <- subset(disciplineData, disciplineData$Gender == Ge[j])
# 
#     maxSport <- 0
#     if(nrow(sport) > 0) maxSport <- max( tapply(sport$Value, sport$Edition, sum) )
# 
#     if(Ge[j] == "Men") {
#       maxMen <- maxSport
#     } else {
#       maxWomen <- maxSport
#     }
#   }#for j
#   maxTotal <- max(maxMen, maxWomen)
# 
#   maxPerDiscipline <- rbind( maxPerDiscipline, data.frame(Discipline = Di[i], max = maxTotal, maxMen = maxMen, maxWomen = maxWomen,
#                                                           numEditions = length(unique(disciplineData$Edition)), stringsAsFactors = F))
# }#for i
# rm(i,j,maxTotal,maxMen,maxWomen,maxSport,sport)
# 
# #Order on the max number of medals ever had in one edition
# maxPerDiscipline <- maxPerDiscipline[order(maxPerDiscipline$Discipline),]
# #Number of medals per ring
# # sum(maxPerDiscipline$max)/5
# # #51.5 per circle
# # #Taking out the sports that have only appeared once, except for the new Rugby Sevens
# (sum(maxPerDiscipline$max[maxPerDiscipline$numEditions > 2]) + 1)/5
# # #47.8 per circle
# write.csv2(maxPerDiscipline, file = "maxPerDiscipline.csv", row.names=F)

############################################################################################
############################## Append the Discipline Groups ################################
############################################################################################

dGroups <- read.csv2("Extra data/Discipline Groups.csv", stringsAsFactors = F)

#Totals per group
totalPerGroup <- tapply(dGroups$max, dGroups$Group, sum)
totalPerDiscipline <- dGroups[,c("Discipline","max")]
                         
#Pick only the useful columns now                       
dGroups <- dGroups[,c("Discipline","Group","Order")]

olympicData <- merge(olympicData, dGroups, by="Discipline", all.x = T)
rm(dGroups)

#Put the non-grouped sport separately
olympicTooFew <- subset(olympicData, olympicData$Group == "")
#And then remove these sports from the total dataset
olympicData <- olympicData[olympicData$Group != "",]

#Order data on circle, feather, time
olympicData <- olympicData[order(olympicData$Group, olympicData$Order, olympicData$Edition, 
                                 olympicData$Gender, olympicData$Continent, olympicData$Athlete, olympicData$Event),]

############################################################################################
################################## Add long country name ###################################
############################################################################################


############################################################################################
####################### Create nested JSON with extra information ##########################
############################################################################################
fileName <- "olympic_feathers.json"

#Clear the file - to keep the encoding to UTF-8
close( file( fileName, open="w" ) )

write("[", file=fileName, append=T)
Gr <- unique(olympicData$Group)
for (i in 1:length(Gr)) {
  
  olympicGroup <- subset(olympicData, olympicData$Group == Gr[i])
  Di <- unique(olympicGroup$Discipline)
  
  Line <- paste('  { "group": "', Gr[i], '",', sep='')
  Line <- append(Line, paste('  "maxMedals": ', totalPerGroup[which(names(totalPerGroup) == Gr[i])], ',', sep=''))
  Line <- append(Line, paste('  "disciplines": [', sep=''))
  
  totalMaxMedals <- 0
  for (j in 1:length(Di)) {
    
    olympicDiscipline <- subset(olympicGroup, olympicGroup$Discipline == Di[j])
    Ed <- unique(olympicDiscipline$Edition)
    
    maxMedals <- totalPerDiscipline$max[which(totalPerDiscipline$Discipline == Di[j])]
    
    Line <- append(Line, paste('       { "discipline": "', Di[j], '",', sep=''))
    Line <- append(Line, paste('         "maxMedals": ', maxMedals, ',', sep=''))
    Line <- append(Line, paste('         "featherOffset": ', totalMaxMedals, ',', sep=''))
    Line <- append(Line, paste('         "editions": [', sep=''))
    
    totalMaxMedals <- totalMaxMedals + maxMedals
    
    for (k in 1:length(Ed)) {
      
      olympicEdition <- subset(olympicDiscipline, olympicDiscipline$Edition == Ed[k])
      Ge <- unique(olympicEdition$Gender[!is.na(olympicEdition$Gender) & olympicEdition$Gender != ""])
      
      Line <- append(Line, paste('           { "edition": ', Ed[k], ',', sep=''))
      Line <- append(Line, paste('             "genders": [', sep=''))
      
      for (l in 1:length(Ge)) {
        
        olympicGender <- subset(olympicEdition, olympicEdition$Gender == Ge[l])
        
        #Find the total medal value per continent
        olympicContinentTotal <- sort(tapply(olympicGender$Value, olympicGender$Continent, sum), decreasing = T)
        Co <- names(olympicContinentTotal)
        
        #Sort the data based on the continent order (from high to low)
        Co[sort(order(Co)[olympicGender$Continent])]
        #Sort the data frame based on the order in the continents of Co
        olympicGender$Continent <- reorder.factor(olympicGender$Continent, new.order=Co)
        olympicGender <- olympicGender %>% arrange(Continent)
        
        Line <- append(Line, paste('               { "gender": "', Ge[l], '",', sep=''))
        Line <- append(Line, paste('                 "continents": [', sep=''))
        
        startMedalCount <- 0
        for (m in 1:nrow(olympicGender)) {
          lastClosing <- '},'
          if(m == nrow(olympicGender)) lastClosing <- '}'
          Line <- append(Line, paste('                    {"continent": "', olympicGender$Continent[m], 
                                     '", "medalCount": ', olympicGender$Value[m],
                                     ', "startMedalCount": ', startMedalCount,
                                     ', "edition": ', Ed[k],
                                     ', "athlete": "', olympicGender$Athlete[m],
                                     '", "country": "', olympicGender$Country[m],
                                     '", "city": "', olympicGender$City[m],
                                     '", "discipline": "', olympicGender$Discipline[m],
                                     '", "eventName": "', olympicGender$Event[m],
                                     '", "gender": "', Ge[l], '" ',lastClosing, sep=''))
          if(m == nrow(olympicGender)) Line <- append(Line, "                  ]")
          startMedalCount <- startMedalCount + olympicGender$Value[m]
        }#for m
        
        if(l == length(Ge)) { Line <- append(Line, "              }]") }
        else { Line <- append(Line, "              },") }
        
      }#for l
      
      if(k == length(Ed)) { Line <- append(Line, "          }]") }
      else { Line <- append(Line, "          },") }
      
    }#for k
    
    if(j == length(Di)) { Line <- append(Line, "      }]") }
    else { Line <- append(Line, "      },") }
    
  }#for j
 
  if(i == length(Gr)) { Line <- append(Line, "    }") }
  else { Line <- append(Line, "    },") }
  
  write(Line, file=fileName, append=T)
  
}#for i
rm(i,j,k,l,m,olympicGroup,olympicContinentTotal,olympicDiscipline,olympicEdition,olympicGender,
   maxMedals,startMedalCount,totalMaxMedals,lastClosing,Line,Gr,Ge)

#Final raw data that can be used for the visualization
write("]", file=fileName, append=T)

############################################################################################
######################### Aggregate the data of the other sports ###########################
############################################################################################

olympicTooFew$Order <- olympicTooFew$Group <- olympicTooFew$NumMedals <- olympicTooFew$ISO <- 
  olympicTooFew$NOC <- olympicTooFew$Event_gender <- NULL
olympicTooFew <- olympicTooFew[order(olympicTooFew$Discipline, olympicTooFew$Edition, olympicTooFew$Continent, olympicTooFew$Athlete),]

Di <- unique(olympicTooFew$Discipline)
sportsOther <- NULL
for (i in 1:length(Di)) {
  olympicDiscipline <- subset(olympicTooFew, olympicTooFew$Discipline == Di[i])
  Ed <- unique(olympicDiscipline$Edition)
  
  for(j in 1:length(Ed)) {
    olympicEdition <- subset(olympicDiscipline, olympicDiscipline$Edition == Ed[j])
    
    startMedalCount <- 0
    for(k in 1:nrow(olympicEdition)) {
      sportsOther <- rbind(sportsOther, data.frame(discipline = Di[i], edition = Ed[j], eventName = olympicEdition$Event[k], 
                                                   continent = olympicEdition$Continent[k], country = olympicEdition$Country[k],
                                                   city = olympicEdition$City[k], athlete = olympicEdition$Athlete[k],
                                                   startValue = startMedalCount, value = olympicEdition$Value[k], 
                                                   stringsAsFactors = F))
      startMedalCount <- startMedalCount + olympicEdition$Value[k]
    }#for k
  }#for j
}#for i
rm(i,j,k,Di,olympicDiscipline,Ed,olympicEdition,startMedalCount)

write.csv(sportsOther, file = "olympic_sports_other.csv", row.names=F)
