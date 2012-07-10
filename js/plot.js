/********************************************************************
 * A list of the current plots!
 ********************************************************************/
plots = []

/********************************************************************
 * A list of plotters
 ********************************************************************/
plotters = {}

/********************************************************************
 * Plotter 1: images
 ********************************************************************/
plotters["image"] = function(plot) {
    // create cell to hold plot
    var newplot = create_cell({
        parent: layout.terminal,
        css: {},
        clss: 'plot'
    })
    plots.push(newplot)

    // image
    $(newplot.id).append('<img src="'+plot.file+'" />')
}

/********************************************************************
 * Plotter 2: line plots
 ********************************************************************/
plotters["line"] = function(plot) {
    // local variables
    var xpad = 0,
        ypad = (plot.y_max-plot.y_min)*0.1,
        x = d3.scale.linear().domain([plot.x_min - xpad, plot.x_max + xpad]).range([0, plot.w]),
        y = d3.scale.linear().domain([plot.y_min - ypad, plot.y_max + ypad]).range([plot.h, 0]),
        xticks = x.ticks(8),
        yticks = y.ticks(8);

    // create cell to hold plot
    var newplot = create_cell({
        parent: layout.terminal,
        css: {},
        clss: 'plot'
    })
    plots.push(newplot)

    // create an SVG canvas and a group to represent the plot area
    var vis = d3.select(newplot.id)
        .append("svg")
        .data([d3.zip(plot.x_data, plot.y_data)]) // coordinate pairs
        .attr("width", plot.w+plot.p*2)
        .attr("height", plot.h+plot.p*2)
        .append("g")
        .attr("transform", "translate("+String(plot.p)+","+String(plot.p)+")");

    // vertical tics
    var vrules = vis.selectAll("g.vrule")
        .data(xticks)
        .enter().append("g")
        .attr("class", "vrule");

    // horizontal tics
    var hrules = vis.selectAll("g.hrule")
        .data(yticks)
        .enter().append("g")
        .attr("class", "hrule");

    // vertical lines
    vrules.filter(function(d) { return (d != 0); }).append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", plot.h - 1);

    // horizontal lines
    hrules.filter(function(d) { return (d != 0); }).append("line")
        .attr("y1", y)
        .attr("y2", y)
        .attr("x1", 0)
        .attr("x2", plot.w + 1);

    // x-axis labels
    vrules.append("text")
        .attr("x", x)
        .attr("y", plot.h + 10)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .text(x.tickFormat(10));

    // y-axis labels
    hrules.append("text")
        .attr("y", y)
        .attr("x", -5)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(y.tickFormat(10));

    // y-axis
    var vrules2 = vis.selectAll("g.vrule2")
        .data(xticks)
        .enter().append("g")
        .attr("class", "vrule2");

    // x-axis
    var hrules2 = vis.selectAll("g.hrule2")
        .data(yticks)
        .enter().append("g")
        .attr("class", "hrule2");

    // y-axis line
    vrules2.filter(function(d) { return (d == 0); }).append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", plot.h - 1);

    // x-axis line
    hrules2.filter(function(d) { return (d == 0); }).append("line")
        .attr("y1", y)
        .attr("y2", y)
        .attr("x1", 0)
        .attr("x2", plot.w + 1);

    // actual plot curve
    vis.append("path")
        .attr("class", "line")
        .attr("d", d3.svg.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); }));

    // scroll to the new plot
    $(layout.terminalform.id).prop("scrollTop", $(layout.terminalform.id).prop("scrollHeight"));
};

/********************************************************************
 * Plotter 3: bar plots
 ********************************************************************/
plotters["bar"] = function(plot) {
    var data = d3.zip(plot.x_data, plot.y_data); // coordinate pairs

    // local variables
    var x = d3.scale.linear().domain(d3.extent(plot.x_data)).range([0, plot.w]),
        y = d3.scale.linear().domain([0, d3.max(plot.y_data)]).range([0, plot.h]),
        xticks = x.ticks(8),
        yticks = y.ticks(8);

    // create cell to hold plot
    var newplot = create_cell({
        parent: layout.terminal,
        css: {},
        clss: 'plot'
    })
    plots.push(newplot)

    // create an SVG canvas and a group to represent the plot area
    var vis = d3.select(newplot.id)
      .append("svg")
        .data([data])
        .attr("width", plot.w+plot.p*2)
        .attr("height", plot.h+plot.p*2)
        .append("g")
        .attr("transform", "translate("+String(plot.p)+","+String(plot.p)+")");

    // horizontal ticks
    var hrules = vis.selectAll("g.hrule")
        .data(yticks)
        .enter().append("g")
        .attr("class", "hrule")
        .attr("transform", function(d) { return "translate(0," + (plot.h-y(d)) + ")"; });

    // horizontal lines
    hrules.append("line")
        .attr("x1", 0)
        .attr("x2", plot.w);

    // y-axis labels
    hrules.append("text")
        .attr("x", -5)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(y.tickFormat(10));

    // x-axis rules container
    var vrules = vis.selectAll("g.vrule")
        .data(xticks)
        .enter().append("g")
        .attr("class", "vrule")
        .attr("transform", function(d) { return "translate(" + (x(d)) + ",0)"; });

    // x-axis labels
    vrules.append("text")
        .attr("y", plot.h + 20)
        .attr("dx", "0")
        .attr("text-anchor", "middle")
        .text(x.tickFormat(10));

    // Redfining domain/range to fit the bars within the width
    x.domain([0, 1]).range([0, plot.w/data.length]);

    // actual plot curve
    vis.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("class", "rect")
        .attr("x", function(d, i) { return x(i); })
        .attr("y", function(d) { return plot.h - y(d[1]); })
        .attr("width", (plot.w - plot.p*2) / data.length)
        .attr("height", function(d) { return y(d[1]); });

    // scroll to the new plot
    $(layout.terminalform.id).prop("scrollTop", $(layout.terminalform.id).prop("scrollHeight"));
};

/********************************************************************
 * Plotter 4: adjacency matrix
 ********************************************************************/
plotters["adjacency"] = function(plot) {
    var margin = {top: 80, right: 0, bottom: 10, left: 80}
    var width = plot.w
    var height = plot.w

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 4]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));

    // create cell to hold plot
    var newplot = create_cell({
        parent: layout.terminal,
        css: {},
        clss: 'plot'
    })
    plots.push(newplot)

    var svg = d3.select(newplot.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("left", -margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = {
        nodes : [
            {group:1, name:'bob'},
            {group:1, name:'john'},
            {group:2, name:'slimane'},
            {group:3, name:'gerd'},
            {group:3, name:'paul'},
        ],
        edges : [
            {source:0, target:1, value:1},
            {source:1, target:2, value:100},
            {source:0, target:2, value:1},
            {source:0, target:3, value:1},
            {source:0, target:4, value:10},
        ]
    }

    // vars
    var matrix = []
    var nodes = data.nodes
    var n = nodes.length

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert edges to matrix; count character occurrences.
    data.edges.forEach(function(link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        matrix[link.source][link.source].z += link.value;
        matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    // Precompute the orders.
    var orders = {
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; })
    };

    // The default sort order.
    x.domain(orders.name);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; });

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d.z); })
            .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    }

    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
        d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    d3.select("#order").on("change", function() {
        clearTimeout(timeout);
        order(this.value);
    });

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(200);

        t.selectAll(".row")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
          .selectAll(".cell")
            .delay(function(d) { return x(d.x) * 4; })
            .attr("x", function(d) { return x(d.x); });

        t.selectAll(".column")
            .delay(function(d, i) { return x(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    // define manipulate callbacks
    _g = {order:order}
    $(layout.terminal.id).append('</br></br>sort by: '
                                 +'<span class="button" onclick="_g.order(\'name\')">order</span>'
                                 +'<span class="button" onclick="_g.order(\'group\')">group</span>'
                                 +'<span class="button" onclick="_g.order(\'count\')">count</span>'
                                 +'</br></br>')
}
