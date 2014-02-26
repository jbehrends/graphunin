Graphunin = (collectd + Graphite) - Munin
===================================

Graphunin is a simple javascript based dashboard application that mimics the per host dashboard layout that Munin is known for.  

![Image](example/screenshot.png?raw=true)

# Configuration

Almost all configuration (Graphite server location, metric base, etc) is location in `graphunin.js`

# Installing / Running

Clone this repo locally or onto a webserver.  Modify appropriate configuration files.  Point your browser at graphunin.html and start using.

# Collectd configuration

This is an example of the write_graphite configuration that Graphunin is currently configured to work with:

````
<Plugin write_graphite>
  <Carbon>
    Host "graphiteHost.domain"
    Port "2003"
    Prefix "servers."
    Postfix ""
    EscapeCharacter "_"
    StoreRates true
    SeparateInstances true
    AlwaysAppendDS false
  </Carbon>
</Plugin>
````

GenericJMX plugin notes:

Graphunin will leverage collectd's ability to set an instance for each JVM being polled and then display a set of graph's for each JVM.  To make this work you will have to define a prefix using the "InstancePrefix" setting in each "Connection" block defined in your GenericJMX plugin configuration block.
Please reference the collectd wiki page for more information: https://collectd.org/wiki/index.php/Plugin:GenericJMX

Licence
-------

Copyright © 2013-2014 iovation Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
