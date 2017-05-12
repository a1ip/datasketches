# From: https://medium.com/planet-stories/a-gentle-introduction-to-gdal-part-1-a3253eb96082
# On a Mac, I’ve found the easiest approach is to download the GDAL 2.1 Complete disk image 
# (http://www.kyngchaos.com/files/software/frameworks/GDAL_Complete-2.1.dmg) from 
# KyngChaos. This installer relies on the version of Python included with OS X, in my case 2.7.12, not 3.x.
# On the disk image are two installers: one for NumPy (run this first) and one for GDAL Complete (run this second). 
# You’ll have to open the files with a control-click since the installers are from an “unknown developer.” 
# After one last step you’ll be good to go: cut and paste the following two lines into the Terminal 
# (they’ll allow you to run GDAL commands just by typing them, without specifying a path.)
# echo 'export PATH=/Library/Frameworks/GDAL.framework/Programs:$PATH' >> ~/.bash_profile
# source ~/.bash_profile

# From http://stackoverflow.com/questions/34333624/trouble-installing-rgdal/37829420#37829420
# install.packages('rgdal', type = "source", configure.args=c(
#   '--with-gdal-config=/Library/Frameworks/GDAL.framework/Programs/gdal-config',
#   '--with-proj-include=/Library/Frameworks/PROJ.framework/Headers',
#   '--with-proj-lib=/Library/Frameworks/PROJ.framework/unix/lib'))

# BTW I tried installing GDAL and PROJ through Homebrew but I never got the /Library/Frameworks/GDAL or PROJ folders
# even though Homebrew told me the installation was succesful, so eventaully I followed the above steps
# I did have to delete my failed installations of rgdal, quit R, open R and use the above install.packages to
# make it work (see this R base bug: https://github.com/hadley/devtools/pull/1001)

setwd("~/Downloads/datasketches april")

# #Download the 52 weeks of VIIRS files - Only needs to be done once
# for(i in 1:52) {
#   site <- "ftp://ftp.star.nesdis.noaa.gov/pub/corp/scsb/wguo/data/VIIRS_VH_4km/geo_TIFF/"
#   url <- paste0(site,"VGVI_21Bands.G04.C07.npp.P20160",sprintf("%02d",i),".SM.SMN.tif")
#   destfile <- paste0("VIIRS files/2016-week-",i,".tif")
#   download.file(url, destfile)
#   print(i)
# }# for i
# rm(site, url, destfile)

# devtools::session_info()

library(sp)
library(raster)
library(rgdal)
library(rasterVis)

#See examples of projections: https://www.star.nesdis.noaa.gov/smcd/emb/vci/VH/vh_NDVI_in_various_projections.php
#http://rfunctions.blogspot.nl/2016/06/how-to-project-coordinates-rasters-and.html
#CRS("+init=epsg:3857")
merc <- "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"
wgs <- "+proj=longlat +datum=WGS84 +ellps=WGS84 +towgs84=0,0,0"

#Define color breaks as STAR website - to compare
cols <- c("#808080","#E10000","#E17D00","#E1AA00","#FFE100","#FFFF00","#AAFF00",
          "#55FF00","#00E100","#00BE00","#00A000","#008700","#006400","#005000")
brk <- c(-1, seq(from=0, to = 0.6, by = 0.05),1)

# #Extent should be:
# xmin        : -20057558 
# xmax        : 20058482 
# ymin        : -7411495 
# ymax        : 12962925 

#Run through all 52 weeks, load the map, turn into mercator
#reduce the resolution, save all non-NA into the maps list

factor <- 20 #Reduce resolution
maps <- list()
for(i in 1:52) {
  #Filename
  fileN <- paste0("VIIRS files/2016-week-",i,".tif")
  #Load GeoTiff
  map2 <- raster(fileN)
  # Set the min and max value
  map2 <- setMinMax(map2)
  #Change all values < -1 into NA
  map2[map2 < -1] <- NA #takes a while
  print(paste0("Week: ", i, " min:", round(map2@data@min,3), " max:", round(map2@data@max,3) ))

  #Adjust otherwise the transform to mercator or anything doesn't work
  crs(map2) <- wgs
  #Transform to mercator
  map3 <- projectRaster(map2, crs=merc) #takes a while
  # #Plot
  # plot(map3, zlim=c(-0.1,1), col=cols, breaks=brk, bty="n", axes=F, legend=F)
  # #Save plot to png
  # png("worldMapR.png", width=map3@ncols, height=map3@nrows, units="px")
  # plot(map3, maxpixels=map3@ncols*map3@nrows, zlim=c(-0.1,1), col=cols, breaks=brk)
  # dev.off()
  
  #Save map3 to a RDS
  saveRDS(map3, file=paste0("VIIRS maps/map-week-",i,".rds"))
  
  #Lower the resolution of the map (original at ~4km)
  map4 <- aggregate(map3, fact=factor, fun=mean, na.rm=T)
  
  #Put non-NA into dataframe
  mapPoints <- as.data.frame(rasterToPoints(map4))
  mapPoints$layer <- round(mapPoints$layer,2)
  mapPoints$x <- round(mapPoints$x)
  mapPoints$y <- round(mapPoints$y)
  
  #Save in list
  maps[[i]] <- mapPoints
  
  print(paste("Done with week", i))
  
  #Remove from session
  rm(map2, map3, map4, mapPoints)
  gc()
}#for i
rm(fileN,factor,i)

#Save results
saveRDS(maps, file="mapData.rds")

# #Create a png plot of all maps
# for(i in 1:52) {
#   map <- readRDS(paste0("VIIRS maps/map-week-",i,".rds"))
#   #Make lower resolution
#   mapLowRes <- aggregate(map, fact=3, fun=mean, na.rm=T)
#   #Save plot to png
#   png(paste0("VIIRS plots/worldMap-week-",i,".png"), width=mapLowRes@ncols, height=mapLowRes@nrows, units="px")
#   plot(mapLowRes, maxpixels=mapLowRes@ncols*mapLowRes@nrows, zlim=c(-0.1,1), col=cols, breaks=brk, bty="n", axes=F, legend=F)
#   dev.off()
# }#for i
# rm(map, mapLowRes,i)

#Read in the map data
#maps <- readRDS("mapData.rds")

#Map 22 has all the points in it, so take as base
locs <- maps[22][[1]]
#Remove the layer variable to only keep the x and y
locs$layer <- NULL
#Order by x and then y
locs <- locs[order(locs$x, locs$y),]

#Create a df that will contain all the data
allMaps <- locs
#Loop over all the maps and replace the x and y by the ids
for(i in 1:52) {
  map <- maps[i][[1]]
  
  #Check if the correct number of points is present
  #If not, first add the missing points as -1
  if(nrow(map) != nrow(locs)) {
    #See which points are missing and add these
    map <- merge(locs, map, by=c("x","y"), all.x = T)
    #Replace the missing locations by -1
    map$layer[is.na(map$layer)] <- -0.07
  }#if
  
  #Order by x and then y
  map <- map[order(map$x, map$y),]
  #Only keep the layer variable
  row.names(map) <- map$x <- map$y <- NULL
  #Write the layer variable to a file - the row number will coincide with the location
  write.csv(map, file=paste0("VIIRS final data layers/mapData-week-",i,".csv"), row.names=F)
  
  # #Add data to bigger df
  # names(map) <- paste0("week_",i)
  # allMaps <- cbind(allMaps,map)
  
  # #Investigated gzip, but couldn't find a way for the browser to unzip it...
  # setwd("~/Downloads/datasketches april/VIIRS final data layers")
  # system(paste0("gzip mapData-week-",i,".csv"))
  # setwd("~/Downloads/datasketches april")
}#for i
rm(map, i)
#Write all data in one data frame to file - But is even bigger than 52 separate ones
#write.csv(allMaps, file="mapData-all-weeks.csv", row.names=F)

#To get the correct ordering back
locs$order <- 1:nrow(locs)
#Place the locations in a more pixel friendly number extent
unqX <- sort(unique(locs$x))
unqY <- sort(unique(locs$y))
#Replace the current long numbers by smaller ones
unqX <- data.frame(xNew = 1:length(unqX), x = unqX)
unqY <- data.frame(yNew = 1:length(unqY), y = unqY)
#Make the switch in the locs file
locs <- merge(locs, unqX, by = "x", all.x=T)
locs <- merge(locs, unqY, by = "y", all.x=T)
#Remove "old" x and y coordinates
locs$x <- locs$y <- NULL
#Rename new variables to x and y
names(locs)[which(names(locs) == "xNew")] <- "x"
names(locs)[which(names(locs) == "yNew")] <- "y"
#Order again
locs <- locs[order(locs$order),]
locs$order <- NULL
#Save the final locations in a separate file
write.csv(locs, file="worldMap_coordinates.csv",row.names=F)
rm(unqX, unqY)

