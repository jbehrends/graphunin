/*!
 * Graphunin JavaScript v1.0
 *
 * Note: This script requires jquery
 *
*/

//User params
var gServer = "graphiteServer.domain"; //Graphite server address
var gBase = "servers."; //Base node to search for your servers
var gC1From = "-1days"; //From time for your first column
var gC2From = "-9days"; //From time for your second column
var gWidth = "497"; //Graph width
var gHeight = "294"; //Graph height
var gMetrics = [ // Set base metrics and titles and options here
  [".load.load.shortterm", "1min load average", ""],
  [".aggregation.cpu-average.cpu.*", "CPU usage", "&areaMode=stacked"],
  [".memory.memory.*", "Memory usage", "&areaMode=stacked"],
  [".swap.swap.*", "Swap usage", "&areaMode=stacked"],
  [".swap.swap_io.*", "Swap in/out", ""],
  [".processes.ps_state.*", "Processes", "&areaMode=stacked"],
  [".processes.fork_rate", "Process fork rate", ""],
  [".uptime.uptime", "System uptime (seconds)", ""]
];
var mountStats = [ //These are the file system metrics we are intersted in
  ["df_complex.*", " - filesystem usage","&areaMode=stacked"],
  ["df_inodes.*", " - inode usage","&areaMode=stacked"]
];
var diskStats = [ //These are the disk metrics we are intersted in
  ["disk_merged.*"," - Merged Ops/s",""],
  ["disk_octets.*"," - Bytes/s",""],
  ["disk_ops.*"," - Ops/s",""],
  ["disk_time.*"," - IO wait time (ms)",""]
];
var nicStats = [ //These are the .interface metrics we are intersted in
  ["if_octets.*"," - Octets/s",""],
  ["if_packets.*"," - Packets/s",""],
  ["if_errors.*"," - Errors/s",""]
];
var jvmStats = [ //These are the JMX metrics we are intersted in
  ["jvm_memory-heap.memory.*"," - JVM heap memory usage",""],
  ["jvm_loaded_classes.gauge.loaded_classes"," - JVM loaded classes",""],
  ["jvm_thread_count.threads"," - JVM thread count",""],
  ["jvm_uptime.uptime"," - JVM uptime",""]
];
//End user params


function updateURL() {
  document.location.search = '?server=' + document.getElementById("serverSelect").value; //Set the URL parameter for server. This will also cause the page to refresh
}

function updateGraphs() {
  //var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + gBase + serverFromURL;
  $('#dGraphs1').append("<div class=\"metricgroup\" id=\"system\" >system</div>");$('#dGraphs2').append("<div class=\"metricgroup\">&nbsp;</div>") 
  for(i in gMetrics) {
    var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + "aliasByMetric(" + gBase + serverFromURL + gMetrics[i][0] + ")&title=" + encodeURI(gMetrics[i][1]) + gMetrics[i][2];
    writeGraphs(gURL);
  }
  //Loop through file systems here
  jQuery.getJSON("http://" + gServer + "/metrics/find/?format=treejson&query=" + gBase + serverFromURL + ".df.*", function(mount){
    $('#dGraphs1').append("<div class=\"metricgroup\" id=\"filesystem\">file system</div>");$('#dGraphs2').append("<div class=\"metricgroup\">&nbsp;</div>")
    for(x in mount){
      for(s in mountStats) {
        var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + "aliasByMetric(" + gBase + serverFromURL + ".df." + mount[x].text + "." + mountStats[s][0] + ")&title=" + mount[x].text + encodeURI(mountStats[s][1]) + mountStats[s][2];
        writeGraphs(gURL);
      }
    }
  });        
  //Loop through disks here
  jQuery.getJSON("http://" + gServer + "/metrics/find/?format=treejson&query=" + gBase + serverFromURL + ".disk.*", function(disk){
    $('#dGraphs1').append("<div class=\"metricgroup\" id=\"disks\">disks</div>");$('#dGraphs2').append("<div class=\"metricgroup\">&nbsp;</div>")
    for(x in disk){
      if(/^(sd|fio)[a-z]$|^(dm-|md)[0-9]$/.test(disk[x].text)){ //Use a regex to only render full disks and not partitions. ie sda,sdb,etc..
        for(s in diskStats) {
          var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + "aliasByMetric(" + gBase + serverFromURL + ".disk." + disk[x].text + "." + diskStats[s][0] + ")&title=" + disk[x].text + encodeURI(diskStats[s][1]) + diskStats[s][2];
          writeGraphs(gURL);
        }
      }
    }
  });
  //Loop through network interfaces here
  jQuery.getJSON("http://" + gServer + "/metrics/find/?format=treejson&query=" + gBase + serverFromURL + ".interface.*", function(nics){
    $('#dGraphs1').append("<div class=\"metricgroup\" id=\"networks\">networks</div>");$('#dGraphs2').append("<div class=\"metricgroup\">&nbsp;</div>")
    for(x in nics){
      for(s in nicStats) {
        var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + "aliasByMetric(" + gBase + serverFromURL + ".interface." + nics[x].text + "." + nicStats[s][0] + ")&title=" + nics[x].text + encodeURI(nicStats[s][1]) + nicStats[s][2];
        writeGraphs(gURL);
      }
    }
  });
  //JVM Stats here
  //Since we can have more than one JVM instance on a box we will also need to find each unique instance based on a three letter value we assinged the JVM in the collectd "connection" block.
  jQuery.getJSON("http://" + gServer + "/metrics/find/?format=treejson&query=" + gBase + serverFromURL + ".GenericJMX.*-jvm*", function(jvms){
    var jvmInstances = new Array(); //Array to hold our list of unique JVM's on the box.
    for(x in jvms){ //Search for unique JVM instances and build an array containing them.
      if ($.inArray (String(jvms[x].text).substring(0,String(jvms[x].text).indexOf('-')), jvmInstances) == -1){
        jvmInstances.push(String(jvms[x].text).substring(0,String(jvms[x].text).indexOf('-')));
      }
    }
    for(x in jvmInstances){
      $('#jvms').append("<a href=\"#jvm" + jvmInstances[x] + "\">jvm-" + jvmInstances[x] + "</a><BR>");
      $('#dGraphs1').append("<div class=\"metricgroup\" id=\"jvm" + jvmInstances[x] + "\">jvm-" + jvmInstances[x] + "</div>");$('#dGraphs2').append("<div class=\"metricgroup\">&nbsp;</div>")
      for(s in jvmStats) {
        var gURL = "http://" + gServer + "/render/?width=" + gWidth + "&height=" + gHeight + "&target=" + "aliasByMetric(" + gBase + serverFromURL + ".GenericJMX." + jvmInstances[x] + "-" + jvmStats[s][0] + ")&title=" + jvmInstances[x] + encodeURI(jvmStats[s][1]) + jvmStats[s][2];
        writeGraphs(gURL);
      }
    }
  });
}

//Write each graph and create a link to the zoom page to show different time frames.
function writeGraphs(url){
  $('#dGraphs1').append("<a href=\"graph-zoom.html?" + url.split("?")[1] + "&server=" + serverFromURL + "\" target=\"_blank\"> <img src=" + url + "&from=" + gC1From + "> </a><BR>");
  $('#dGraphs2').append("<a href=\"graph-zoom.html?" + url.split("?")[1] + "&server=" + serverFromURL + "\" target=\"_blank\"> <img src=" + url + "&from=" + gC2From + "> </a><BR>");
  //$('#dGraphs1').append("<img src=" + url + "&from=" + gC1From + "> <BR>");
  //$('#dGraphs2').append("<img src=" + url + "&from=" + gC2From + "> <BR>");
}

//Function to get URL parameters
function getQueryVariable(variable){
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
  }
return(false);
}
