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
            global.vizualy.VerticalStackedBarChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const verticalStackedBarChartFactory = Symbol();
    class VerticalStackedBarChartFactory extends Observer {

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
            this.stack;
            this.data;
            this.stackedData;
            this.legendData;
            this.isChartPlotted = false;
            this.width,
            this.height,
            this.svg;
            this.svgGroup;
            this.rectGroup;
            this.xScale;
            this.yScale;
            this.barGroup;
            this.brushScale;
            this.clipPath;
            this.brushXScale;
            this.brushYScale;
            this.brushBarGroup;
            this.observer;
            this.isDataValueNegative = false,
            this.isAllDataValuesNegative = false,
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
                stackedBarLabel: {
                    isVisible: true,
                    labelFormat: (d) => d
                },
                barSpace : {type: 'perc', value: 0.1 },
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
                        let ttCont = this.x + ": <b>" + d.key + "</b><br>";
                        d.value.forEach((ele) => {
                            ttCont += '<span style="background-color: '+ ele.color + ';display:inline-block;margin-right:4px;height: 8px;width: 8px;border-radius: 4px;vertical-align: middle;"></span>' + ele[this.stack] + ": <b>" + ele[this.y] + "</b><br></div>";
                        });
                        return ttCont;
                    },
                    placement: "top-right"
                },
                xWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
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
                xScaleType: {
                    type: "band"
                },
                yScaleType: {
                    type: 'linear'
                },
                yAxisTicksCount : {value: 3, isApplied: false },
                rotateXAxisTick: {
                    value: [-10, 10, 10], // [relative X position of ticks label, relative y position, rotation-angle]
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

        prepareData() {

            let _this = this;
            this.stackedData = [];
            d3.group(this.data, d => d[this.x]).forEach((leaves) => {

                leaves = leaves.sort(function (x, y) {
                    return d3.ascending(x[_this.stack], y[_this.stack]);
                });
                var leavesArray = [];
                var last = {
                    y0: assistant.getAxisFirstTick(_this.settings.yScaleType),
                    y1: assistant.getAxisFirstTick(_this.settings.yScaleType),
                    y2: assistant.getAxisFirstTick(_this.settings.yScaleType),
                    y3: assistant.getAxisFirstTick(_this.settings.yScaleType)
                };
                leaves.forEach(function (leaf, i) {
                    var tempObj = leaf;

                    tempObj[_this.x] = leaf[_this.x];
                    tempObj.key = leaf[_this.stack];
                    tempObj[_this.stack] = leaf[_this.stack];

                    if (!leavesArray[i - 1]) {
                        if (leaf[_this.y] >= 0) {
                            tempObj.y0 = assistant.getAxisFirstTick(_this.settings.yScaleType);
                            tempObj.y1 = leaf[_this.y];

                            last.y0 = assistant.getAxisFirstTick(_this.settings.yScaleType);
                            last.y1 = leaf[_this.y];
                        } else {
                            tempObj.y2 = assistant.getAxisFirstTick(_this.settings.yScaleType);
                            tempObj.y3 = leaf[_this.y];

                            last.y2 = assistant.getAxisFirstTick(_this.settings.yScaleType);
                            last.y3 = leaf[_this.y];
                        }
                    } else {
                        if (leaf[_this.y] >= 0) {
                            tempObj.y0 = last.y0 + last.y1;
                            tempObj.y1 = leaf[_this.y];

                            last.y0 = last.y0 + last.y1;
                            last.y1 = leaf[_this.y];
                        } else {
                            tempObj.y2 = last.y2 + last.y3;
                            tempObj.y3 = leaf[_this.y];

                            last.y2 = last.y2 + last.y3;
                            last.y3 = leaf[_this.y];
                        }
                    }
                    tempObj.color = leaf.color ? leaf.color : assistant.getDefaultColor(i);
                    leavesArray.push(tempObj);

                });
                _this.stackedData.push({
                    key: leaves[0][_this.x],
                    value: leavesArray
                });
            });

            this.legendData = [];
            this.stackedData.forEach((entry) => {
                let currentBarData = [];
                entry.value.forEach(d => {
                    if (this.legendData.map(datum => datum[this.stack]).indexOf(d[this.stack]) == -1)
                        currentBarData.push(d);
                });
                this.legendData = [...this.legendData, ...currentBarData];
                entry['totalValue'] = d3.sum(entry.value, function (d) { return d.y1; });
                entry['totalValueMin'] = d3.sum(entry.value, function (d) { return d.y3; });
            });
        }
        createScales() {
            var yScaleMaxValue = d3.max(this.stackedData, function (d) { return d.totalValue; });
            var yScaleMinValue = d3.min(this.stackedData, function (d) { return d.totalValueMin; }),
			xAxisDomain, yAxisDomain;

            var yScaleRange = [this.chartHeight, 0];
            var xScaleRange = [0, this.chartWidth];

            xAxisDomain = this.data.map((d) => d[this.x]);
            yAxisDomain = [yScaleMinValue, yScaleMaxValue];

            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]);
            this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);
        }
        createBrushScales() {
            const xAxisDomain = this.data.map((d) => d[this.x]),
                brushYScaleRange = [this.settings.brush.height, 0],
                xScaleRange = [0, this.chartWidth];

            let yScaleMinValue = d3.min(this.stackedData, function (d) { return d.totalValueMin; }),
                yScaleMaxValue = d3.max(this.stackedData, function (d) { return d.totalValue; });

           let yAxisDomain = [yScaleMinValue, yScaleMaxValue];

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
                assistant.updateXAxis.apply(this);
                this.svgGroup.select(".uxp-x-axis")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");

                if (this.settings.xWordWrap.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick text")
                        .call(assistant.wordWrap, this.xScale.bandwidth(), 'xAxis', this.settings.xWordWrap.linesToAddEllipses, this.containerElement);
                }
                if (this.settings.rotateXAxisTick.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll('.tick').selectAll("text")
                        .attr("y", this.settings.rotateXAxisTick.value[1])
                        .attr("x", this.settings.rotateXAxisTick.value[0])
                        .attr("transform", "rotate(" + this.settings.rotateXAxisTick.value[2] + ")")
                        .style("text-anchor", "start");
                }
                this.svgGroup.select(".uxp-x-axis")
                    .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'x' );
            }

        }

        updateYAxis() {
            if (this.settings.yAxis.isVisible) {
                // update y Axis
                assistant.updateYAxis.apply(this);

                if (this.settings.yAxisTicksCount.isApplied) {
                    this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale).ticks(this.settings.yAxisTicksCount.value));
                } else {
                    this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale));
                }

                this.svgGroup.select(".uxp-y-axis")
                    .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'y' );
            }
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

        drawStackedBars() {
            if (this.svgGroup.select('.uxp-stacked-bar-group').empty()) {
                this.barGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-stacked-bar-group")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);

            if (!this.barGroup.select('.uxp-rect-group').empty()) {
                this.barGroup.selectAll('.uxp-rect-group').remove();
            }

            this.barGroup
                .selectAll('.uxp-stacked-bar-group')
                .data(this.stackedData)
                .join(
                    enter => {
                        this.rectGroup = enter.append('g')
                            .attr("class", "uxp-rect-group");
                        this.rectGroup
                            .selectAll('rect')
                            .data(d => d.value)
                            .join(
                                enter => enter
                                    .append("rect")
                                    .attr("class", "uxp-stack")
                                    .attr("x", (d) => this.xScale(d[this.x]))
                                    .attr("width", this.xScale.bandwidth())
                                    .style("fill", function (d, i) { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                    .attr("y", () => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) //For Negative value)
                                    .attr("height", 0)
                                    .attr("transform", () => {
                                        return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
                                     })
                                    .call(enter => enter.transition(t)
                                        .attr("y", (d) => {
                                            if (d.y3) {
                                                return this.yScale(d.y2);
                                            }
                                            return this.yScale(d.y0) - (this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1));
                                        })
                                        .attr("height", (d) => {
                                            // (d) => Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1))
                                            if (d.y3) {
                                                return this.yScale(d.y3) - this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                                            }
                                            // return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1);
                                            return Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1));
                                        }
                                        )
                                    ),
                                update => update
                                    .call(update => update.transition(t)
                                        .attr("y", (d) => {
                                            if (d.y3) {
                                                return this.yScale(d.y2);
                                            }
                                            return this.yScale(d.y0) - (this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1));
                                        })
                                        .attr("height", (d) => {
                                            // (d) => Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1))
                                            if (d.y3) {
                                                return this.yScale(d.y3) - this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                                            }
                                            return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1);
                                        })
                                    ),
                                exit =>  exit.remove()
                            );

                    },
                    update => {
                            update
                                .selectAll('.uxp-rect-group')
                                .attr("x", (d) => this.xScale(d[this.x]))
                                .attr("width", this.xScale.bandwidth())
                                .style("fill", function (d, i) { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                .attr("y", () => this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType))) //For Negative value)
                                .attr("height", 0)
                                .attr("transform", () => {
                                    return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
                                })
                                .call(enter => enter.transition(t)
                                    .attr("y", (d) => {
                                        if (d.y3) {
                                            return this.yScale(d.y2);
                                        }
                                        return this.yScale(d.y0) - (this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1));
                                    })
                                    .attr("height", (d) => {
                                        // (d) => Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1))
                                        if (d.y3) {
                                            return this.yScale(d.y3) - this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                                        }
                                        return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1);
                                    })
                                );
                    },
                    exit => exit.remove()
                );

            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "stacked-bar", this.barGroup.selectAll(".uxp-rect-group"));
            this.observer.exposeElement(this.elements, "single-stack", this.barGroup.selectAll(".uxp-stack"));

            if (!this.isChartPlotted) {
                //Adding default action to element "stacked bar"
                const elementInfomationObj = this.chartObject.getElement("stacked-bar");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
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


        drawStackedBarLabel() {
            if (!this.settings.stackedBarLabel.isVisible) {
                if (!this.barGroup.selectAll(".uxp-stacked-bar-label").empty()) {
                    this.barGroup.selectAll(".uxp-stacked-bar-label").remove();
                }
                return;
            }
            const self = this;
            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);
            this.rectGroup.each(function() {
                d3.select(this).selectAll(".uxp-stacked-bar-label")
                .data(function (d) { return d.value; })
                .join(
                    enter => enter
                        .append("text")
                        .attr("class", "uxp-stacked-bar-label")
                        .style("text-anchor", "middle")
                        .style("fill", "#000")
                        .attr("dy", "-0.1em")
                        .attr("x", (d) => {
                            return self.xScale(d[self.x]) + (self.xScale.bandwidth() / 2);
                        })
                        .attr("y", () => {
                            return (self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)));
                        })
                        .text((d) => {
                            if (self.settings.stackedBarLabel.labelFormat) {
                                return self.settings.stackedBarLabel.labelFormat(d[self.y]);
                            } else {
                                return d[self.y];
                            }
                        })
                        .style("visibility", function (d) {
                            const box = this.getBBox();if (d.y3) { var y = d.y3; } else { y = d.y1; }
                            if (box.width <= self.xScale.bandwidth()  && box.height <= Math.abs(self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)) - self.yScale(y))) {
                                return 'visible'; // adjustable, display the text
                            } else {
                                console.log('hello');
                                return 'hidden'; // not adjustable, make transparent
                            }
                        })
                        .call(enter => enter.transition(t)
                            .attr("y", (d) => {
                                if (d.y3) {
                                    return self.yScale(d.y3) - (self.yScale(d.y3) - self.yScale(d.y2)) / 2;
                                }
                                return self.yScale(d.y0) - ((self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType) / 2) - self.yScale(d.y1))) / 2 + 5;
                            })
                        ),
                    update => {
                            update
                                .selectAll("class", "uxp-stacked-bar-label")
                                .style("text-anchor", "middle")
                                .style("fill", "#000")
                                .attr("dy", "-0.1em")
                                .attr("x", (d) => {
                                    return self.xScale(d[self.x]) + (self.xScale.bandwidth() / 2);
                                })
                                .attr("y", () => {
                                    return (self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)));
                                })
                                .call(enter => enter.transition(t)
                                    .attr("y", (d) => {
                                        if (d.y3) {
                                            return self.yScale(d.y3) - (self.yScale(d.y3) - self.yScale(d.y2)) / 2;
                                        }
                                        return self.yScale(d.y0) - ((self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType) / 2) - self.yScale(d.y1))) / 2 + 5;
                                    })
                                    .text((d) => {
                                        if (self.settings.stackedBarLabel.labelFormat) {
                                            return self.settings.stackedBarLabel.labelFormat(d[self.y]);
                                        } else {
                                            return d[self.y];
                                        }
                                    })
                                    .style("visibility", function (d) {
                                        const box = this.getBBox();
                                        if (d.y3) { var y = d.y3; } else { y = d.y1; }
                                        if (box.width <= self.xScale.bandwidth()  && box.height <= Math.abs(self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)) - self.yScale(y))) {
                                            return 'visible'; // adjustable, display the text
                                        } else {
                                            console.log('hello');
                                            return 'hidden'; // not adjustable, make transparent
                                        }
                                    })
                                );
                            },
                        exit => exit.remove()
                    );
            });

        }
        drawBrushStackedBars() {
            this.svgGroup.select('.uxp-stacked-bar-brush-group').remove();
            if (this.svgGroup.select('.uxp-stacked-bar-brush-group').empty()) {
                this.brushBarGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-stacked-bar-brush-group");
            }
            this.brushBarGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");
            const t = assistant.getTransitionFunction.apply(this, [this.brushBarGroup]);

            if (!this.brushBarGroup.select('.uxp-rect-brush-group').empty()) {
                this.brushBarGroup.selectAll('.uxp-rect-brush-group').remove();
            }

            this.brushBarGroup
                .selectAll('.uxp-stacked-bar-brush-group')
                .data(this.stackedData)
                .join(
                    enter => {
                        this.rectGroup = enter.append('g')
                            .attr("class", "uxp-rect-brush-group");
                        this.rectGroup
                            .selectAll('rect')
                            .data(d => d.value)
                            .join(
                                enter => enter
                                    .append("rect")
                                    .attr("class", "uxp-stack-brush")
                                    .attr("x", (d) => this.xScale(d[this.x]))
                                    .attr("width", this.xScale.bandwidth())
                                    .style("fill", function (d, i) { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                    .attr("y", () => this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType))) //For Negative value)
                                    .attr("height", 0)
                                    .attr("transform", () => {
                                        return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
                                     })
                                    .call(enter => enter.transition(t)
                                        .attr("y", (d) => {
                                            if (d.y3) {
                                                return this.brushYScale(d.y2);
                                            }
                                            return this.brushYScale(d.y0) - (this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d.y1));
                                        })
                                        .attr("height", (d) => {
                                            // (d) => Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1))
                                            if (d.y3) {
                                                return this.brushYScale(d.y3) - this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                                            }
                                            // return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1);
                                            return Math.abs(this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d.y1));
                                        }
                                        )
                                    ),
                                update => update
                                    .call(update => update.transition(t)
                                        .attr("y", (d) => {
                                            if (d.y3) {
                                                return this.brushYScale(d.y2);
                                            }
                                            return this.brushYScale(d.y0) - (this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d.y1));
                                        })
                                        .attr("height", (d) => {
                                            // (d) => Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d.y1))
                                            if (d.y3) {
                                                return this.brushYScale(d.y3) - this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType));
                                            }
                                            return this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d.y1);
                                        })
                                    ),
                                exit =>  exit.remove()
                            );

                    },
                    exit => exit.remove()
                );
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
                    this.drawStackedBars();
                    this.drawGridLines();
                    this.drawStackedBarLabel();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawStackedBars();
                this.drawGridLines();
                this.drawStackedBarLabel();
                this.updateXAxis();
                this.updateYAxis();
                this.drawAxisLabels();

            }
        }
        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : d[this.stack];
            return this.settings.xAxis.tickFormat(textKey);
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
            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.legendData, this.callbackToGetDisplayText.bind(this)]);
            assistant.positionLegend.apply(this.chartObject, [this.legendContainerElement]);
            this.observer.exposeElement(this.elements, "legend", this.legend);
        }

        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }

            /*
                Below lines of code adding one flag in each bar object for giving info about which stack
                is hovered from the particular group.
            */
            var singleHoveredStack = event.target.__data__;
            if (d && d.value && Array.isArray(d.value) && singleHoveredStack.key) {
                d.value.forEach(obj => {
                    obj.isStackHovered = (obj.key == singleHoveredStack.key) ? true : false;
                });
            }
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), d, this.settings.tooltip, event]);
            assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
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
            this.prepareData();
            // this.setNegativeValueFlag();
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.drawStackedBars();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushStackedBars();
				this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawStackedBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            assistant.emitEvent("completeDraw", this);
            this.isChartPlotted = true;
        }

        update() {
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
            this.prepareData();
            this.setChartDimension();
            this.updateGround();
            // this.setNegativeValueFlag();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.drawStackedBars();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushStackedBars();
				this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawStackedBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if (this.resizeHappening)
                return;
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
            this.drawStackedBars();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushStackedBars();
				this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawStackedBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class VerticalStackedBarChart {
        constructor() {
            this[verticalStackedBarChartFactory] = new VerticalStackedBarChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[verticalStackedBarChartFactory].containerElement;
            }
            this[verticalStackedBarChartFactory].containerElementIdentifier = args[0];
            this[verticalStackedBarChartFactory].createContainerObject(this[verticalStackedBarChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[verticalStackedBarChartFactory].x;
            }
            this[verticalStackedBarChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[verticalStackedBarChartFactory].y;
            }
            this[verticalStackedBarChartFactory].y = args[0];
            return this;
        }

        stack(...args) {
            if (!args || !args.length) {
                return this[verticalStackedBarChartFactory].stack;
            }

            this[verticalStackedBarChartFactory].stack = args[0];
            return this;
        }


        activeDimension() {
            return {
                width: this[verticalStackedBarChartFactory].width,
                height: this[verticalStackedBarChartFactory].height,
                chartWidth: this[verticalStackedBarChartFactory].chartWidth,
                chartHeight: this[verticalStackedBarChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[verticalStackedBarChartFactory].data;
            }
            this[verticalStackedBarChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[verticalStackedBarChartFactory].settings);
            }
            this[verticalStackedBarChartFactory].settings = utility.unifyObject([this[verticalStackedBarChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[verticalStackedBarChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[verticalStackedBarChartFactory].elements;
        }

        on(eventId, handler) {
            this[verticalStackedBarChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[verticalStackedBarChartFactory].draw();
            let result = utility.handleException(this[verticalStackedBarChartFactory], this[verticalStackedBarChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[verticalStackedBarChartFactory].displayMessageOnScreen(this[verticalStackedBarChartFactory].settings.exceptionMessage);
                this[verticalStackedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[verticalStackedBarChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[verticalStackedBarChartFactory], this[verticalStackedBarChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[verticalStackedBarChartFactory].displayMessageOnScreen(this[verticalStackedBarChartFactory].settings.exceptionMessage);
                this[verticalStackedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[verticalStackedBarChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[verticalStackedBarChartFactory], this[verticalStackedBarChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[verticalStackedBarChartFactory].displayMessageOnScreen(this[verticalStackedBarChartFactory].settings.exceptionMessage);
                this[verticalStackedBarChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[verticalStackedBarChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return VerticalStackedBarChart;
}));
