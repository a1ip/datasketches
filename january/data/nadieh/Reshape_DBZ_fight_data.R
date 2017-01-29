setwd("~/Downloads/Dragonball Z")
library(dplyr)
library(reshape2)
library(ggplot2)
library(stringr)

fights <- read.csv2("Dragonball_Z_fights.csv", stringsAsFactors = F)

#Remove all fights not to be included
fights <- fights[which(fights$include == "y"),]

#Reassign fight id
fights$id <- 1:nrow(fights)

#Create a dataset that contains 1 row per person in a fight
fightPerson <- NULL
for(i in 1:nrow(fights)) {
  for(j in 0:13) {
    #If the name is empty go to the next fight
    if(fights[i,11+j*2] == "") break
    
    fightPerson <- rbind(fightPerson, data.frame(id = fights$id[i], name = str_trim(fights[i,11+j*2]),
                                                 state = str_trim(fights[i,12+j*2]), subSaga = str_trim(fights$subSaga[i]),
                                                 stringsAsFactors = F))
  }#for j
}#for i
rm(i,j)

#Remove all names from the fight data that are no longer needed
fights <- fights[,c("id","subSaga","charactersGood","charactersBad","info","anime","extra","startAngle")]

#Write to file
write.csv(fightPerson, file="dragonball_Z_fight_per_person.csv", row.names=F, na="")
write.csv(fights, file="dragonball_Z_fights_cleaned.csv", row.names=F)
