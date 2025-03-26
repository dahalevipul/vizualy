(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('@impetusuxp/vizualy-assistant/src/js/utility'),
            require('@impetusuxp/vizualy-assistant/src/js/assistant'),
            require('@impetusuxp/vizualy-assistant/src/js/observer'),
            require('d3')
        );
    } else if (typeof define === 'function' && define.amd) {
        define(['../vizualy-assistant/src/js/utility',
            '../vizualy-assistant/src/js/assistant',
            '../vizualy-assistant/src/js/observer',
            '../libs/d3.v6.min.js'], factory);
    } else {
        if (global.vizualy) {
            global.vizualy.LineChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const lineChartFactory = Symbol();
    class LineChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();

            this.containerElementIdentifier;
            this.containerElement;
            this.clipContainerId;
            this.legendContainerElement;
            this.x;
            this.y;
            this.line;
            this.data;
            this.isChartPlotted = false;
            this.width;
            this.height;
            this.svg;
            this.svgGroup;
            this.xScale;
            this.yScale;
            this.lineGroup;
            this.observer;
            this.brushScale;
            this.brushFn;
            this.brushXScale;
            this.brushYScale;
            this.brushLineGroup;
            this.isDataValueNegative = false;
            this.isAllDataValuesNegative = false;
            this.elements = {};

            // Default chart settings
            this.settings = {
                dimension: {
                    width: "",
                    height: "",
                    margin: assistant.getDefaultMargin()
                },
                xAxis: {
                    isVisible: true,
                    isGridsVisible: true,
                    justifyBoundryTicks: true,
                    tickSpaceBuffer: 10,
                    tickUnit: 'day',
                    tickInterval: 1,
                    tickFormat: (d) => d3.timeFormat("%d-%m-%Y")(d)
                },
                yAxis: {
                    isVisible: true,
                    isGridsVisible: true,
                    tickFormat: (d) => d
                },
                xAxisLabel: {
                    value: 'X-axis',
                    margin: 40,
                    isVisible: true
                },
                yAxisLabel: {
                    value: 'Y-axis',
                    margin: 50,
                    isVisible: true
                },
                rotateXAxisTick: {
                    value: [-10, 10, 10], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        // const defaultColor = assistant.getDefaultColor();
                        let tooltipElm = '<span style="text-transform:capitalize">' + this.x + '</span>: <b>' + this.settings.xAxis.tickFormat(d[0][this.x].getTime()) + '</b><br>';
                        d.forEach((element, index) => {
                            tooltipElm += "<span style='float:left;margin:5px 5px 0px 0px;width:10px;height:10px;background:" + (element.color ? element.color : assistant.getDefaultColor(index)) + "'></span>";
                            tooltipElm += element[this.line] + ": <b>" + element[this.y] + "</b><br>";
                        });
                        return tooltipElm;
                    },
                    showTooltipOnlyOnPoints: false,
                    placement: "top-right"
                },
                animation: {
                    isApplied: true,
                    duration: 750,
                    type: 'cubic',
                    isProgressive: true,
                    enableCurve: true
                },
                xWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                legend: {
                    isVisible: true,
                    placement: 'right',
                    margin: { top: 10, right: 10, bottom: 10, left: 10 },
                    toggleLegendDataOnClick: false,
                    rectWidth: 10,
                    rectHeight: 10,
                    textKey: null,
                    textFormat: (d) => d,
                },
                brush: {
                    isVisible: false,
                    isZoomable: false,
                    showZoomControlButtons: true,
                    zoomButtonDetails: [
                        {
                            title: 'Zoom In',
                            type: 'zoomIn',
                            position: '0'
                        }, 
                        {
                            title: 'Zoom Out',
                            type: 'zoomOut',
                            position: '70'
                        }, 
                        {
                            title: 'Reset',
                            type: 'reset',
                            position: '150'
                        }
                    ],
                    zoomPerenctage: 10,
                    limit: 30,
                    offset: 0,
                    height: 80,
                    margin: 60
                },
                xScaleType: {
                    type: "time"
                },
                yScaleType: {
                    type: 'linear'
                },
                yAxisTicksCount: { value: 3, isApplied: false },
                isResponsive: true,
                emptyDataMessage: 'No Data Available',
                exceptionMessage: 'Something went wrong!! Please look into logs.'
            };
        }

        cleanContainer() {
            assistant.cleanContainer(this.containerElement);
            assistant.hideTooltipWrapper();
            this.tooltipLine = undefined;
        }

        createContainerObject() {
            const clipedContainerElementIdentifier = this.containerElementIdentifier.replace(/\s#/g, "-");
            this.clipContainerId = clipedContainerElementIdentifier;
            this.containerElement = d3.select("#" + clipedContainerElementIdentifier);
        }

        setChartDimension() {
            [this.width, this.height, this.chartWidth, this.chartHeight] = assistant.setDimension.apply(this.chartObject);

        }

        createScales() {
            const xAxisDomain = d3.extent(this.data, (d) => d[this.x]),
                yScaleRange = [this.chartHeight, 0],
                xScaleRange = [0, this.chartWidth];

            let yScaleMinValue = d3.min(this.data, (d) => d[this.y]),
                yScaleMaxValue = d3.max(this.data, (d) => d[this.y]);


            if (this.isDataValueNegative) {
                //If minimum value is Negative - then compare mod(min -ve value) with max +ve value
                // whichever is greater, set that as min & max for scale
                if (Math.abs(yScaleMinValue) >= Math.abs(yScaleMaxValue)) {
                    yScaleMaxValue = Math.abs(yScaleMinValue);
                } else {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }
            }

            let yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [0, yScaleMaxValue];

            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]);
            this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);

            const yScaleTicks = this.yScale.ticks();
            if (yScaleMaxValue > yScaleTicks[yScaleTicks.length - 1]) {
                yScaleMaxValue = yScaleTicks[yScaleTicks.length - 1] + yScaleTicks[yScaleTicks.length - 1] - yScaleTicks[yScaleTicks.length - 2];
                if (this.isDataValueNegative) {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }
                yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [assistant.getAxisFirstTick(this.settings.yScaleType), yScaleMaxValue];
                this.yScale.domain(yAxisDomain);
            }
        }

        createBrushScales() {
            const xAxisDomain = d3.extent(this.data, (d) => d[this.x]),
                brushYScaleRange = [this.settings.brush.height, 0],
                brushXScaleRange = [0, this.chartWidth];

            let yScaleMinValue = d3.min(this.data, (d) => d[this.y]),
                yScaleMaxValue = d3.max(this.data, (d) => d[this.y]);

            if (this.isDataValueNegative) {
                //If minimum value is Negative - then compare mod(min -ve value) with max +ve value
                // whichever is greater, set that as min & max for scale
                if (Math.abs(yScaleMinValue) >= Math.abs(yScaleMaxValue)) {
                    yScaleMaxValue = Math.abs(yScaleMinValue);
                } else {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }
            }

            let yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [0, yScaleMaxValue];

            const brushXScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, brushXScaleRange, xAxisDomain]);
            const brushYScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, brushYScaleRange, yAxisDomain]);

            // brushXScale.domain(xAxisDomain);
            brushYScale.domain(yAxisDomain);

            this.brushXScale = brushXScale;
            this.brushYScale = brushYScale;
        }

        setNegativeValueFlag() {
            const arr = [];
            const normalizeData = (data) => {
                data.forEach((dataObj) => {
                    arr.push(dataObj[this.y]);
                });
                return arr;
            };
            this.isAllDataValuesNegative = false;
            this.isDataValueNegative = normalizeData(this.data).some((element) => {
                return element < 0;
            });

            let isAllNegative = this.data.filter((d) => {
                return d[this.y] < 0;
            });
            if (isAllNegative.length === this.data.length) {
                this.isAllDataValuesNegative = true;
            }
        }

        drawGround() {
            [this.svg, this.svgGroup] = assistant.drawSVG.apply(this);
            
            this.clipPath = this.svg.append("defs").append("clipPath")
            .attr("id", this.clipContainerId + "-ux-clip")
            .append("rect");

            this.updateGround();

            if (!this.isChartPlotted) {
                // Exposing svg element named as "svg"
                this.observer.exposeElement(this.elements, "svg", this.svg);
            }
        }

        updateGround() {
            assistant.updateSVG.apply(this);

            this.clipPath.attr("width", this.chartWidth)
                .attr("height", this.height);

        }

        drawXAxis() {
            if (this.settings.xAxis.isVisible) {
                // add x Axis
                assistant.drawAxisGroup.apply(this, ['x']);
            }
            this.updateXAxis();
        }

        drawYAxis() {
            if (this.settings.yAxis.isVisible) {
                // add y Axis
                assistant.drawAxisGroup.apply(this, ['y']);
            }
            this.updateYAxis();
        }

        updateXAxis() {
            if (this.settings.xAxis.isVisible) {
                assistant.updateXAxis.apply(this);
                this.svgGroup.select(".uxp-x-axis")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
                if (this.settings.rotateXAxisTick.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick").selectAll("text")
                        .attr("y", this.settings.rotateXAxisTick.value[1])
                        .attr("x", this.settings.rotateXAxisTick.value[0])
                        .attr("transform", "rotate(" + this.settings.rotateXAxisTick.value[2] + ")")
                        .style("text-anchor", "start");
                }
                if (this.settings.xWordWrap.isVisible && this.settings.xScaleType && this.settings.xScaleType.type == "band") {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick text")
                        .call(assistant.wordWrap, this.xScale.bandwidth(), 'xAxis', this.settings.xWordWrap.linesToAddEllipses, this.containerElement);
                }
                this.svgGroup.select(".uxp-x-axis")
                    .call(assistant.adjustTicks, this.settings.rotateXAxisTick.value, 'x');
            }
        }
        updateYAxis() {
            if (this.settings.yAxis.isVisible) {
                // update y Axis
                assistant.updateYAxis.apply(this);
            }

            if (this.settings.yAxisTicksCount.isApplied) {
                this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale).ticks(this.settings.yAxisTicksCount.value));
            } else {
                this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale));
            }

            this.svgGroup.select(".uxp-y-axis")
                .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'y');
        }
        drawGridLines() {
            if (this.settings.yAxis.isGridsVisible) {
                assistant.drawGridLines('y', this.yScale, this.chartWidth, this.svgGroup, this.clipContainerId);
            } else {
                assistant.removeGridLines('y', this.svgGroup);
            }

            if (this.settings.xAxis.isGridsVisible) {
                assistant.drawGridLines('x', this.xScale, this.chartHeight, this.svgGroup, this.clipContainerId);
            } else {
                assistant.removeGridLines('x', this.svgGroup);
            }
        }
        createToolTipBox() {
            this.svgGroup.selectAll(".uxp-tooltip-line-overlay").remove();
            const tooltipBox = this.svgGroup.append('rect')
                .attr("class", "uxp-tooltip-line-overlay")
                .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)")
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .attr('opacity', 0);

            // Reveal element to outer world for customizations
            this.observer.exposeElement(this.elements, "tooltipBox", tooltipBox);
        }

        drawDataPoints() {
            const self = this;
            // const defaultColor = assistant.getDefaultColor();
            let dataIndex = [],
                counter = 0,
                dataCounter = 0;
            const pointDataJoin = this.svgGroup.selectAll(".uxp-line-points")
                .remove()
                .exit()
                .data(this.prepareChartData(this.data));
            const pointGroup = pointDataJoin.enter()
                .append("g")
                .attr("class", "uxp-line-points")
                .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            const t = assistant.getTransitionFunction.apply(this, [pointGroup]);
            const pointGroupJoin = pointGroup.selectAll("rect")
                .remove()
                .exit()
                .data(function (d, i) {
                    dataIndex.push(i);
                    return d.value;
                })
                .enter().append("rect")
                .style("fill", function (d, i) {
                    if (!i) {
                        dataCounter = dataIndex[counter];
                        counter++;
                    }
                    return (d.color) ? d.color : assistant.getDefaultColor(dataCounter);
                })
                .style("opacity", function () {
                    return 1;
                });

            pointGroupJoin
                .attr("x", function (d) {
                    return self.xScale(d[self.x]) - 3;
                })
                .attr("y", function (d) {
                    return self.yScale(d[self.y]) - 3;
                    // return self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)); // For Negative value
                });
            if (this.settings.animation.isProgressive) {
                pointGroupJoin.transition(t)
                    .attr("width", 6)
                    .attr("height", 6);
            } else {
                pointGroupJoin
                    .attr("width", 6)
                    .attr("height", 6);
            }
            this.observer.exposeElement(this.elements, "linePoints", this.svgGroup.selectAll(".uxp-line-points"));
        }

        drawLines() {
            const { animation } = this.settings;
            if (this.svgGroup.select('.uxp-line-group').empty()) {
                this.lineGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-line-group")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }

            if (!this.lineGroup.select('.uxp-line').empty()) {
                this.lineGroup.selectAll('.uxp-line').remove();
            }
            const t = assistant.getTransitionFunction.apply(this, [this.lineGroup]);

            // const defaultColor = assistant.getDefaultColor();
            // Draw the line

            this.lineGroup
                .selectAll(".uxp-line")
                .data(this.prepareChartData(this.data))
                .join(
                    enter => {
                        if (animation.isProgressive) {
                            let path = enter.append("path")
                                .attr('d', (d) => {
                                    return d3.line()
                                        .x(d => this.xScale(d[this.x]))
                                        .y(d => this.yScale(d[this.y]))
                                        // .y(d => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) // For Negative value
                                        .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                })
                                .attr("class", "uxp-line")
                                .style('stroke', (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                .style('stroke-width', '2px')
                                .style('opacity', 0.7)
                                .style("fill", 'none');
                            if (path.node()) {
                                var totalLength = path.node().getTotalLength();
                                path
                                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                                    .attr("stroke-dashoffset", totalLength)
                                    .call(enter => enter.transition(t)
                                        .attr("stroke-dashoffset", 0));
                                return path;
                            }
                        } else {
                            let path = enter.append("path")
                                .call(enter => enter.transition(t)
                                    .attr('d', (d) => {
                                        return d3.line()
                                            .x(d => this.xScale(d[this.x]))
                                            .y(d => this.yScale(d[this.y]))
                                            // .y(d => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) // For Negative value
                                            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                    })
                                    .attr("class", "uxp-line")
                                    .style('stroke', (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                    .style('stroke-width', '2px')
                                    .style('opacity', 0.7)
                                    .style("fill", 'none'));
                                    return path;
                                }
                    },
                    update => update
                    .style("fill", 'none')
                    .call(update => update.transition(t)
                            .attr("height", (d) => {
                                return (this.yScale(0) - this.yScale(d[this.y]));
                            })),
                    exit => {
                        return exit.remove();
                    }
                );

            // Expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "lineGroup", this.lineGroup);
            this.observer.exposeElement(this.elements, "line", this.lineGroup.selectAll(".uxp-line"));

            if (!this.isChartPlotted) {
                let elementInfomationObj;
                if (this.settings.tooltip.showTooltipOnlyOnPoints) {
                    elementInfomationObj = this.chartObject.getElement("linePoints");
                } else {
                    //Adding default action to element "line"
                    elementInfomationObj = this.chartObject.getElement("tooltipBox");
                    const elementInfomationObjLinePoints = this.chartObject.getElement("linePoints");
                    elementInfomationObjLinePoints.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                    elementInfomationObjLinePoints.on('mouseOut', [this.hideTooltip.bind(this)], true);

                }
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        drawBrushLines() {
            const { animation } = this.settings;
            if (!this.svgGroup.select('.uxp-line-brush-group').empty()) {
                this.svgGroup.select('.uxp-line-brush-group').remove();
            }
            if (this.svgGroup.select('.uxp-line-brush-group').empty()) {
                this.lineBrushGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-line-brush-group");
            }
            this.lineBrushGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");
            const t = assistant.getTransitionFunction.apply(this, [this.lineBrushGroup]);
            this.lineBrushGroup
                .selectAll(".uxp-brush-line")
                .data(this.prepareChartData(this.data))
                .join(
                    enter => {
                        if (animation.isProgressive) {
                            let path = enter.append("path")
                                .attr('d', (d) => {
                                    return d3.line()
                                        .x(d => this.brushXScale(d[this.x]))
                                        .y(d => this.brushYScale(d[this.y]))
                                        // .y(d => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) // For Negative value
                                        .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                })
                                .attr("class", "uxp-line")
                                .style('stroke', (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                .style('stroke-width', '2px')
                                .style('opacity', 0.7)
                                .style("fill", 'none');
                            var totalLength = path.node().getTotalLength();
                            path
                                .attr("stroke-dasharray", totalLength + " " + totalLength)
                                .attr("stroke-dashoffset", totalLength)
                                .call(enter => enter.transition(t)
                                    .attr("stroke-dashoffset", 0));
                            return path;
                        } else {
                            let path = enter.append("path")
                                .call(enter => enter.transition(t)
                                    .attr('d', (d) => {
                                        return d3.line()
                                            .x(d => this.brushXScale(d[this.x]))
                                            .y(d => this.brushYScale(d[this.y]))
                                            // .y(d => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) // For Negative value
                                            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                    })
                                    .attr("class", "uxp-line")
                                    .style('stroke', (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                    .style('stroke-width', '2px')
                                    .style('opacity', 0.7)
                                    .style("fill", 'none'));
                            return path;
                        }
                    }
                );
        }

        defineBrush() {
            this.svgGroup.select('.uxp-brush').remove();
            this.brushScale = d3.scaleLinear()
                .domain([0, this.chartWidth])
                .range([0, this.chartWidth]);

            this.brushFn = d3.brushX()
                .extent([
                    [0, 0],
                    [this.chartWidth, this.settings.brush.isZoomable ? this.chartHeight : this.settings.brush.height]
                ])
                .on("start brush", (event) => {
                    if (!this.settings.brush.isZoomable) {
                        this.brushed(event);
                    }
                })
                .on("end", (event) => {
                    if (this.settings.brush.isZoomable) {
                        this.zoomChart(event);
                    }
                });

                if (this.settings.brush.isZoomable) {
                    this.enableZoomButtons();
                } else {
                    this.brushLineGroup = this.svgGroup.append("g")
                        .attr("class", "uxp-brush")
                        .attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")")
                        .call(this.brushFn)
                        .call(this.brushFn.move, [this.brushScale((this.chartWidth * this.settings.brush.offset / 100).toFixed(0)), this.brushScale((this.chartWidth * this.settings.brush.limit / 100).toFixed(0))]);
                }

        }

        enableZoomButtons() {
            if (this.settings.brush.showZoomControlButtons) {
                // for create zoom buttons
                assistant.drawZoomButtonsContainer.apply(this.chartObject, [this.zoomButtonChart.bind(this)]);
            }

            // for create enable the selection cusron on chart
            this.lineGroup
            .append("g")
            .attr("class", "brush")
            .call(this.brushFn);

            // for reset zoom when double click anywhere on chart
            this.svgGroup.on("dblclick", () => {
                this.zoomButtonChart('reset');
            });
            this.reDrawChart();
        }

        reDrawChart() {
            this.drawGridLines();
            this.drawDataPoints();
            this.drawLines();
            this.updateXAxis();
            this.updateYAxis();
            this.drawAxisLabels();
        }
        zoomButtonChart(type) {
            const zoomPercentage = this.chartWidth*this.settings.brush.zoomPerenctage/100;

            if (type === "zoomIn") {
                this.xScale.domain([ this.xScale.invert(zoomPercentage), this.xScale.invert(this.chartWidth - zoomPercentage)]);

            } else if (type === 'zoomOut') {
                this.xScale.domain([ this.xScale.invert(-(zoomPercentage)), this.xScale.invert(this.chartWidth + zoomPercentage)]);

            } else if (type === 'reset') {
                this.xScale.domain(d3.extent(this.data, function(d) { return d.date; }));

            }
            this.reDrawChart();
        }

        zoomChart(event) {
            let extent = event.selection;

            let idleTimeout;
            function idled() { idleTimeout = null; }
            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
              if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
              this.xScale.domain(d3.extent(this.data, function(d) { return d.date; }));

            }else{
                this.xScale.domain([ this.xScale.invert(extent[0]), this.xScale.invert(extent[1]) ]);
                this.lineGroup.select(".brush").call(this.brushFn.move, null); // This remove the grey brush area as soon as the selection has been done
            }
            this.reDrawChart();
        }

        //create brush function redraw lines with selection
        brushed(event) {
            if (event.type == "start") {
                if (event.sourceEvent) {
                    var rectClass = event.sourceEvent.srcElement.className.baseVal;
                    if (rectClass.includes('selection') || rectClass.includes('handle')) {
                        return null;
                    }
                    this.xScale.range([0, this.chartWidth]);
                    this.reDrawChart();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.reDrawChart();

            }
        }

        callbackToUpdateLineOnLegendClick(key) {
            let dataArr = this.data.filter((data)=> data.key === key);
            if(dataArr.length) {
                this.data = this.data.filter((data)=> {
                    return data.key !== key
                })
            }
            else{
             let data = this.data;
             if (this.DuplicateData) {
                data = this.DuplicateData;
             } 
             let newArr = data.filter((data)=> data.key === key);
             let index= data.findIndex((data) => data.key === key);
             newArr.map((ele) => {
                this.data.splice(index,0,ele);
             })
            }
            this.reDrawChart();
        }

        drawAxisLabels() {
            if (this.settings.xAxisLabel.isVisible) {
                assistant.drawAxisLabels.apply(this.chartObject, ['x', this.svgGroup]);
            } else {
                assistant.removeAxisLabel('x', this.svgGroup);
            }

            if (this.settings.yAxisLabel.isVisible) {
                assistant.drawAxisLabels.apply(this.chartObject, ['y', this.svgGroup]);
            } else {
                assistant.removeAxisLabel('y', this.svgGroup);
            }
        }

        callbackToGetDisplayText(d) {
            return this.settings.legend.textKey ? this.settings.legend.textKey : d[this.line];
        }


        createTooltipLine() {
            this.tooltipLine = this.svgGroup.append("line")
                .attr("class", "uxp-tooltip-line")
                .attr('stroke', 'gray')
                .style("opacity", 0.6)
                .style("stroke-dasharray", ("3, 3"));
        }

        drawLegend() {
            if (!this.settings.legend.isVisible) {
                if (this.legendContainerElement && !this.legendContainerElement.empty()) {
                    this.legendContainerElement.remove();
                }
                return;
            } else {
                if (!this.legendContainerElement || !this.isChartPlotted) {
                    this.legendContainerElement = assistant.drawLegendContainer.apply(this.chartObject);
                }
            }
            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.prepareChartData(this.data), this.callbackToGetDisplayText.bind(this)]);
            assistant.positionLegend.apply(this.chartObject, [this.legendContainerElement]);
            if (this.settings.legend.isVisible && this.settings.legend.toggleLegendDataOnClick) {
                assistant.clickLegend.apply(this.chartObject, [this.legendContainerElement, this.callbackToUpdateLineOnLegendClick.bind(this)]);
            }
            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "legend", this.legend);
        }

        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }

            const dataSet = this.prepareTooltipData(d, elem, event);
            this.prepareTooltipLine(dataSet, elem, event);
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), dataSet, this.settings.tooltip, event]);
            assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
        }

        prepareChartData(data) {
            let nestedData = [];
            // const defaultColor = assistant.getDefaultColor();
            // sorting the data in ascending order depending on the dates
            data.sort((a, b) => d3.ascending(a.date, b.date));

            d3.group(data, d => d[this.line]).forEach((d, i) => {
                nestedData.push({
                    key: d[0][this.line],
                    color: d[0].color ? d[0].color : assistant.getDefaultColor(i),
                    value: d
                });
            });
            return nestedData;
        }

        prepareTooltipLine(d) {
            this.tooltipLine
                .style("display", "inline-block")
                .attr('y1', 0)
                .attr('y2', this.chartHeight);
            this.tooltipLine.attr('x1', this.xScale(d[0][this.x]))
                .attr('x2', this.xScale(d[0][this.x]));
        }

        prepareTooltipData(d, elem, event) {
            const self = this;
            let bisectDate = d3.bisector(function (d) {
                return d[self.x];
            }).left;
            let x0 = self.xScale.invert(d3.pointer(event)[0]);

            let xAxisDomainUniqueValuesTemp = self.calculateMinMax(self.x, "band").sort((a, b) => a - b);
            let xAxisDomainUniqueValues = [];
            xAxisDomainUniqueValuesTemp.forEach(el => {
                xAxisDomainUniqueValues.push({
                    [self.x]: el
                });
            });

            let i = bisectDate(xAxisDomainUniqueValues, x0);
            let d0, d1;
            let returnValue = d0 = xAxisDomainUniqueValues[i - 1];

            if (xAxisDomainUniqueValues[i]) {
                d1 = xAxisDomainUniqueValues[i];
                returnValue = (d0 != undefined) ? (x0 - d0[self.x] > d1[self.x] - x0 ? d1 : d0) : d1;
            }
            let dataSet = [];
            self.prepareChartData(this.data).forEach((element, index) => {
                var value = element.value.find(val => val[self.x].toString() == returnValue[self.x].toString());
                if (value) {
                    value.index = index;
                    dataSet.push(value);
                }
            });

            dataSet = dataSet.sort(function (d1, d2) {
                if (d1[self.x] > d2[self.x]) return -1;
                if (d1[self.x] < d2[self.x]) return 1;
                return 0;
            });

            return dataSet;
        }

        calculateMinMax(key, scale) {
            const dataSet = [];
            this.prepareChartData(this.data).forEach((d) => {
                d.value.forEach(datum => {
                    if (dataSet.map(date => date.toString()).indexOf(datum[key].toString()) == -1)
                        dataSet.push(datum[key]);
                });
            });

            if (scale == "band") {
                return dataSet;
            } else {
                return d3.extent(dataSet, function (d) {
                    return d;
                });
            }
        }

        hideTooltip() {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            d3.select(".uxp-tooltip").style("display", "none");
            if (this.tooltipLine)
                this.tooltipLine.style("display", "none");
        }

        displayMessageOnScreen(message) {
            if (!message) {
                message = this.settings.emptyDataMessage;
            }
            assistant.displayMessageOnScreen.apply(this.chartObject, [message]);
        }

        draw() {
            assistant.emitEvent("beforeDraw", this);
            if (this.settings.legend.toggleLegendDataOnClick) this.DuplicateData = utility.deepCopyObject(this.data);
            this.cleanContainer();
            this.setChartDimension();
            this.drawGround();
            if (utility.isDataEmpty(this.data)) {
                this.displayMessageOnScreen();
                this.isChartPlotted = false;
                return this.chartObject;
            }
            this.setNegativeValueFlag();
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.drawDataPoints();
            this.drawLines();
            if (this.settings.brush.isVisible) {
                if (!this.settings.brush.isZoomable) {
                    this.createBrushScales();
                    this.drawBrushLines();
                }
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                this.createTooltipLine();
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            assistant.emitEvent("completeDraw", this);
            this.isChartPlotted = true;
        }

        update() {
            assistant.emitEvent("beforeUpdate", this);
            if (this.settings.legend.toggleLegendDataOnClick) this.DuplicateData = utility.deepCopyObject(this.data);
            assistant.hideTooltipWrapper();
            this.tooltipLine = undefined;
            if (utility.isDataEmpty(this.data)) {
                this.displayMessageOnScreen();
                this.isChartPlotted = false;
                return this.chartObject;
            }
            if (!this.isChartPlotted) {
                this.draw();
                return this.chartObject;
            }
            this.setChartDimension();
            this.updateGround();
            this.setNegativeValueFlag();
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.drawDataPoints();
            this.drawLines();
            if (this.settings.brush.isVisible) {
                if (!this.settings.brush.isZoomable) {
                    this.createBrushScales();
                    this.drawBrushLines();
                }
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
                this.createTooltipLine();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if (this.resizeHappening)
                return;
            this.resizeHappening = true;
            assistant.emitEvent("beforeResize", this);
            if (this.settings.legend.toggleLegendDataOnClick) this.DuplicateData = utility.deepCopyObject(this.data);
            assistant.hideTooltipWrapper();
            this.tooltipLine = undefined;
            if (utility.isDataEmpty(this.data)) {
                this.displayMessageOnScreen();
                this.isChartPlotted = false;
                this.resizeHappening = false;
                return this.chartObject;
            }
            if (!this.isChartPlotted) {
                this.draw();
                this.resizeHappening = false;
                return this.chartObject;
            }
            this.setChartDimension();
            this.updateGround();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.drawDataPoints();
            this.drawLines();
            if (this.settings.brush.isVisible) {
                if (!this.settings.brush.isZoomable) {
                    this.createBrushScales();
                    this.drawBrushLines();
                }
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
                this.createTooltipLine();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class LineChart {
        constructor() {
            this[lineChartFactory] = new LineChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[lineChartFactory].containerElement;
            }
            this[lineChartFactory].containerElementIdentifier = args[0];
            this[lineChartFactory].createContainerObject(this[lineChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[lineChartFactory].x;
            }
            this[lineChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[lineChartFactory].y;
            }
            this[lineChartFactory].y = args[0];
            return this;
        }

        line(...args) {
            if (!args || !args.length) {
                return this[lineChartFactory].line;
            }
            this[lineChartFactory].line = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[lineChartFactory].width,
                height: this[lineChartFactory].height,
                chartWidth: this[lineChartFactory].chartWidth,
                chartHeight: this[lineChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[lineChartFactory].data;
            }
            this[lineChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[lineChartFactory].settings);
            }
            this[lineChartFactory].settings = utility.unifyObject([this[lineChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[lineChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[lineChartFactory].elements;
        }

        on(eventId, handler) {
            this[lineChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[lineChartFactory].draw();
            let result = utility.handleException(this[lineChartFactory], this[lineChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[lineChartFactory].displayMessageOnScreen(this[lineChartFactory].settings.exceptionMessage);
                this[lineChartFactory].isChartPlotted = false;
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[lineChartFactory], this[lineChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[lineChartFactory].displayMessageOnScreen(this[lineChartFactory].settings.exceptionMessage);
                this[lineChartFactory].isChartPlotted = false;
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[lineChartFactory], this[lineChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[lineChartFactory].displayMessageOnScreen(this[lineChartFactory].settings.exceptionMessage);
                this[lineChartFactory].isChartPlotted = false;
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return LineChart;
}));