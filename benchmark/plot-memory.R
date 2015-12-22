library("reshape2")
library("ggplot2")

args <- commandArgs(trailingOnly = TRUE);
sourcefile = args[1];

data = read.csv(sourcefile);
data = melt(data, id="time");
data$time = (data$time - data$tim[1]) / 1000;
data$value = data$value / (1024 * 1024);
  
p = ggplot(data=data, aes(x=time, y=value, colour=variable));
p = p + geom_line();
p = p + xlab('time [sec]');
p = p + ylab('usage [MB]');

png(gsub('.csv', '.png', sourcefile), width = 700, height = 400);
print(p);
dev.off();
