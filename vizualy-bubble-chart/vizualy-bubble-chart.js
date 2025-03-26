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
            global.vizualy.BubbleChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const bubbleChartFactory = Symbol();
    class BubbleChartFactory extends Observer {

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
            this.labelName;
            this.data;
            this.isChartPlotted = false;
            this.width,
                this.height,
                this.svg;
            this.svgGroup;
            this.xScale;
            this.yScale;
            this.brushScale;
            this.clipPath;
            this.brushXScale;
            this.brushYScale;
            this.bubbleGroup;
            this.brushBubbleGroup;
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
                bubbleLabel: {
                    isVisible: true,
                    labelFormat: (d) => d
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        let tooltipCotent = '<table style="width:200px;text-transform: capitalize">';
                        Object.keys(d).forEach((key, i) => {
                            if (key == 'labelName') {
                                tooltipCotent += '<tr><td colspan="2" style="border-bottom:1px solid #b6b6b6;padding:2px 4px;"><b>' +
                                    d[this.labelName] + '</b></td></tr>';
                            } else {
                                tooltipCotent += '<tr><td style="padding:2px 4px;"><span style="display:inline-block;width:8px;height:8px;margin-right:5px;background-color:' +
                                    (this.colors ? this.colors[i - 1] : assistant.getDefaultColor(i - 1)) + ';"></span>' + key + '</td><td style="text-align:right;padding:2px 4px"><b>'
                                    + d[key]
                                    + '</b></td></tr>';
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
                xWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                bubbleSpace: { type: 'perc', value: 0.1 },
                brush: {
                    isVisible: false,
                    limit: 30,
                    offset: 0,
                    height: 80,
                    margin: 80
                },
                legend: {
                    isVisible: false,
                    placement: 'right',
                    margin: { top: 10, right: 10, bottom: 10, left: 10 },
                    rectWidth: 10,
                    rectHeight: 10,
                    textKey: null,
                    textFormat: (d) => d,
                },
                xScaleType: {
                    type: "linear"
                },
                yScaleType: {
                    type: 'linear'
                },
                xAxisTicksCount: { value: 3, isApplied: false },
                yAxisTicksCount: { value: 3, isApplied: false },
                rotateXAxisTick: false,
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

        createScales() {
            let yScaleRange = [this.chartHeight, 0],
                xScaleRange = [0, this.chartWidth];

            let xScaleMinValue = d3.min(this.data, (d) => d[this.x]);
            let xScaleMaxValue = d3.max(this.data, (d) => d[this.x]);

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

            let xAxisDomain = [xScaleMinValue, xScaleMaxValue];
            let yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [0, yScaleMaxValue];
            this.xScale = d3.scaleLinear().domain(xAxisDomain).range(xScaleRange);
            const yScale = d3.scaleLinear().domain(yAxisDomain).range(yScaleRange);

            const xScaleTicks = yScale.ticks();
            if (xScaleMaxValue > xScaleTicks[xScaleTicks.length - 1]) {
                xScaleMaxValue = xScaleTicks[xScaleTicks.length - 1] + xScaleTicks[xScaleTicks.length - 1] - xScaleTicks[xScaleTicks.length - 2];
                if (this.isDataValueNegative) {
                    xScaleMinValue = Math.abs(xScaleMaxValue) * (-1);
                }
                xAxisDomain = (this.isDataValueNegative) ? [xScaleMinValue, xScaleMaxValue] : [assistant.getAxisFirstTick(this.settings.xScaleType), xScaleMaxValue];
                this.xScale.domain(xAxisDomain);
            }

            const yScaleTicks = yScale.ticks();
            if (yScaleMaxValue > yScaleTicks[yScaleTicks.length - 1]) {
                yScaleMaxValue = yScaleTicks[yScaleTicks.length - 1] + yScaleTicks[yScaleTicks.length - 1] - yScaleTicks[yScaleTicks.length - 2];
                if (this.isDataValueNegative) {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }
                yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [assistant.getAxisFirstTick(this.settings.yScaleType), yScaleMaxValue];
                yScale.domain(yAxisDomain);
            }

            this.yScale = yScale;
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

            this.updateGround();


            if (!this.isChartPlotted) {
                // Exposing svg element named as "svg"
                this.observer.exposeElement(this.elements, "svg", this.svg);
            }
        }

        updateGround() {
            assistant.updateSVG.apply(this);
            if (this.clipPath) {
                this.svg.selectAll("defs").remove();
            }
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
                const xAxisFunction = d3.axisBottom(this.xScale)
                    .ticks(this.settings.xAxisTicksCount.value)
                    .tickFormat(this.settings.xAxis.tickFormat);
                this.svgGroup.select(".uxp-x-axis")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
                const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-x-axis")]);

                this.svgGroup
                    .select(".uxp-x-axis")
                    .attr("transform", "translate(0," + this.chartHeight + ")")
                    .transition(t)
                    .call(xAxisFunction);


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
        drawBubbles() {
            if (this.svgGroup.select('.uxp-bubble-group').empty()) {
                this.bubbleGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-bubble-group")
                    .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.bubbleGroup]);
            this.bubbleGroup
                .selectAll(".uxp-bubble")
                .data(this.data)
                .join(
                    enter => enter.append("circle")
                        .attr("class", "uxp-bubble")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .attr("cx", d => this.xScale(d[this.x]))
                        .attr("cy", d => this.yScale(d[this.y]))
                        .attr("r", d => d[this.r])
                        .style("opacity", "0")
                        .attr("stroke", "black")
                        .call(enter => enter.transition(t))
                        .style("opacity", "0.7"),
                    update => update
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .style("opacity", "0")
                        .call(update => update.transition(t))
                        .attr("cx", d => this.xScale(d[this.x]))
                        .attr("cy", d => this.yScale(d[this.y]))
                        .attr("r", d => d[this.r])
                        .style("opacity", "0.7"),
                    exit => exit.remove()
                );

            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "bubble", this.bubbleGroup.selectAll("circle"));

            if (!this.isChartPlotted) {
                //Adding default action to element "bubble"
                const elementInfomationObj = this.chartObject.getElement("bubble");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }
        drawBrushBubbles() {
            this.svgGroup.select('.uxp-bubble-brush-group').remove();
            if (this.svgGroup.select('.uxp-bubble-brush-group').empty()) {
                this.bubbleBrushGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-bubble-brush-group");
            }
            this.bubbleBrushGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");
            const t = assistant.getTransitionFunction.apply(this, [this.bubbleBrushGroup]);
            let k = this.settings.brush.height / this.chartHeight;
            this.bubbleBrushGroup
                .selectAll(".uxp-bubble")
                .data(this.data)
                .join(
                    enter => enter.append("circle")
                        .attr("class", "uxp-bubble")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .attr("cx", d => this.xScale(d[this.x]))
                        .attr("cy", d => {
                            console.log(d);
                            return this.brushYScale(d[this.y])
                        })
                        .attr("r", d => d[this.r] * k)
                        .style("opacity", "0")
                        .attr("stroke", "black")
                        .call(enter => enter.transition(t))
                        .style("opacity", "0.7"),
                    update => update
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .style("opacity", "0")
                        .call(update => update.transition(t))
                        .attr("cx", d => this.xScale(d[this.x]))
                        .attr("cy", d => this.brushYScale(d[this.y]))
                        .attr("r", d => d[this.r] * k)
                        .style("opacity", "0.7"),
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

            this.brushBubbleGroup = this.svgGroup.append("g")
                .attr("class", "uxp-brush")
                .attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")")
                .call(brushFn)
                .call(brushFn.move, [this.brushScale((this.chartWidth * this.settings.brush.offset / 100).toFixed(0)), this.brushScale((this.chartWidth * this.settings.brush.limit / 100).toFixed(0))]);
        }

        //create brush function redraw bubbles with selection
        brushed(event) {
            if (event.type == "start") {
                if (event.sourceEvent) {
                    var rectClass = event.sourceEvent.srcElement.className.baseVal;
                    if (rectClass.includes('selection') || rectClass.includes('handle')) {
                        return null;
                    }
                    this.xScale.range([0, this.chartWidth]);
                    this.drawBubbles();
                    this.drawGridLines();
                    this.drawBubbleLabel();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawBubbles();
                this.drawGridLines();
                this.drawBubbleLabel();
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
        drawBubbleLabel() {
            if (!this.settings.bubbleLabel.isVisible) {
                if (!this.bubbleGroup.selectAll(".uxp-bubble-label").empty())
                    this.bubbleGroup.selectAll(".uxp-bubble-label").remove();
                return;
            }
            const self = this;
            const t = assistant.getTransitionFunction.apply(this, [this.bubbleGroup]);
            this.bubbleGroup
                .selectAll(".uxp-bubble-label")
                .data(this.data)
                .join(
                    enter => enter.append("text")
                        .attr("class", "uxp-bubble-label")
                        .style("text-anchor", "middle")
                        .style("fill", "#000")
                        .attr("dy", (d) => {
                            return "0.25em";
                        })
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]);
                        })
                        .call(enter => enter.transition(t)
                            .attr("y", (d) => {
                                if (d[this.y] < 0) {
                                    return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) +
                                        Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d[this.y]));
                                } else {
                                    return this.yScale(d[this.y]); //For Positive value
                                }
                            })
                            .text((d) => {
                                if (this.settings.bubbleLabel.labelFormat) {
                                    return this.settings.bubbleLabel.labelFormat(d[this.labelName]);
                                } else {
                                    return d[this.labelName];
                                }
                            })
                        ),
                    update => update
                        .call(update => update.transition(t)
                            .attr("x", (d) => {
                                return this.xScale(d[this.x]);
                            })
                            .attr("y", (d) => {
                                if (d[this.y] < 0) {
                                    return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) +
                                        Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d[this.y]));
                                } else {
                                    return this.yScale(d[this.y]); //For Positive value
                                }
                            })
                            .text((d) => {
                                if (this.settings.bubbleLabel.labelFormat) {
                                    return this.settings.bubbleLabel.labelFormat(d[this.labelName]);
                                } else {
                                    return d[this.labelName];
                                }
                            })
                        ),
                    exit => exit.remove()
                );

        }
        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : this.chartObject.x();
            return this.settings.xAxis.tickFormat(d[textKey]);
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
            if (!assistant.isValidbarSpaceValue.apply(this, [this.settings.bubbleSpace])) {
                return this;
            }
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.drawBubbles();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.drawBrushBubbles();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawBubbleLabel();
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
            this.setChartDimension();
            this.updateGround();
            this.setNegativeValueFlag();
            if (!assistant.isValidbarSpaceValue.apply(this, [this.settings.bubbleSpace])) {
                return this;
            }
            if (!assistant.isValidScaleType.apply(this, [this.settings.yScaleType.type, this.isDataValueNegative])) {
                return this;
            }
            this.svgGroup.select('.uxp-bubble-group').remove();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.drawBubbles();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.drawBrushBubbles();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawBubbleLabel();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if (this.resizeHappening) {
                return;
            }
            this.svgGroup.select('.uxp-bubble-group').remove();
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
            this.drawBubbles();
            if (this.settings.brush.isVisible) {
                this.createBrushScales();
                this.drawBrushBubbles();
                this.defineBrush();
            }
            this.drawAxisLabels();
            this.drawBubbleLabel();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }


    }

    //--------------------------Chart class exposed to outer world----START-------------------------//
    class BubbleChart {
        constructor() {
            this[bubbleChartFactory] = new BubbleChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].containerElement;
            }
            this[bubbleChartFactory].containerElementIdentifier = args[0];
            this[bubbleChartFactory].createContainerObject(this[bubbleChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].x;
            }
            this[bubbleChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].y;
            }
            this[bubbleChartFactory].y = args[0];
            return this;
        }

        r(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].r;
            }
            this[bubbleChartFactory].r = args[0];
            return this;
        }
        labelName(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].labelName;
            }
            this[bubbleChartFactory].labelName = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[bubbleChartFactory].width,
                height: this[bubbleChartFactory].height,
                chartWidth: this[bubbleChartFactory].chartWidth,
                chartHeight: this[bubbleChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[bubbleChartFactory].data;
            }
            this[bubbleChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[bubbleChartFactory].settings);
            }
            this[bubbleChartFactory].settings = utility.unifyObject([this[bubbleChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[bubbleChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[bubbleChartFactory].elements;
        }

        on(eventId, handler) {
            this[bubbleChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            this[bubbleChartFactory].draw();
            let result = utility.handleException(this[bubbleChartFactory], this[bubbleChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[bubbleChartFactory].displayMessageOnScreen(this[bubbleChartFactory].settings.exceptionMessage);
                this[bubbleChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[bubbleChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[bubbleChartFactory], this[bubbleChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[bubbleChartFactory].displayMessageOnScreen(this[bubbleChartFactory].settings.exceptionMessage);
                this[bubbleChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[bubbleChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[bubbleChartFactory], this[bubbleChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[bubbleChartFactory].displayMessageOnScreen(this[bubbleChartFactory].settings.exceptionMessage);
                this[bubbleChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[bubbleChartFactory]);
            }
        }

    }



    //--------------------------Chart class exposed to outer world----END------------------------//
    return BubbleChart;
}));