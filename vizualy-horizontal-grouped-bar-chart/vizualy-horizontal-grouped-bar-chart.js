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
            global.vizualy.HorizontalGroupedBarChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const groupedBarChartFactory = Symbol();
    class GroupedBarChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();

            this.containerElementIdentifier;
            this.containerElement;
            this.legendContainerElement;
            this.clipContainerId;
            this.x;
            this.y;
            this.data;
            this.isChartPlotted = false;
            this.width,
                this.height,
                this.svg;
            this.svgGroup;
            this.xScale;
            this.yScaleGroup;
            this.yScale;
            this.brushScale;
            this.clipPath;
            this.brushXScale;
            this.brushYScale;
            this.brushBarGroup;
            this.barGroup;
            this.observer;
            this.isDataValueNegative = false,
                this.isAllDataValuesNegative = false,
                this.colors;
            this.column;
            this.ySubGroups;
            this.elements = {};

            //Default chart settings
            this.settings = {
                dimension: {
                    width: "",
                    height: "",
                    margin: assistant.getDefaultMargin()
                },
                xAxis: {
                    isVisible: true,
                    isGridsVisible: true,
                    tickFormat: (d) => d
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
                barLabel: {
                    isVisible: true,
                    labelFormat: (d) => d
                },
                barSpace: { type: 'perc', value: 0.1 },
                brush: {
                    isVisible: false,
                    limit: 30,
                    offset: 0,
                    height: 80,
                    margin: 60
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        let tooltipCotent = '<table style="width:200px;text-transform: capitalize">';
                        Object.keys(d).forEach((key, i) => {
                            if (key == this.y) {
                                tooltipCotent += '<tr><td colspan="2" style="border-bottom:1px solid #b6b6b6;padding:2px 4px;"><b>' + d[key] + '</b></td></tr>';
                            } else {
                                tooltipCotent += '<tr><td style="padding:2px 4px;"><span style="display:inline-block;width:8px;height:8px;margin-right:5px;background-color:' +
                                    (this.colors ? this.colors[i - 1] : assistant.getDefaultColor(i - 1)) + ';"></span>' + key + '</td><td style="text-align:right;padding:2px 4px"><b>' + d[key] + '%</b></td></tr>';
                            }
                        });
                        tooltipCotent += '</table>';
                        return tooltipCotent;
                    },
                    placement: "top-right"
                },
                animation: {
                    isApplied: true,
                    duration: 750,
                    type: 'cubic'
                },
                legend: {
                    isVisible: true,
                    placement: 'right',
                    margin: { top: 10, right: 10, bottom: 10, left: 10 },
                    rectWidth: 10,
                    rectHeight: 10,
                    textKey: null,
                    textFormat: (d) => d,
                },
                showLabel: {
                    isVisible: false,
                    key: "",
                    format: function (d) {
                        return d;
                    }
                },
                xScaleType: {
                    type: "linear"
                },
                yScaleType: {
                    type: 'band'
                },
                xAxisTicksCount: {
                    value: 5,
                    isApplied: false
                },
                yWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                rotateYAxisTick: {
                    value: [-45, -20, -40], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                isResponsive: true,
                emptyDataMessage: 'No Data Available',
                exceptionMessage: 'Something went wrong!! Please look into logs.'
            };

        }

        cleanContainer() {
            assistant.cleanContainer(this.containerElement);
            assistant.hideTooltipWrapper();
        }

        createContainerObject() {
            const clipedContainerElementIdentifier = this.containerElementIdentifier.replace(/\s#/g, "-");
            this.clipContainerId = clipedContainerElementIdentifier;
            this.containerElement = d3.select("#" + clipedContainerElementIdentifier);
        }

        setChartDimension() {
            [this.width, this.height, this.chartWidth, this.chartHeight] = assistant.setDimension.apply(this.chartObject);
        }

        createScales1() {

            var xScaleMaxValue = d3.max(this.stackedData, function (d) { return d.totalValue; });

            var xScaleMinValue = d3.min(this.stackedData, function (d) { return d.totalValueMin; }),

                xAxisDomain, yAxisDomain;



            var yScaleRange = [this.chartHeight, 0];

            var xScaleRange = [0, this.chartWidth];



            xAxisDomain = [xScaleMinValue, xScaleMaxValue];

            yAxisDomain = this.data.map((d) => d[this.y]);



            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]);

            this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);



        }
        createScales() {
            //console.log("hi", this.y);
            const yAxisDomain = this.data.map(d => d[this.y]),
                yScaleRange = [this.chartHeight, 0],
                xScaleRange = [0, this.chartWidth];
            // const xAxisDomain = this.data.map(d => d[this.x]),
            //     yScaleRange = [this.chartHeight, 0],
            //     xScaleRange = [0, this.chartWidth];
            //==========//

            // let yScaleMinValue = d3.min(this.data, (d) => d[this.y]),
            //     yScaleMaxValue = d3.max(this.data, (d) => d[this.y]);
            // //console.log(yScaleMinValue,yScaleMaxValue);
            //console.log(this.x);
            let xScaleMaxValue = d3.max(this.data, (d) => d[this.x]);
            //var xScaleMaxValue = d3.max(this.stackedData, function (d) { return d.totalValue; });

            //let xScaleMinValue = d3.min(this.data, (d) => d[this.x]);
            let xScaleMinValue = 0;
            //===============//


            // if (this.isDataValueNegative) {
            //     //If minimum value is Negative - then compare mod(min -ve value) with max +ve value
            //     // whichever is greater, set that as min & max for scale
            //     if (Math.abs(yScaleMinValue) >= Math.abs(yScaleMaxValue)) {
            //         yScaleMaxValue = Math.abs(yScaleMinValue);
            //     } else {
            //         yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
            //     }
            // }

            let xAxisDomain = [xScaleMinValue, xScaleMaxValue];

            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]);
            console.log(this.xScale);
            const yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);
            console.log(yScale);
            this.ySubGroups = Object.keys(this.prepareData(this.data)[0]).slice(1);
            const yGroupRange = [0, yScale.bandwidth()];

            this.yScaleGroup = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yGroupRange, this.ySubGroups]);

            // const xScaleTicks = this.xScale.ticks();
            // console.log(xScaleTicks);
            // if (xScaleMaxValue > xScaleTicks[xScaleTicks.length - 1]) {
            // 	xScaleMaxValue =  xScaleTicks[xScaleTicks.length - 1] + xScaleTicks[xScaleTicks.length - 1] - xScaleTicks[xScaleTicks.length - 2];
            // // // 	if (this.isDataValueNegative) {
            // // // 		yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
            // // // 	}
            // xAxisDomain = [assistant.getAxisFirstTick(this.settings.xScaleType), xScaleMaxValue];
            // this.xScale.domain(xAxisDomain);
            // }
            this.yScale = yScale;


        }

        createBrushScales() {
            const xAxisDomain = this.data.map((d) => d[this.x]),
                brushYScaleRange = [this.settings.brush.height, 0],
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
            const brushYScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, brushYScaleRange, yAxisDomain]);

            brushYScale.domain(yAxisDomain);

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
        //keep
        drawGround() {
            [this.svg, this.svgGroup] = assistant.drawSVG.apply(this);
            this.updateGround();

            if (!this.isChartPlotted) {
                // Exposing svg element named as "svg"
                this.observer.exposeElement(this.elements, "svg", this.svg);
            }
        }

        updateGround() {
            assistant.updateSVG.apply(this);
            this.clipPath = this.svg.append("defs").append("clipPath")
                .attr("id", this.clipContainerId + "-ux-clip")
                .append("rect");

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
                // assistant.updateXAxis.apply(this);
                const xAxisFunction = d3.axisBottom(this.xScale)
                    //.ticks(this.settings.xAxisTicksCount.value)
                    .tickFormat(this.settings.xAxis.tickFormat);

                const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-x-axis")]);

                this.svgGroup
                    .select(".uxp-x-axis")
                    .attr("transform", "translate(0," + this.chartHeight + ")")
                    .transition(t)
                    .call(xAxisFunction);

                //this.svgGroup.select(".uxp-x-axis")
                // .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");

                // if (this.settings.xWordWrap.isVisible) {
                //     this.svgGroup.select(".uxp-x-axis").selectAll(".tick text")
                //     .call(assistant.wordWrap, this.xScale.bandwidth(), 'xAxis', this.settings.xWordWrap.linesToAddEllipses, this.containerElement);
                // }
                // else if (this.settings.rotateXAxisTick && Array.isArray(this.settings.rotateXAxisTick) && this.settings.rotateXAxisTick.length) {
                //     console.log("tes");
                //     this.svgGroup.select(".uxp-x-axis").selectAll('.tick').selectAll("text")
                //         .attr("y", this.settings.rotateXAxisTick[1])
                //         .attr("x", this.settings.rotateXAxisTick[0])
                //         .attr("transform", "rotate(" + this.settings.rotateXAxisTick[2] + ")")
                //         .style("text-anchor", "start");
                // }
                this.svgGroup.select(".uxp-x-axis").call(assistant.adjustTicks, this.settings.rotateYAxisTick, 'x');
            }
        }
        updateYAxis() {
            if (this.settings.yAxis.isVisible) {
                // update y Axis
                assistant.updateYAxis.apply(this);
            }

            if (this.settings.rotateYAxisTick.isVisible) {
                    // this.svgGroup.select(".uxp-y-axis").selectAll('.tick').selectAll("text")
                    //     .attr("y", this.settings.rotateYAxisTick[1])
                    //     .attr("x", this.settings.rotateYAxisTick[0])
                    //     .attr("transform", "rotate(" + this.settings.rotateYAxisTick[2] + ")")
                    //     .style("text-anchor", "start");


                this.svgGroup.select(".uxp-y-axis").selectAll('.tick').selectAll("text")
                    .attr("y", this.settings.rotateYAxisTick.value[1])
                    .attr("x", this.settings.rotateYAxisTick.value[0])
                    .attr("transform", "rotate(" + this.settings.rotateYAxisTick.value[2] + ")")
                    .style("text-anchor", "start");
            }
            if (this.settings.yWordWrap.isVisible) {
                this.svgGroup.select(".uxp-y-axis").selectAll(".tick text").call(assistant.wordWrap, this.yScale.bandwidth(), 'yAxis', this.settings.yWordWrap.linesToAddEllipses, this.containerElement);
            }
            // if (this.settings.yAxisTicksCount.isApplied) {
            // 	this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale).ticks(this.settings.yAxisTicksCount.value));
            // } else {
            // 	this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale));
            // }

            this.svgGroup.select(".uxp-y-axis")
                .call(assistant.adjustTicks, this.settings.rotateYAxisTick, 'y');
        }
        drawGridLines() {
            if (this.settings.yAxis.isGridsVisible) {
                assistant.drawGridLines('y', this.yScale, this.chartWidth, this.svgGroup);
            } else {
                assistant.removeGridLines('y', this.svgGroup);
            }

            if (this.settings.xAxis.isGridsVisible) {
                assistant.drawGridLines('x', this.xScale, this.chartHeight, this.svgGroup);
            } else {
                assistant.removeGridLines('x', this.svgGroup);
            }


        }

        drawBars() {
            if (this.svgGroup.select('.uxp-bars').empty()) {
                this.barGroup = this.svgGroup.append("g").attr("class", "uxp-bars").attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }

            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);

            // .attr("y", (d) => this.yScale(d[this.y]))

            // .attr("height", this.yScale.bandwidth())

            // .style("fill", function (d, i) { return (d.color) ? d.color : assistant.getDefaultColor(i); })

            // .attr("x", () => this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType))) //For Negative value)

            // .attr("width", 0)


            this.barGroup.selectAll('.uxp-bar-group')
                .data(this.prepareData(this.data))
                .join(
                    enter => enter.append('g')
                        .attr("class", "uxp-bar-group")
                        .attr("transform", d => `translate(0, ${this.yScale(d[this.y])})`)
                        .selectAll("rect")
                        .data(d => {
                            return this.ySubGroups.map((key, i) => {
                                return {
                                    key: key,
                                    value: d[key],
                                    color: this.colors ? this.colors[i] : undefined
                                };
                            });
                        })
                        .join("rect")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        }))
                .attr("class", "uxp-bar")
                .attr("y", d => {
                    return this.yScaleGroup(d.key);
                })
                .attr("width", 0)
                .attr("x", () => {
                    return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType));
                })
                .attr("height", this.yScaleGroup.bandwidth())
                .transition(t)
                .call(enter => enter.transition(t)
                    .attr("x", () => {
                        return 0;
                        // if (d.value < 0) {
                        //     return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)); //For Negative value
                        // } else {
                        //     return this.xScale(d.value); //For Positive value
                        // }
                    })
                    .attr("width", d => {
                        //Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.value));
                        //return Math.abs(this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) - this.xScale(d.value));
                        return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    }))
                .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }
                    // .attr("transform", () => {
                    //     // return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
                    //     return this.settings.barSpace.type === 'perc' ? ("translate("+ "0,"+ (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2+")") : '';
                    // }
                ),
                update => update
                    .style("fill", (d, i) => {
                        return (d.color) ? d.color : assistant.getDefaultColor(i);
                    })
                    .call(update => update.transition(t)
                        .attr("y", (d) => this.yScaleGroup(d.key))
                        .attr("height", this.yScaleGroup.bandwidth())
                        .attr("x", () => {
                            return 0;
                            // if (d.value < 0) {
                            //     return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)); //For Negative value
                            // } else {
                            //     return this.xScale(d.value); //For Positive value
                            // }
                        })
                        .attr("width", d => {
                            return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                        }
                        ))
                    .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }
                    ),
                exit => exit.remove();

            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "bar", this.barGroup.selectAll(".uxp-bar-group"));

            if (!this.isChartPlotted) {
                //Adding default action to element "bar"
                const elementInfomationObj = this.chartObject.getElement("bar");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        prepareData(data) {
            let nestedData = [];
            d3.group(data, d => d[this.y]).forEach((d, i) => {
                //console.log(d[0][this.y]);
                nestedData.push({
                    key: d[0][this.y],
                    color: d[0].color ? d[0].color : assistant.getDefaultColor(i),
                    value: d
                });
            });

            let formattedArray = [];
            nestedData.map((element) => {
                formattedArray.push({
                    [this.y]: element.key
                });
                element.value.forEach(e => {
                    formattedArray[formattedArray.length - 1][e.property] = e.value;
                });
            });
            return formattedArray;
        }

        drawBrushBars() {
            if (this.svgGroup.select('.uxp-brush-bar-group').empty()) {
                this.barBrushGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-brush-bar-group");
            }
            this.barBrushGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");

            const t = assistant.getTransitionFunction.apply(this, [this.barBrushGroup]);

            this.barBrushGroup.selectAll('.uxp-brush-bar-group')
                // Enter in data = loop group per group
                .data(this.prepareData(this.data))
                .join(
                    enter => enter.append('g')
                        .attr("class", "uxp-brush-bar-group")
                        .attr("transform", d => `translate(${this.xScale(d[this.x])}, 0)`)
                        .selectAll("rect")
                        .data(d => {
                            return this.xSubGroups.map((key, i) => {
                                return {
                                    key: key,
                                    value: d[key],
                                    color: this.colors ? this.colors[i] : undefined
                                };
                            });
                        })
                        .join("rect")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        }))
                .attr("class", "uxp-brush-bar")
                .attr("x", d => {
                    return this.xScaleGroup(d.key);
                })
                .attr("width", () => {
                    return this.settings.barSpace.type === 'perc' ? this.xScaleGroup.bandwidth() - this.xScaleGroup.bandwidth() * this.settings.barSpace.value : this.xScaleGroup.bandwidth();
                })
                .attr("y", () => {
                    return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                })
                .attr("height", 0)
                .transition(t)
                .call(enter => enter.transition(t)
                    .attr("y", (d) => {
                        if (d.value < 0) {
                            return this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                        } else {
                            return this.brushYScale(d.value); //For Positive value
                        }
                    })
                    .attr("height", (d) => {
                        return Math.abs(this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d[this.y]));
                    }))
                .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }
                ),
                exit => exit.remove();
        }

        defineBrush() {
            this.svgGroup.select('.uxp-brush').remove();
            this.brushScale = d3.scaleLinear()
                .domain([0, this.chartWidth])
                .range([0, this.chartWidth]);
            var brushFn = d3.brushX()
                .extent([
                    [0, 0],
                    [this.chartWidth, this.settings.brush.height]
                ])
                .on("start brush", (event) => {
                    this.brushed(event);
                });

            this.brushBarGroup = this.svgGroup.append("g")
                .attr("class", "uxp-brush")
                .attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")")
                .call(brushFn)
                .call(brushFn.move, [this.brushScale((this.chartWidth * this.settings.brush.offset / 100).toFixed(0)), this.brushScale((this.chartWidth * this.settings.brush.limit / 100).toFixed(0))]);
        }

        //create brush function redraw bars with selection
        brushed(event) {
            if (event.type == "start") {
                if (event.sourceEvent) {
                    var rectClass = event.sourceEvent.srcElement.className.baseVal;
                    if (rectClass.includes('selection') || rectClass.includes('handle')) {
                        return null;
                    }
                    this.xScale.range([0, this.chartWidth]);
                    this.drawBars();
                    this.drawGridLines();
                    this.drawBarLabel();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawBars();
                this.drawGridLines();
                this.drawBarLabel();
                this.updateXAxis();
                this.updateYAxis();
                this.drawAxisLabels();

            }
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
        drawBarLabel() {
            const barsGroup = this.barGroup.selectAll('.uxp-bar-group');
            // const self = this;

            if (!this.settings.barLabel.isVisible) {
                if (!barsGroup.selectAll(".uxp-bar-label").empty())
                    barsGroup.selectAll(".uxp-bar-label").remove();
                return;
            }
            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);

            barsGroup
                .selectAll(".uxp-bar-label")
                .data(this.prepareData(this.data))
                .join(
                    enter => enter.append("text")
                        .data(d => {
                            return this.ySubGroups.map((key) => {
                                return {
                                    key: key,
                                    value: d[key],
                                };
                            });
                        })
                        .join("text")
                        .attr("class", "uxp-bar-label")
                        .style("text-anchor", "middle")
                        .style("fill", "#000")
                        .text((d) => {
                            if (this.settings.barLabel.labelFormat) {
                                return this.settings.barLabel.labelFormat(d[this.x]);
                            } else {
                                return d[this.x];
                            }
                        })
                        .attr("y", d => {
                            return this.yScaleGroup(d.key) + this.yScaleGroup.bandwidth();
                        })
                        .attr("dy", (d) => {
                            if (d.value < 0) {
                                return "0.8em";
                            }
                            return "-0.1em";
                        })
                        .style("opacity", 0)
                        .call(enter => enter.transition(t)
                            .attr("x", (d) => {
                                if (d.value < 0) {
                                    return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) +
                                        Math.abs(this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) - this.xScale(d[this.x])); //For Negative value
                                } else {
                                    return this.xScale(d[this.x]) + 30; //For Positive value
                                }
                            })
                            .style("opacity", function () {
                                return 1;
                                // const box = this.getBBox();
                                // if (box.width > self.yScaleGroup.bandwidth()) {
                                //     return 1; // adjustable, display the text
                                // } else {
                                //     return 1; // not adjustable, make transparent
                                // }
                            })),
                    update => update
                        .call(update => update.transition(t)
                            .attr("y", (d) => {
                                return this.yScaleGroup(d.key) + this.yScaleGroup.bandwidth();
                            })
                            .attr("x", (d) => {
                                if (d.value < 0) {
                                    return this.xScale(d[this.x]);
                                    // return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) +
                                    // Math.abs(this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) - this.xScale(d[this.x])); //For Negative value
                                } else {

                                    return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) +
                                        Math.abs(this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)) - this.xScale(d[this.x]));//For Positive value
                                }
                            })
                            .text((d) => {
                                if (this.settings.barLabel.labelFormat) {
                                    return this.settings.barLabel.labelFormat(d[this.x]);
                                } else {
                                    return d[this.x];
                                }
                            })
                            .style("opacity", function () {
                                return 1;
                                // const box = this.getBBox();
                                // if (box.width <= self.yScaleGroup.bandwidth()) {
                                //     return 1; // adjustable, display the text
                                // } else {
                                //     return 0; // not adjustable, make transparent
                                // }
                            })),
                    exit => exit.remove()
                );
        }

        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : this.chartObject.x();
            return this.settings.xAxis.tickFormat(d[textKey]);
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

            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.prepareLegendData(), this.callbackToGetDisplayText.bind(this)]);
            assistant.positionLegend.apply(this.chartObject, [this.legendContainerElement]);
            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "legend", this.legend);
        }

        prepareLegendData() {
            let legendData = [];

            const data = this.prepareLData(this.data);
            console.log(data);
           // delete data[this.x];

           for (let index = 0; index < data.length; index++) {
            legendData.push(
                {
                    color: this.colors ? this.colors[index] : assistant.getDefaultColor(index),
                    property: data[index]['key']
                }
            );
           }
            // Object.keys(data).map((element, index) => {
            //     legendData.push(
            //         {
            //             color: this.colors ? this.colors[index] : assistant.getDefaultColor(index),
            //             property: element
            //         }
            //     );
            // });
            //console.log(legendData);
            return legendData;
        }

        prepareLData(data) {
            let nestedData = [];
            d3.group(data, d => d[this.y]).forEach((d, i) => {
                //console.log(d[0][this.y]);
                nestedData.push({
                    key: d[0][this.y],
                    color: d[0].color ? d[0].color : assistant.getDefaultColor(i),
                    value: d
                });
            });

           return nestedData;
        }


        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), d, this.settings.tooltip, event]);
            assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
            d3.select(".uxp-tooltip").style("padding", "0 0 7px");

        }

        hideTooltip() {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            d3.select(".uxp-tooltip").style("display", "none");
        }

        displayMessageOnScreen(message) {
            if (!message) {
                message = this.settings.emptyDataMessage;
            }
            assistant.displayMessageOnScreen.apply(this.chartObject, [message]);
        }

        draw() {
            assistant.emitEvent("beforeDraw", this);
            this.cleanContainer();
            this.setChartDimension();
            this.drawGround();
            if (utility.isDataEmpty(this.data)) {
                this.displayMessageOnScreen();
                this.isChartPlotted = false;
                return this.chartObject;
            }
            this.setNegativeValueFlag();
            if (!assistant.isValidbarSpaceValue.apply(this, [this.settings.barSpace])) {
                return this;
            }
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.drawBars();
            // if (this.settings.brush.isVisible) {
            // 	this.createBrushScales();
            // 	this.drawBrushBars();
            // 	this.defineBrush();
            // }
            this.drawAxisLabels();
            this.drawBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            assistant.emitEvent("completeDraw", this);
            this.isChartPlotted = true;
        }

        update() {
            this.svgGroup.select('.uxp-bars').remove();
            assistant.emitEvent("beforeUpdate", this);
            assistant.hideTooltipWrapper();
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
            //this.setNegativeValueFlag();
            if (!assistant.isValidbarSpaceValue.apply(this, [this.settings.barSpace])) {
                return this;
            }
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.drawBars();
            // if (this.settings.brush.isVisible) {
            // 	this.createBrushScales();
            // 	this.drawBrushBars();
            // 	this.defineBrush();
            // }
            this.drawAxisLabels();
            this.drawBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if (this.resizeHappening) {
                return;
            }
            this.svgGroup.select('.uxp-bars').selectAll('.uxp-bar-group').remove();
            this.resizeHappening = true;
            assistant.emitEvent("beforeResize", this);
            assistant.hideTooltipWrapper();
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
            this.drawBars();
            // if (this.settings.brush.isVisible) {
            // 	this.createBrushScales();
            // 	this.drawBrushBars();
            // 	this.defineBrush();
            // }
            this.drawAxisLabels();
            this.drawBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class HorizontalGroupedBarChart {
        constructor() {
            this[groupedBarChartFactory] = new GroupedBarChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].containerElement;
            }
            this[groupedBarChartFactory].containerElementIdentifier = args[0];
            this[groupedBarChartFactory].createContainerObject(this[groupedBarChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].x;
            }
            this[groupedBarChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].y;
            }
            this[groupedBarChartFactory].y = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[groupedBarChartFactory].width,
                height: this[groupedBarChartFactory].height,
                chartWidth: this[groupedBarChartFactory].chartWidth,
                chartHeight: this[groupedBarChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].data;
            }
            this[groupedBarChartFactory].data = args[0];
            return this;
        }

        colors(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].colors;
            }
            this[groupedBarChartFactory].colors = args[0];
            return this;
        }

        column(...args) {
            if (!args || !args.length) {
                return this[groupedBarChartFactory].column;
            }
            this[groupedBarChartFactory].column = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[groupedBarChartFactory].settings);
            }
            this[groupedBarChartFactory].settings = utility.unifyObject([this[groupedBarChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[groupedBarChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[groupedBarChartFactory].elements;
        }

        on(eventId, handler) {
            this[groupedBarChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[groupedBarChartFactory].draw();
            let result = utility.handleException(this[groupedBarChartFactory], this[groupedBarChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[groupedBarChartFactory].displayMessageOnScreen(this[groupedBarChartFactory].settings.exceptionMessage);
                this[groupedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[groupedBarChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[groupedBarChartFactory], this[groupedBarChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[groupedBarChartFactory].displayMessageOnScreen(this[groupedBarChartFactory].settings.exceptionMessage);
                this[groupedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[groupedBarChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[groupedBarChartFactory], this[groupedBarChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[groupedBarChartFactory].displayMessageOnScreen(this[groupedBarChartFactory].settings.exceptionMessage);
                this[groupedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[groupedBarChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return HorizontalGroupedBarChart;
}));