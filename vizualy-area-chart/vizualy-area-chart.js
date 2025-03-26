(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('@impetusuxp/vizualy-assistant/src/js/utility'),
            require('@impetusuxp/vizualy-assistant/src/js/assistant'),
            require('@impetusuxp/vizualy-assistant/src/js/observer'),
            require('d3')
        );
        // eslint-disable-next-line no-undef
    } else if (typeof define === 'function' && define.amd) {
        // eslint-disable-next-line no-undef
        define(['../vizualy-assistant/src/js/utility',
            '../vizualy-assistant/src/js/assistant',
            '../vizualy-assistant/src/js/observer',
            '../libs/d3.v6.min.js'], factory);
    } else {
        if (global.vizualy) {
            global.vizualy.AreaChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const areaChartFactory = Symbol();
    class AreaChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();

            this.clipContainerId;
            this.containerElementIdentifier;
            this.containerElement;
            this.legendContainerElement;
            this.x;
            this.y;
            this.data;
            this.isChartPlotted = false;
            this.width,
                this.height,
                this.svg;
            this.svgGroup;
            this.xScale;
            this.yScale;
            //this.barGroup;
            this.observer;
            this.isDataValueNegative = false;
            this.isAllDataValuesNegative = false;
            this.elements = {};
            // new variables for area chart
            this.xScaleType = {
                type: "band"
            };

            this.area;
            this.brushScale;
            this.brushXScale;
            this.brushYScale;
            this.brushAreaGroup;

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
                    value: [0, 0, 0], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        //const defaultColor = assistant.getDefaultColor();
                        let tooltipElm = '<span style="text-transform:capitalize">' + this.x + '</span>: <b>' + this.settings.xAxis.tickFormat(d[0][this.x]) + '</b><br>';
                        d.forEach((element, index) => {
                            tooltipElm += "<span style='float:left;margin:5px 5px 0px 0px;width:10px;height:10px;background:" + (element.color ? element.color : assistant.getDefaultColor(index)) + "'></span>";
                            tooltipElm += '<span style="text-transform:capitalize">'+ element[this.area] + "</span>: <b>" + element[this.y] + "</b><br>";
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
                    type: "time"
                },
                yScaleType: {
                    type: 'linear'
                },
                yAxisTicksCount: { value: 3, isApplied: false },
                brush: {
                        isVisible: false,
                        limit: 30,
                        offset: 0,
                        height: 80,
                        margin: 60
                    },
                xWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                isResponsive: true,
                colors: [],
                emptyDataMessage: 'No Data Available',
                exceptionMessage: 'Something went wrong!! Please look into logs.'
            };
        }

        cleanContainer() {
            assistant.cleanContainer(this.containerElement);
            assistant.hideTooltipWrapper();
            this.tooltipArea = undefined;
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

            //this.xScale = d3.scaleTime().domain(xAxisDomain).range(xScaleRange); // assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]).padding(.1);
            //this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);

            //new scale
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
            const xAxisDomain = d3.extent(data, (d) => d[this.x]),
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
        checkDuplicateData() {
            const nestedData = [];
            d3.group(this.data, d => d[this.x]).forEach((d, i) => {
                let total = 0;
                 if(d && d.length > 1) {
                    let tempObj = d[0];
                    d.forEach((i) => {
                        total += i[this.y];
                    })
                    tempObj[this.x] = d[0][this.x];
                    tempObj[this.y] = total;
                    tempObj[this.area] = d[0][this.area];
                    nestedData.push(tempObj);
                    console.warn('found duplicate data so showing summed results.');
                 } else {
                    nestedData.push(d[0]);
                 }
            });
            this.data = nestedData;
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
                if (this.settings.xWordWrap.isVisible && this.settings.xScaleType.type === 'band') {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick text")
                    .call(assistant.wordWrap, this.xScale.bandwidth(), 'xAxis', this.settings.xWordWrap.linesToAddEllipses, this.containerElement);
                }
                if (this.settings.rotateXAxisTick.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick").selectAll("text")
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
            }
            if (this.settings.yAxisTicksCount.isApplied) {
                this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale).ticks(this.settings.yAxisTicksCount.value));
            } else {
                this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale));
            }

            this.svgGroup.select(".uxp-y-axis")
            .call(assistant.adjustTicks, this.settings.rotateXAxisTick, 'y' );
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

        drawArea() {
            // eslint-disable-next-line no-unused-vars
            const { animation } = this.settings;
            if (this.svgGroup.select('.uxp-area-group').empty()) {
                this.areaGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-area-group")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }

            if (!this.areaGroup.select('.uxp-area').empty()) {
                this.areaGroup.selectAll('.uxp-area').remove();
            }
            const t = assistant.getTransitionFunction.apply(this, [this.areaGroup]);

            //const defaultColor = assistant.getDefaultColor();
            //this.createZeroLengthArray();
            //this.calculatedArea(this.data);
            this.areaGroup
                .selectAll(".uxp-area")
                .data(this.prepareChartData(this.data))
                .join(
                    enter => {
                        if (animation.isProgressive) {
                            let path = enter.append("path")
                                .attr("d", d => this.calculatedArea(d, false))
                                .attr("class", "uxp-area")
                                .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                .style('opacity', 0.5)
                                .call(enter => enter.transition(t)
                                .attr("d", d => this.calculatedArea(d,true))
                                );
                            return path;
                        } else {
                            let path = enter.append("path")
                                .call(enter => enter.transition(t)
                                    .attr('d', (d) => {
                                        return d3.area()
                                            .x(d => this.xScale(d[this.x]))
                                            .y0(this.chartHeight)
                                            .y1(d => this.yScale(d[this.y]))
                                            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                    })
                                    .attr("class", "uxp-area")
                                    .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); }))
                                    .style('opacity', 0.7);
                            return path;
                        }
                    },
                    update => update
                        .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                        .call(update => update.transition(t)),
                    exit => {
                        console.log('exited');
                        return exit.remove();
                    }
                );

            //expose element to outer world for customizations
            // this.observer.exposeElement(this.elements, "area", this.areaGroup.selectAll(".uxp-area"));
            this.observer.exposeElement(this.elements, "areaGroup", this.areaGroup);
            this.observer.exposeElement(this.elements, "area", this.areaGroup.selectAll(".uxp-area"));
            if (!this.isChartPlotted) {

                const elementInfomationObj = this.chartObject.getElement("area");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        drawBrushArea() {
            // eslint-disable-next-line no-unused-vars
            const { animation } = this.settings;
            if (!this.svgGroup.select('.uxp-area-brush-group').empty()) {
                this.svgGroup.select('.uxp-area-brush-group').remove();
            }
            if (this.svgGroup.select('.uxp-area-brush-group').empty()) {
                this.brushAreaGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-area-brush-group");
            }

            if (!this.brushAreaGroup.select('.uxp-brush-area').empty()) {
                this.brushAreaGroup.selectAll('.uxp-brush-area').remove();
            }
            this.brushAreaGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");
            const t = assistant.getTransitionFunction.apply(this, [this.brushAreaGroup]);

            //const defaultColor = assistant.getDefaultColor();
            //this.createZeroLengthArray();
            //this.calculatedArea(this.data);
            this.brushAreaGroup
                .selectAll(".uxp-brush-area")
                .data(this.prepareChartData(this.data))
                .join(
                    enter => {
                        if (animation.isProgressive) {
                            let path = enter.append("path")
                                .attr("d", d => this.calculatedBrushArea(d, false))
                                .attr("class", "uxp-brush-area")
                                .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                                .style('opacity', 0.5)
                                .call(enter => enter.transition(t)
                                .attr("d", d => this.calculatedBrushArea(d,true))
                                );
                            return path;
                        } else {
                            let path = enter.append("path")
                                .call(enter => enter.transition(t)
                                    .attr('d', (d) => {
                                        return d3.area()
                                            .x(d => this.brushXScale(d[this.x]))
                                            .y0(this.chartHeight)
                                            .y1(d => this.brushYScale(d[this.y]))
                                            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
                                    })
                                    .attr("class", "uxp-brush-area")
                                    .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); }))
                                    .style('opacity', 0.7);
                            return path;
                        }
                    },
                    update => update
                        .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); })
                        .call(update => update.transition(t)),
                    exit => {
                        console.log('exited');
                        return exit.remove();
                    }
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

            this.brushLineGroup = this.svgGroup.append("g")
                .attr("class", "uxp-brush")
                .attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")")
                .call(brushFn)
                .call(brushFn.move, [this.brushScale((this.chartWidth * this.settings.brush.offset / 100).toFixed(0)), this.brushScale((this.chartWidth * this.settings.brush.limit / 100).toFixed(0))]);
        }

        //create brush function redraw area with selection
        brushed(event) {
            if (event.type == "start") {
                if (event.sourceEvent) {
                    var rectClass = event.sourceEvent.srcElement.className.baseVal;
                    if (rectClass.includes('selection') || rectClass.includes('handle')) {
                        return null;
                    }
                    this.xScale.range([0, this.chartWidth]);
                    this.drawGridLines();
                    this.drawArea();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawGridLines();
                this.drawArea();
                this.updateXAxis();
                this.updateYAxis();
                this.drawAxisLabels();

            }
        }


        initialArea() {
            let initialarea = d3.area()
                                .x(d => this.xScale(d[this.x]))
                                .y0(this.chartHeight)
                                .y1(this.chartHeight);
            return initialarea;
        }

        calculatedArea(d, boolean) {
            const { animation } = this.settings;
            let area =d3.area()
            .x(d => boolean ? this.xScale(d[this.x]) : 0)
            .y0(this.chartHeight)
            .y1(d => this.yScale(d[this.y]))
            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
            return area;
        }

        calculatedBrushArea(d, boolean) {
            const { animation } = this.settings;
            let area =d3.area()
            .x(d => boolean ? this.brushXScale(d[this.x]) : 0)
            .y0(this.settings.brush.height)
            .y1(d => this.brushYScale(d[this.y]))
            .curve(animation.enableCurve ? d3.curveMonotoneX : d3.curveLinear)(d.value);
            return area;
        }

        prepareChartData(data) {
            let nestedData = [];
            //const defaultColor = assistant.getDefaultColor();
            d3.group(data, d => d[this.area]).forEach((d, i) => {
                nestedData.push({
                    key: d[0][this.area],
                    color: d[0].color ? d[0].color : assistant.getDefaultColor(i),
                    value: d
                });
            });
            return nestedData;
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
            return this.settings.legend.textKey ? this.settings.legend.textKey : d[this.area];
            //return this.settings.xAxis.tickFormat(d[textKey]);
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
            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "legend", this.legend);
        }

        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            const dataSet = this.prepareTooltipData(d, elem, event);
            this.prepareTooltipArea(dataSet);
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), dataSet, this.settings.tooltip, event]);
            assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
        }

        createTooltipArea() {
            this.tooltipArea = this.svgGroup.append("line")
            .attr("class", "uxp-tooltip-area")
            .attr('stroke', 'gray')
            .style("opacity", 0.6)
            .style("stroke-dasharray", ("3, 3"));
        }


        prepareTooltipArea(d) {
            this.tooltipArea
                .style("display", "inline-block")
                .attr('y1', 0)
                .attr('y2', this.chartHeight);
            this.tooltipArea.attr('x1', this.xScale(d[0][this.x]))
            .attr('x2', this.xScale(d[0][this.x]));
        }


        hideTooltip() {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            d3.select(".uxp-tooltip").style("display", "none");
            if (this.tooltipArea)
                this.tooltipArea.style("display", "none");
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
            // let tem = [{"key":"area-2","date":"2017-04-22T18:30:00.000Z","count":10.78,"index":0},{"key":"area-2","date":"2017-04-23T18:30:00.000Z","count":56.54,"index":0},{"key":"area-2","date":"2017-04-24T18:30:00.000Z","count":23.85},{"key":"area-2","date":"2017-04-25T18:30:00.000Z","count":80}];
            let newArr = [];
            this.data.forEach((element, index) => {
                newArr.push({
                    key:element.key,
                    date:element.date,
                    index:index,
                    count:element.count
                });
            });
            self.prepareChartData(newArr).forEach((element) => {
                var value = element.value.find(val => val[self.x].toString() == returnValue[self.x].toString());
                if (value) {
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

        createToolTipBox() {
            this.svgGroup.selectAll(".uxp-tooltip-area-overlay").remove();
            const tooltipBox = this.svgGroup.append('rect')
                .attr("class", "uxp-tooltip-area-overlay")
                .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)")
                .attr('width', this.chartWidth)
                .attr('height', this.chartHeight)
                .attr('opacity', 0);

            // Reveal element to outer world for customizations
            this.observer.exposeElement(this.elements, "area", tooltipBox);
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
            this.checkDuplicateData();
            this.setNegativeValueFlag();
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.drawArea();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.drawBrushArea();
                this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                this.createTooltipArea();
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            assistant.emitEvent("completeDraw", this);
            this.isChartPlotted = true;
        }

        update() {
            assistant.emitEvent("beforeUpdate", this);
            assistant.hideTooltipWrapper();
            this.tooltipArea = undefined;
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
            this.checkDuplicateData();
            this.setNegativeValueFlag();
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.createToolTipBox();
            this.drawArea();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
                this.drawBrushArea();
                this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                this.createTooltipArea();
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
            this.tooltipArea = undefined;
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
            this.drawArea();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
                this.drawBrushArea();
                this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                this.createTooltipArea();
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class AreaChart {
        constructor() {
            this[areaChartFactory] = new AreaChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[areaChartFactory].containerElement;
            }
            this[areaChartFactory].containerElementIdentifier = args[0];
            this[areaChartFactory].createContainerObject(this[areaChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[areaChartFactory].x;
            }
            this[areaChartFactory].x = args[0];
            return this;
        }

        area(...args) {
            if (!args || !args.length) {
                return this[areaChartFactory].area;
            }
            this[areaChartFactory].area = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[areaChartFactory].y;
            }
            this[areaChartFactory].y = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[areaChartFactory].width,
                height: this[areaChartFactory].height,
                chartWidth: this[areaChartFactory].chartWidth,
                chartHeight: this[areaChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[areaChartFactory].data;
            }
            this[areaChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[areaChartFactory].settings);
            }
            this[areaChartFactory].settings = utility.unifyObject([this[areaChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[areaChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[areaChartFactory].elements;
        }

        on(eventId, handler) {
            this[areaChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[areaChartFactory].draw();
            let result = utility.handleException(this[areaChartFactory], this[areaChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[areaChartFactory].displayMessageOnScreen(this[areaChartFactory].settings.exceptionMessage);
                this[areaChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[areaChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[areaChartFactory], this[areaChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[areaChartFactory].displayMessageOnScreen(this[areaChartFactory].settings.exceptionMessage);
                this[areaChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[areaChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[areaChartFactory], this[areaChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[areaChartFactory].displayMessageOnScreen(this[areaChartFactory].settings.exceptionMessage);
                this[areaChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[areaChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return AreaChart;
}));