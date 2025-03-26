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
            global.vizualy.LineBarChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const lineBarChartFactory = Symbol();
    class LineBarChartFactory extends Observer {

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
            this.width;
            this.height;
            this.svg;
            this.svgGroup;
            this.barGroup;
            this.mainGroup;
            this.xScale;
            this.yScale;
            this.yLineScale;
            this.xLineScale;
            this.isAllLinesVisibilityNone;
            this.lineGroup;
            this.observer;
            this.brushScale;
            this.brushXScale;
            this.brushYScale;
            this.brushXLineScale;
            this.brushYLineScale;
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
                    tickFormat: (d) => { return d; }
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
                y1AxisLabel: {
                    value: 'Y1-axis',
                    margin: 50,
                    isVisible: true
                },
                rotateXAxisTick: {
                    value: [-10, 10, 10], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                xAxisCenter: true,
                barBuffer: { x: 0, y: 0, y1: 15 },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        // const defaultColor = assistant.getDefaultColor();
                        let tooltipElm = this.x + ': <b>' + d['value'][0][this.x] + '</b><br>';
                        d.value.forEach((element, index) => {
                            tooltipElm += "<span style='float:left;margin:5px 5px 0px 0px;width:10px;height:10px;background:" + (element.color ? element.color : assistant.getDefaultColor(index)) + "'></span>";
                            tooltipElm += element[this.stack] + ": <b>" + element[this.y.bar.key] + "</b><br>";
                        });
                        return tooltipElm;
                    },
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
                    rectWidth: 10,
                    rectHeight: 10,
                    textKey: null,
                    textFormat: (d) => d,
                },
                brush: {
                    isVisible: false,
                    limit: 30,
                    offset: 0,
                    height: 80,
                    margin: 60
                },
                xScaleType: {
                    type: "band"
                },
                yScaleType: {
                    type: 'linear'
                },
                barSpace: { type: 'perc', value: 0.1 },
                lineStrokeWidth: 2,
                barLabel: {
                    isVisible: true,
                    labelFormat: (d) => d
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
            let yScaleMaxValue = d3.max(this.stackedData, (d) => { return d.totalValue; }) + this.settings.barBuffer.y1;
            let yScaleMinValue = d3.min(this.stackedData, (d) => { return d.totalValueMin; });
            let xAxisDomain, yAxisDomain;

            const lineRangeExtent = this.getRangeForLines();
            let yLineScaleMaxValue = d3.max(lineRangeExtent);
            let yLineScaleMinValue = d3.min(lineRangeExtent),
                yLineAxisDomain;

            if (this.isDataValueNegative) {
                //If minimum value is Negative - then compare mod(min -ve value) with max +ve value
                // whichever is greater, set that as min & max for scale
                if (Math.abs(yScaleMinValue) >= Math.abs(yScaleMaxValue)) {
                    yScaleMaxValue = Math.abs(yScaleMinValue);
                } else {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }

                if (Math.abs(yLineScaleMinValue) > Math.abs(yLineScaleMaxValue)) {
                    yLineScaleMaxValue = Math.abs(yLineScaleMinValue);
                } else {
                    yLineScaleMinValue = Math.abs(yLineScaleMaxValue) * (-1);
                }
            }

            let yMaxTempValue = Math.abs(yScaleMaxValue);
            let yMinTempValue = Math.abs(yScaleMinValue);

            let bufferPercent = (yMaxTempValue > yMinTempValue) ? (this.settings.barBuffer.y * yMaxTempValue) / 100 : (this.settings.barBuffer.y * yMinTempValue) / 100;

            yMaxTempValue += bufferPercent;
            yMinTempValue += bufferPercent;

            yScaleMaxValue = (yScaleMaxValue < 0) ? (-1) * yMaxTempValue : yMaxTempValue;
            yScaleMinValue = (yScaleMinValue < 0) ? (-1) * yMinTempValue : yScaleMinValue;

            xAxisDomain = this.data.map((d) => { return d[this.x]; });
            yAxisDomain = [yScaleMinValue, yScaleMaxValue];

            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, [0, this.chartWidth + this.chartWidth * this.settings.barBuffer.x / 100], xAxisDomain]);
            this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yAxisDomain]);

            let yLineMaxTempValue = Math.abs(yLineScaleMaxValue);
            let yLineMinTempValue = Math.abs(yLineScaleMinValue);

            let lineBufferPercent = (yLineMaxTempValue > yLineMinTempValue) ? (this.settings.barBuffer.y1 * yLineMaxTempValue) / 100 : (this.settings.barBuffer.y1 * yLineMinTempValue) / 100;

            yLineMaxTempValue += lineBufferPercent;
            yLineMinTempValue += lineBufferPercent;

            yLineScaleMaxValue = (yLineScaleMaxValue < 0) ? (-1) * yLineMaxTempValue : yLineMaxTempValue;
            yLineScaleMinValue = (yLineScaleMinValue < 0) ? (-1) * yLineMinTempValue : yLineScaleMinValue;

            yLineAxisDomain = (yLineScaleMinValue < 0) ? [yLineScaleMinValue, yLineScaleMaxValue] : [0, yLineScaleMaxValue];


            this.xLineScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, [0, this.chartWidth + this.chartWidth * this.settings.barBuffer.x / 100], xAxisDomain]);
            this.yLineScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yLineAxisDomain]);
              
          
            // logic to make 0 axis align for both scales when we have below cases
            // 1. when bar is -ve and lines are +ve
            // 2. when bar is +ve and lines are -ve
            if (yScaleMinValue < 0 && !(yLineScaleMinValue < 0)) { // case 1
                yAxisDomain = [-yScaleMaxValue, yScaleMaxValue];
                this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yAxisDomain]);
                yLineAxisDomain = [-yLineScaleMaxValue, yLineScaleMaxValue];
                this.yLineScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yLineAxisDomain]);
            } else if (!(yScaleMinValue < 0) && yLineScaleMinValue < 0) { // case 2
                yLineAxisDomain = [-yLineScaleMaxValue, yLineScaleMaxValue];
                this.yLineScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yLineAxisDomain]);
                yAxisDomain = [-yScaleMaxValue, yScaleMaxValue];
                this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yAxisDomain]);
            }
            
        }

        /* We have multiple lines data and each line has min amd max value.
        so Below function will find overall min max values from data.
        */
        getRangeForLines() {
            let lineKeysArr = [],
                lineRange = [];
            if (this.y.line.linesConfig) {
                this.y.line.linesConfig.forEach((oneLineObj) => {
                    lineKeysArr.push('line_' + oneLineObj['key']);
                });
            }
            for (let i = 0; i < lineKeysArr.length; i++) {
                let range = (d3.extent(this.stackedData, (d) => { return d[lineKeysArr[i]]; }));
                lineRange.push(range[0], range[1]);
            }

            return d3.extent(lineRange);
        }

        /* If we get overall visibility for plotting line is true
        however we get false for each lines config object
        so Below function will check this.
        */
        checkForLinesVisibility() {
            if (this.y.line.isVisible && this.y.line.linesConfig) {
                this.isAllLinesVisibilityNone = true;
                this.y.line.linesConfig.forEach((oneLineObj) => {
                    if (oneLineObj.isVisible) { this.isAllLinesVisibilityNone = false; }
                });
            }
        }

        createBrushScales() {
            const self = this;
            let yAxisDomainFirstVal = 0;
            if (d3.min(self.stackedData, function (d) { return d.totalValueMin; }) < 0) {
                yAxisDomainFirstVal = d3.min(this.stackedData, function (d) { return d.totalValueMin; });
            }

            const brushXScale = assistant.setScale.apply(self.chartObject, [self.settings.xScaleType, [0, self.chartWidth], self.data.map(function (d) { return d[x]; })]);
            const brushYScale = assistant.setScale.apply(self.chartObject, [self.settings.yScaleType, [self.settings.brush.height, 0], [yAxisDomainFirstVal, d3.max(self.stackedData, function (d) { return d.totalValue; })]]);

            this.brushXLineScale = assistant.setScale.apply(self.chartObject, [self.settings.xScaleType, [0, self.chartWidth], self.data.map(function (d) { return d[x]; })]);
            this.brushYLineScale = assistant.setScale.apply(self.chartObject, [self.settings.yScaleType, [self.settings.brush.height, 0], [yAxisDomainFirstVal, d3.max(self.stackedData, function (d) { return d.totalValue; })]]);

            // xLineOverviewScale = helper.setScale.apply(chartObject, [xScaleType, [0, chartWidth], data.map(function (d) { return d[x]; })]);
            // yLineOverviewScale = helper.setScale.apply(chartObject, [yScaleType, [brush.height, 0], [yAxisDomainFirstVal, d3.max(stackedData, function (d) { return d.totalValue; })]]);


            self.brushXScale = brushXScale;
            self.brushYScale = brushYScale;
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

            if (this.y.line.isVisible) {
                // add y Axis
                assistant.drawAxisGroup.apply(this, ['y1']);
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
                    .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'x');
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

            if (this.y.line.isVisible === true && !this.isAllLinesVisibilityNone) {

                // Check if y1 Axis Group is created ? If not then create it
                if (this.svgGroup.select(".uxp-y1-axis").empty()) {
                    this.svgGroup.append("g").attr("class", "uxp-y1-axis");
                }
                // update y1 Axis
                assistant.updateY1Axis.apply(this);
                this.svgGroup.select(".uxp-y1-axis")
                    .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'y1');
            } else {
                this.svgGroup.select(".uxp-y1-axis").remove();
            }
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

        prepareData() {
            const self = this;
            const colors = [];
            this.stackedData = d3.rollup(self.data, leaves => {

                if (self.sortStack) {
                    leaves = leaves.sort((x, y) => {
                        return sortSequence.indexOf(x[self.stack]) - sortSequence.indexOf(y[self.stack]);
                    });
                } else {
                    leaves = leaves.sort((x, y) => {
                        return d3.ascending(x[self.stack], y[self.stack]);
                    });
                }
                let LeavesArray = [];
                let last = {
                    y0: assistant.getAxisFirstTick(self.settings.yScaleType),
                    y1: assistant.getAxisFirstTick(self.settings.yScaleType),
                    y2: assistant.getAxisFirstTick(self.settings.yScaleType),
                    y3: assistant.getAxisFirstTick(self.settings.yScaleType)
                };
                leaves.forEach((leaf, i) => {
                    let tempObj = leaf;
                    tempObj[self.x] = leaf[self.x];
                    tempObj.key = leaf[self.stack];
                    tempObj[self.stack] = leaf[self.stack];
                    if (self.y.line.linesConfig) {
                        self.y.line.linesConfig.forEach((oneLineObj) => {
                            if (leaf.hasOwnProperty(oneLineObj.key)) {
                                tempObj['line_' + oneLineObj.key] = leaf[oneLineObj.key];
                            }
                        });
                    }

                    if (!LeavesArray[i - 1]) {
                        if (leaf[self.y.bar.key] >= 0) {
                            tempObj.y0 = assistant.getAxisFirstTick(self.settings.yScaleType);
                            tempObj.y1 = leaf[self.y.bar.key];

                            last.y0 = assistant.getAxisFirstTick(self.settings.yScaleType);
                            last.y1 = leaf[self.y.bar.key];
                        } else {
                            tempObj.y2 = assistant.getAxisFirstTick(self.settings.yScaleType);
                            tempObj.y3 = leaf[self.y.bar.key];

                            last.y2 = assistant.getAxisFirstTick(self.settings.yScaleType);
                            last.y3 = leaf[self.y.bar.key];
                        }
                    } else {
                        if (leaf[self.y.bar.key] >= 0) {
                            tempObj.y0 = last.y0 + last.y1;
                            tempObj.y1 = leaf[self.y.bar.key];

                            last.y0 = last.y0 + last.y1;
                            last.y1 = leaf[self.y.bar.key];
                        } else {
                            tempObj.y2 = last.y2 + last.y3;
                            tempObj.y3 = leaf[self.y.bar.key];

                            last.y2 = last.y2 + last.y3;
                            last.y3 = leaf[self.y.bar.key];
                        }
                    }
                    tempObj.color = leaf.color ? leaf.color : (colors.length > 0 ? colors[i] : assistant.getDefaultColor(i));
                    LeavesArray.push(tempObj);
                });
                return LeavesArray;
            }, d => d[self.x]);
            let largeDataIndex = 0;
            let legendListCount = [];
            this.stackedData = Array.from(this.stackedData, ([key, value]) => ({ key, value }));
            this.stackedData.forEach((d) => {
                legendListCount.push(d.value.length);
            });
            let max = d3.max(legendListCount, (d) => { return d; });
            this.stackedData.forEach((entry, i) => {
                if (entry.value.length == max) {
                    max = entry.value.length;
                    largeDataIndex = i;
                    self.legendData = self.stackedData[largeDataIndex].value;
                }
            });
            this.stackedData.forEach((entry) => {
                entry['totalValue'] = d3.sum(entry.value, (d) => { return d.y1; });
                entry['totalValueMin'] = d3.sum(entry.value, (d) => { return d.y3; });
                if (self.y.line.linesConfig) {
                    self.y.line.linesConfig.forEach((oneLineObj) => {
                        /* We are taking first object line key value for ploting line. As we have multiple objects
                        for given month and that is correct because we have stacked data for bars.
                        */
                        for (let j = 0; j < entry.value.length; j++) {
                            if (entry.value[j] && entry.value[j].hasOwnProperty(oneLineObj.key)) {
                                entry['line_' + oneLineObj.key] = entry.value[j]['line_' + oneLineObj.key];
                                break;
                            }
                        }
                    });
                }
            });
        }

        createLineBars() {
            const self = this;
            let lineBarGroupDataJoin = self.svgGroup.selectAll(".uxp-bar-group")
                .remove()
                .exit()
                .data(self.stackedData);

            self.mainGroup = lineBarGroupDataJoin.enter()
                .append("g")
                .attr("class", "uxp-bar-group")
                .attr("clip-path", "url(#" + self.clipContainerId + "-ux-clip)");

            //Creating stacked bar chart with transformed data (if Stacked is selected).
            self.mainGroup.each(function () {
                d3.select(this).selectAll("rect")
                    .data((d) => { return d.value; })
                    .enter()
                    .append("rect")
                    .attr("class", "uxp-stack")
                    .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                    .attr("width", self.settings.barSpace.type === 'perc' ? (self.xScale.bandwidth() - self.xScale.bandwidth() * self.settings.barSpace.value) : self.xScale.bandwidth())
                    .attr("height", (d) => {
                        if (d.y3) {
                            return self.yScale(d.y3) - self.yScale(0);
                        }
                        return self.yScale(0) - self.yScale(d.y1);
                    })
                    .attr("x", (d) => { return self.xScale(d[self.x]); })
                    .attr("y", (d) => {
                        if (d.y3) {
                            return self.yScale(d.y2);
                        }
                        return self.yScale(d.y0) - (self.yScale(0) - self.yScale(d.y1));
                    })
                    .attr("transform", () => { return self.settings.barSpace.type === 'perc' ? "translate(" + (self.xScale.bandwidth() * self.settings.barSpace.value) / 2 + " , 0)" : ''; });
            });


            //expose element to outer world for customizations
            // this.observer.exposeElement(this.elements, "bar", this.mainGroup.selectAll(".uxp-bar-group"));
            this.observer.exposeElement(this.elements, "stack", this.svgGroup.selectAll(".uxp-bar-group"));
            this.observer.exposeElement(this.elements, "singleBar", this.svgGroup.selectAll(".uxp-bar-group").selectAll('rect'));

            if (!this.isChartPlotted) {
                //Adding default action to element "bar"
                const elementInfomationObj = this.chartObject.getElement("stack");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        createMultipleLines() {
            const self = this;
            if (!self.svgGroup.selectAll(".uxp-bar-chart-line").empty()) {
                self.svgGroup.selectAll(".uxp-bar-chart-line").remove();
            }
            if (self.y.line.linesConfig) {
                self.y.line.linesConfig.forEach((lineConfigObj) => {
                    if (lineConfigObj.isVisible) {
                        self.drawLines(lineConfigObj);
                    }
                });
            }
        }

        //Creating line with the stacked bar chart.
        drawLines(singleLineConfigObj) {
            const self = this;
            let lineType = (singleLineConfigObj.lineType != undefined) ? singleLineConfigObj.lineType : "curveMonotoneX";

            let lineBarGroupDataJoin, line;
            // We are going to now plot line in Segements - always between two points - A & B
            // If either point A or point B does not have line Data, then a line-segment between those two points
            // Will not be plotted.
            // But lets say, if point A has data, but point B does not. Then we will plot a "Dot" for Point A and vice-versa
            for (let i = 0; i < this.stackedData.length; i++) {
                const startIndex = i;
                const endIndex = i + 1;

                const lineSegmentData = [];

                if (this.stackedData[startIndex]) {
                    let islinneDataAvailable = false;
                    this.stackedData[startIndex]['value'].forEach((item) => {
                        if (item.hasOwnProperty('line_' + singleLineConfigObj['key'])) {
                            islinneDataAvailable = true;
                        }
                    });
                    if (islinneDataAvailable) {
                        lineSegmentData.push(this.stackedData[startIndex]);
                    }

                }
                if (this.stackedData[endIndex]) {
                    let islinneDataAvailable = false;
                    this.stackedData[endIndex]['value'].forEach((item) => {
                        if (item.hasOwnProperty('line_' + singleLineConfigObj['key'])) {
                            islinneDataAvailable = true;
                        }
                    });
                    if (islinneDataAvailable) {
                        lineSegmentData.push(this.stackedData[endIndex]);
                    }

                }

                lineBarGroupDataJoin = this.svgGroup.append("g")
                    .attr("class", "uxp-bar-chart-line")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");

                line = d3.line()
                    .x((d) => { return self.xLineScale(d.key); }) // set the x values for the line generator
                    .y((d) => { return self.yLineScale(d['line_' + singleLineConfigObj['key']]); }) // set the y values for the line generator
                    .curve(d3[lineType]); // apply smoothing to the line

                if (lineSegmentData.length == 2) {
                    lineBarGroupDataJoin.append("path")
                        .attr("transform", () => { return "translate(" + self.xLineScale.bandwidth() / 2 + " , 0)"; })
                        .datum(lineSegmentData) //  Binds data to the line
                        .attr("class", "si-line") // Assign a class for styling
                        .attr("style", "fill : none; stroke :" + singleLineConfigObj.color + ";stroke-width :" + self.settings.lineStrokeWidth) //apply style
                        .attr("d", line); // Calls the line generator
                }

                lineBarGroupDataJoin.selectAll(".uxp-line-dot")
                    .data(lineSegmentData)
                    .enter()
                    .append("circle")
                    .attr("class", "uxp-line-dot") // Assign a class for styling
                    .attr("transform", () => { return "translate(" + self.xLineScale.bandwidth() / 2 + " , 0)"; })
                    .attr("cx", (d) => { return self.xLineScale(d.key); })
                    .attr("cy", (d) => { return self.yLineScale((d['line_' + singleLineConfigObj['key']]) ? d['line_' + singleLineConfigObj['key']] : 0); })
                    .attr("r", singleLineConfigObj.circleRadius || 3)
                    .attr("style", (d, i) => {
                        return "fill :" + (('line_' + singleLineConfigObj['key']) ? (singleLineConfigObj.circleColor || assistant.getDefaultColor(i)) : 'rgba(0,0,0,0)');
                    });

                // Add labels on line dots
                if (singleLineConfigObj['labelConfig'] && singleLineConfigObj['labelConfig']['isVisible']) {
                    const labelConfig = singleLineConfigObj['labelConfig'];
                    lineBarGroupDataJoin.selectAll(".uxp-line-dot-label")
                        .data(lineSegmentData)
                        .enter()
                        .append("text")
                        .attr("class", "uxp-line-dot-label") // Assign a class for styling
                        .attr("transform", () => {
                            if ((labelConfig.translateX && typeof labelConfig.translateX === 'number') ||
                                (labelConfig.translateY && typeof labelConfig.translateY === 'number')) {
                                const xPos = (self.xLineScale.bandwidth() / 2) + (labelConfig.translateX ? labelConfig.translateX : 0);
                                const yPos = (labelConfig.translateY) ? labelConfig.translateY : -10;
                                return "translate(" + xPos + "," + yPos + " )";
                            } else {
                                return "translate(" + (self.xLineScale.bandwidth() / 2) + " , -10)";
                            }
                        })
                        .attr("x", (d) => { return self.xLineScale(d.key); })
                        .attr("y", (d) => { return self.yLineScale((d['line_' + singleLineConfigObj['key']]) ? d['line_' + singleLineConfigObj['key']] : 0); })
                        .text((d) => {
                            return labelConfig.format ? labelConfig.format(d['line_' + singleLineConfigObj['key']]) : d['line_' + singleLineConfigObj['key']];
                        })
                        .style("text-anchor", () => {
                            return (labelConfig.textAnchor) ? labelConfig.textAnchor : "middle";
                        })
                        .style("font-size", () => {
                            return (labelConfig.fontSize) ? labelConfig.fontSize : '12px';
                        })
                        .style("fill", () => {
                            return (labelConfig.labelColor) ? labelConfig.labelColor : "#000";
                        });
                } else {
                    this.svgGroup.selectAll(".uxp-line-dot-label").remove();
                }

            }

            this.observer.exposeElement(this.elements, "line", this.svgGroup.selectAll(".uxp-bar-chart-line"));

            if (!this.isChartPlotted) {
                //Adding default action to element "line"
                // const elementInfomationObj = this.chartObject.getElement("line");
                // elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                // elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }

        }

        createBrushLineBars() {
            const self = this;
            let brushRectGroupDataJoin = self.svgGroup.selectAll(".uxp-brush-rect-group")
                .remove()
                .exit()
                .data(self.stackedData);

            this.brushLineGroup = brushRectGroupDataJoin

                .enter()
                .append("g")
                .attr("class", "uxp-brush-rect-group");

            this.brushLineGroup.attr("transform", "translate(0," + (self.chartHeight + self.settings.brush.margin) + ")");
            //Creating stacked bar brush chart with transformed data
            this.brushLineGroup.each(function () {
                d3.select(this).selectAll("rect").data(function (d) { return d.value; })
                    .enter()
                    .append("rect").attr("class", "uxp-brush-stack")
                    .style("fill", function (d, i) { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                    .attr("width", self.settings.barSpace.type === 'perc' ? self.brushXScale.bandwidth() / 2 : self.brushXScale.bandwidth())
                    .attr("height", function (d) {
                        if (d.y3) {
                            return self.brushYScale(d.y3) - self.brushYScale(assistant.getAxisFirstTick(self.settings.yScaleType));
                        }
                        return self.brushYScale(assistant.getAxisFirstTick(self.settings.yScaleType)) - self.brushYScale(d.y1);
                    })
                    .attr("x", function (d) { return self.xScale(d[x]); })
                    .attr("y", function (d) {
                        if (d.y3) {
                            return self.brushYScale(d.y2);
                        }
                        return self.brushYScale(d.y0) - (self.brushYScale(assistant.getAxisFirstTick(self.settings.yScaleType)) - self.brushYScale(d.y1));
                    })
                    .attr("transform", function () { return self.settings.barSpace.type === 'perc' ? "translate(" + self.brushXScale.bandwidth() / 4 + " , 0)" : ''; });
            });
        }

        defineBrush() {
            this.svgGroup.select('.uxp-brush').remove();
            this.brushScale = d3.scaleLinear()
                .domain([0, this.chartWidth])
                .range([0, this.chartWidth]);
            let brushFn = d3.brushX()
                .extent([
                    [0, 0],
                    [this.chartWidth, this.settings.brush.height]
                ])
                .on("start brush", (event) => {
                    this.brushed(event);
                });

            this.brushLineGroup = this.svgGroup.append("g")
                .attr("class", "uxp-brush")
                .attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")")
                .call(brushFn)
                .call(brushFn.move, [this.brushScale((this.chartWidth * this.settings.brush.offset / 100).toFixed(0)), this.brushScale((this.chartWidth * this.settings.brush.limit / 100).toFixed(0))]);
        }
        //create brush function redraw lines with selection
        brushed(event) {
            if (event.type == "start") {
                if (event.sourceEvent) {
                    let rectClass = event.sourceEvent.srcElement.className.baseVal;
                    if (rectClass.includes('selection') || rectClass.includes('handle')) {
                        return null;
                    }
                    this.xScale.range([0, this.chartWidth]);
                    this.xLineScale.range([0, this.chartWidth]);
                    this.drawGridLines();
                    this.createLineBars();
                    if (this.y.line.isVisible) {
                        this.createMultipleLines();
                    }
                    this.createBarLabel();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.xLineScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawGridLines();
                this.createLineBars();
                if (this.y.line.isVisible) {
                    this.createMultipleLines();
                }
                this.createBarLabel();
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

            if (this.y.line.isVisible && !this.isAllLinesVisibilityNone) {
                if (this.settings.y1AxisLabel.isVisible) {
                    assistant.drawAxisLabels.apply(this.chartObject, ['y1', this.svgGroup]);
                } else {
                    assistant.removeAxisLabel('y1', this.svgGroup);
                }
            }
        }

        createBarLabel() {
            const self = this;
            self.mainGroup.selectAll(".uxp-bar-label").remove();
            if (!self.settings.barLabel.isVisible) {
                return false;
            }
            self.mainGroup.each(function () {
                let text = d3.select(this).selectAll("text")
                    .data((d) => { return d.value; })
                    .enter()
                    .append("text").attr("class", "uxp-bar-label")
                    .attr("y", (d) => {
                        if (d.y3) {
                            return self.yScale(d.y3) - 5;
                        }
                        assistant.getAxisFirstTick(self.settings.yScaleType);
                        return self.yScale(d.y0) - ((self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType) / 2) - self.yScale(d.y1))) / 2 + 5;
                    })
                    .text((d) => {
                        if (d.y3) {
                            return self.settings.barLabel.labelFormat(d.y3);
                        } else {
                            return self.settings.barLabel.labelFormat(d.y1);
                        }
                    })
                    .style("text-anchor", "middle")
                    .style("fill", (d) => { return (d.barLabelColor) ? d.barLabelColor : "#000"; })
                    .style("opacity", function (d) {
                        let box = this.getBBox();
                        let validatedBarSpace;
                        if (self.settings.barSpace.type === 'px') {
                            validatedBarSpace = self.settings.barSpace.value >= self.xScale.bandwidth() ? self.xScale.bandwidth() / 10 : self.settings.barSpace.value;
                        }
                        let barValue = self.settings.barSpace.type === 'perc' ? self.xScale.bandwidth() * self.settings.barSpace.value : (validatedBarSpace / self.xScale.bandwidth());
                        let y;
                        if (d.y3) { y = d.y3; } else { y = d.y1; }
                        if (box.width <= (self.xScale.bandwidth() - barValue) && box.height <= Math.abs(self.yScale(assistant.getAxisFirstTick(self.settings.yScaleType)) - self.yScale(y))) {
                            return 1; // fits, show the text
                        } else {
                            return 0; // does not fit, make transparent
                        }
                    });
                text.attr("x", (d) => { return self.xScale(d[self.x]) + (self.xScale.bandwidth() / 2); });
            });
        }

        callbackToGetDisplayText(d) {
            return this.settings.legend.textKey ? this.settings.legend.textKey : d[this.stack];
        }

        createTooltipLine() {
            this.tooltipLine = this.svgGroup.append("line-bar")
                .attr("class", "uxp-tooltip-line-bar")
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
            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.legendData, this.callbackToGetDisplayText.bind(this)]);
            assistant.positionLegend.apply(this.chartObject, [this.legendContainerElement]);
            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "legend", this.legend);
        }

        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), d, this.settings.tooltip, event]);
            assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
        }

        prepareChartData(data) {
            let nestedData = [];
            // const defaultColor = assistant.getDefaultColor();
            d3.group(data, d => d[this.line]).forEach((d, i) => {
                nestedData.push({
                    key: d[0][this.line],
                    color: d[0].color ? d[0].color : assistant.getDefaultColor(i),
                    value: d
                });
            });
            return nestedData;
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
            this.prepareData();
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.createLineBars();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.createBrushLineBars();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.createBarLabel();
            this.drawLegend();
            if (this.y.line.isVisible) {
                this.createMultipleLines();
            } else {
                this.svgGroup.selectAll(".uxp-bar-chart-line").remove();
            }
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
            this.prepareData();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.createLineBars();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.createBrushLineBars();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawLegend();
            this.createBarLabel();
            if (this.y.line.isVisible) {
                this.createMultipleLines();
            } else {
                this.svgGroup.selectAll(".uxp-bar-chart-line").remove();
            }
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
            this.createLineBars();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.createBrushLineBars();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawLegend();
            this.createBarLabel();
            if (this.y.line.isVisible) {
                this.createMultipleLines();
            } else {
                this.svgGroup.selectAll(".uxp-bar-chart-line").remove();
            }
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
                this.createTooltipLine();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class LineBarChart {
        constructor() {
            this[lineBarChartFactory] = new LineBarChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[lineBarChartFactory].containerElement;
            }
            this[lineBarChartFactory].containerElementIdentifier = args[0];
            this[lineBarChartFactory].createContainerObject(this[lineBarChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[lineBarChartFactory].x;
            }
            this[lineBarChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[lineBarChartFactory].y;
            }
            this[lineBarChartFactory].y = args[0];
            return this;
        }

        stack(...args) {
            if (!args || !args.length) {
                return this[lineBarChartFactory].stack;
            }
            this[lineBarChartFactory].stack = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[lineBarChartFactory].width,
                height: this[lineBarChartFactory].height,
                chartWidth: this[lineBarChartFactory].chartWidth,
                chartHeight: this[lineBarChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[lineBarChartFactory].data;
            }
            this[lineBarChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[lineBarChartFactory].settings);
            }
            this[lineBarChartFactory].settings = utility.unifyObject([this[lineBarChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[lineBarChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[lineBarChartFactory].elements;
        }

        on(eventId, handler) {
            this[lineBarChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[lineBarChartFactory].draw();
            let result = utility.handleException(this[lineBarChartFactory], this[lineBarChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[lineBarChartFactory].displayMessageOnScreen(this[lineBarChartFactory].settings.exceptionMessage);
                this[lineBarChartFactory].isChartPlotted = false;
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[lineBarChartFactory], this[lineBarChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[lineBarChartFactory].displayMessageOnScreen(this[lineBarChartFactory].settings.exceptionMessage);
                this[lineBarChartFactory].isChartPlotted = false;
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[lineBarChartFactory], this[lineBarChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[lineBarChartFactory].displayMessageOnScreen(this[lineBarChartFactory].settings.exceptionMessage);
                this[lineBarChartFactory].isChartPlotted = false;
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return LineBarChart;
}));