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
            global.vizualy.BarChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const barChartFactory = Symbol();
    class BarChartFactory extends Observer {

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
            this.barGroup;
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
                barLabel: {
                    isVisible: true,
                    labelFormat: (d) => d
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        return this.x + ": <b>" + d[this.x] + "</b><br>" +
                                this.y + ": <b>" + d[this.y] + "</b>";
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
                barSpace : {type: 'perc', value: 0.1 },
                barBuffer: { x: 0, y: 10},
                brush: {
                    isVisible: false,
                    limit: 30,
                    offset: 0,
                    height: 80,
                    margin: 60
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
            const xAxisDomain = this.data.map((d) => d[this.x])

            let yScaleMinValue = d3.min(this.data, (d) => d[this.y]),
                yScaleMaxValue = d3.max(this.data, (d) => d[this.y])+ this.settings.barBuffer.y ;

            if (this.isDataValueNegative) {
                //If minimum value is Negative - then compare mod(min -ve value) with max +ve value
                // whichever is greater, set that as min & max for scale
                if (Math.abs(yScaleMinValue) >= Math.abs(yScaleMaxValue)) {
                    yScaleMaxValue = Math.abs(yScaleMinValue);
                } else {
                    yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
                }
            }
            let yMaxTempValue = Math.abs(yScaleMaxValue);
            let yMinTempValue = Math.abs(yScaleMinValue);

            let bufferPercent = (yMaxTempValue > yMinTempValue) ? (this.settings.barBuffer.y * yMaxTempValue) / 100 : (this.settings.barBuffer.y * yMinTempValue) / 100;

            yMaxTempValue += bufferPercent;
            yMinTempValue += bufferPercent;

            yScaleMaxValue = (yScaleMaxValue < 0) ? (-1) * yMaxTempValue : yMaxTempValue;
            yScaleMinValue = (yScaleMinValue < 0) ? (-1) * yMinTempValue : yScaleMinValue;

            let yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [0, yScaleMaxValue];

            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, [0, this.chartWidth + this.chartWidth * this.settings.barBuffer.x / 100], xAxisDomain]);
            const yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, [this.chartHeight, 0], yAxisDomain]);

			const yScaleTicks = yScale.ticks();
			if (yScaleMaxValue > yScaleTicks[yScaleTicks.length - 1]) {
				yScaleMaxValue =  yScaleTicks[yScaleTicks.length - 1] + yScaleTicks[yScaleTicks.length - 1] - yScaleTicks[yScaleTicks.length - 2];
				if (this.isDataValueNegative) {
					yScaleMinValue = Math.abs(yScaleMaxValue) * (-1);
				}
			yAxisDomain = (this.isDataValueNegative) ? [yScaleMinValue, yScaleMaxValue] : [assistant.getAxisFirstTick(this.settings.yScaleType), yScaleMaxValue];
			yScale.domain(yAxisDomain);
			}

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
                else if (this.settings.rotateXAxisTick && Array.isArray(this.settings.rotateXAxisTick) && this.settings.rotateXAxisTick.length) {
                    this.svgGroup.select(".uxp-x-axis").selectAll('.tick').selectAll("text")
                        .attr("y", this.settings.rotateXAxisTick[1])
                        .attr("x", this.settings.rotateXAxisTick[0])
                        .attr("transform", "rotate(" + this.settings.rotateXAxisTick[2] + ")")
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
            if (this.svgGroup.select('.uxp-bar-group').empty()) {
                this.barGroup = this.svgGroup
                            .append("g")
                            .attr("class", "uxp-bar-group")
                            .attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);
            this.barGroup
                .selectAll(".uxp-bar")
                .data(this.data)
                .join(
                    enter => enter.append("rect")
                        .attr("class", "uxp-bar")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]);
                        })
                        .attr("width", () => {
                            return this.settings.barSpace.type === 'perc' ? this.xScale.bandwidth() - this.xScale.bandwidth() * this.settings.barSpace.value : this.xScale.bandwidth();
                        })
                        .attr("y", () => {
                                return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                        })
                        .attr("height", () => {
                            return (0);
                        })
                        .call(enter => enter.transition(t)
                        .attr("y", (d) => {
                            if (d[this.y] < 0) {
                                return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                            } else {
                                return this.yScale(d[this.y]); //For Positive value
                            }
                        })
                        .attr("height", (d) => {
                            //return (this.yScale(0) - this.yScale(d[this.y]));
                            return Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d[this.y]));
                        }))
                        .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }),
                    update => update
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .call(update => update.transition(t)
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]);
                        })
                        .attr("width", () => {
                            return this.settings.barSpace.type === 'perc' ? this.xScale.bandwidth() - this.xScale.bandwidth() * this.settings.barSpace.value : this.xScale.bandwidth();
                        })
                        .attr("y", (d) => {
                            if (d[this.y] < 0) {
                                return this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                            } else {
                                return this.yScale(d[this.y]); //For Positive value
                            }
                        })
                        .attr("height", (d) => {
                            //return (this.yScale(0) - this.yScale(d[this.y]));
                            return Math.abs(this.yScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.yScale(d[this.y]));
                        }))
                        .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }),
                    exit => exit.remove()
                );


            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "bar", this.barGroup.selectAll(".uxp-bar"));

            if (!this.isChartPlotted) {
                //Adding default action to element "bar"
                const elementInfomationObj = this.chartObject.getElement("bar");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        drawBrushBars(){
            this.svgGroup.select('.uxp-bar-brush-group').remove();
            if (this.svgGroup.select('.uxp-bar-brush-group').empty()) {
                this.barBrushGroup = this.svgGroup
                            .append("g")
                            .attr("class", "uxp-bar-brush-group");
            }
            this.barBrushGroup.attr("transform", "translate(0," + (this.chartHeight + this.settings.brush.margin) + ")");
            const t = assistant.getTransitionFunction.apply(this, [this.barBrushGroup]);
            this.barBrushGroup
                .selectAll(".uxp-brush-bar")
                .data(this.data)
                .join(
                    enter => enter.append("rect")
                        .attr("class", "uxp-brush-bar")
                        .style("fill", (d, i) => {
                            return (d.color) ? d.color : assistant.getDefaultColor(i);
                        })
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]);
                        })
                        .attr("width", () => {
                            return this.settings.barSpace.type === 'perc' ? this.xScale.bandwidth() - this.xScale.bandwidth() * this.settings.barSpace.value : this.xScale.bandwidth();
                        })
                        .attr("y", () => {
                                return this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                        })
                        .attr("height", () => {
                            return (0);
                        })
                        .call(enter => enter.transition(t)
                        .attr("y", (d) => {
                            if (d[this.y] < 0) {
                                return this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)); //For Negative value
                            } else {
                                return this.brushYScale(d[this.y]); //For Positive value
                            }
                        })
                        .attr("height", (d) => {
                            //return (this.yScale(0) - this.yScale(d[this.y]));
                            return Math.abs(this.brushYScale(assistant.getAxisFirstTick(this.settings.yScaleType)) - this.brushYScale(d[this.y]));
                        }))
                        .attr("transform", () => { return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.xScale.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : ''; }),
                        exit => exit.remove()
                );
        }

        removeBrush() {
            this.svgGroup.select('.uxp-brush').remove();
            this.svgGroup.select('.uxp-bar-brush-group').remove();
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
            if(!this.settings.barLabel.isVisible) {
                if (!this.barGroup.selectAll(".uxp-bar-label").empty())
                    this.barGroup.selectAll(".uxp-bar-label").remove();
                return;
            }
            const self = this;

            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);

            this.barGroup
                .selectAll(".uxp-bar-label")
                .data(this.data)
                .join(
                    enter => enter.append("text")
                        .attr("class", "uxp-bar-label")
                        .style("text-anchor", "middle")
                        .style("fill",  "#000")
                        .attr("dy", (d) => {
							if (d[this.y] < 0) {
								return "0.8em";
							}
							return "-0.1em";
						})
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]) + (this.xScale.bandwidth() / 2);
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
                            if(this.settings.barLabel.labelFormat) {
                                return this.settings.barLabel.labelFormat(d[this.y]);
                            } else {
                                return d[this.y];
                            }
                        })
                        .style("opacity", function() {
                            const box = this.getBBox();
                            if (box.width <= self.xScale.bandwidth()) {
                                return 1; // adjustable, display the text
                            } else {
                                return 0; // not adjustable, make transparent
                            }
                        })),
                    update => update
                        .call(update => update.transition(t)
                        .attr("x", (d) => {
                            return this.xScale(d[this.x]) + (this.xScale.bandwidth() / 2);
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
                            if(this.settings.barLabel.labelFormat) {
                                return this.settings.barLabel.labelFormat(d[this.y]);
                            } else {
                                return d[this.y];
                            }
                        })
                        .style("opacity", function() {
                            const box = this.getBBox();
                            if (box.width <= self.xScale.bandwidth()) {
                                return 1; // adjustable, display the text
                            } else {
                                return 0; // not adjustable, make transparent
                            }
                        })),
                    exit => exit.remove()
                );

        }




        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : this.chartObject.x();
            return this.settings.xAxis.tickFormat(d[textKey]);
        }

        drawLegend() {
            if(!this.settings.legend.isVisible) {
                if (this.legendContainerElement && !this.legendContainerElement.empty()) {
                    this.legendContainerElement.remove();
                }
                return;
            } else {
                if (!this.legendContainerElement || !this.isChartPlotted) {
                    this.legendContainerElement = assistant.drawLegendContainer.apply(this.chartObject);
                }
            }
            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.data, this.callbackToGetDisplayText.bind(this)]);
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

        hideTooltip() {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            d3.select(".uxp-tooltip").style("display", "none");
        }

        displayMessageOnScreen(message) {
            if(!message) {
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
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushBars();
				this.defineBrush();
			}
            this.drawAxisLabels();
            this.drawBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            // assistant.emitEvent("completeDraw", this);
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
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushBars();
				this.defineBrush();
			}
            else{
                this.removeBrush();
            }
            this.drawAxisLabels();
            this.drawBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if(this.resizeHappening)
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
            this.drawBars();
            if (this.settings.brush.isVisible) {
				this.createBrushScales();
				this.drawBrushBars();
				this.defineBrush();
			}
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
    class BarChart {
        constructor() {
           this[barChartFactory] = new BarChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[barChartFactory].containerElement;
            }
            this[barChartFactory].containerElementIdentifier = args[0];
            this[barChartFactory].createContainerObject(this[barChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[barChartFactory].x;
            }
            this[barChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[barChartFactory].y;
            }
            this[barChartFactory].y = args[0];
            return this;
        }

        activeDimension() {
            return {width: this[barChartFactory].width,
                    height: this[barChartFactory].height,
                    chartWidth: this[barChartFactory].chartWidth,
                    chartHeight: this[barChartFactory].chartHeight};
        }

        data(...args) {
            if (!args || !args.length) {
                return this[barChartFactory].data;
            }
            this[barChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[barChartFactory].settings);
            }
            this[barChartFactory].settings = utility.unifyObject([this[barChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[barChartFactory].elements[elementIdentifier];
        }

        getElementList(){
            return this[barChartFactory].elements;
        }

        on(eventId, handler) {
            this[barChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            this[barChartFactory].draw();
            // let result = utility.handleException(this[barChartFactory], this[barChartFactory].draw);
            // if (result && result.isExceptionOccurred) {
            //     this[barChartFactory].displayMessageOnScreen(this[barChartFactory].settings.exceptionMessage);
            //     this[barChartFactory].isChartPlotted = false;
            //      assistant.emitEvent("error", this[barChartFactory]);
            // }
            // return this;
        }

        update() {
            let result = utility.handleException(this[barChartFactory], this[barChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[barChartFactory].displayMessageOnScreen(this[barChartFactory].settings.exceptionMessage);
                this[barChartFactory].isChartPlotted = false;
                 assistant.emitEvent("error", this[barChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[barChartFactory], this[barChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[barChartFactory].displayMessageOnScreen(this[barChartFactory].settings.exceptionMessage);
                this[barChartFactory].isChartPlotted = false;
                 assistant.emitEvent("error", this[barChartFactory]);
            }
        }

    }



    //--------------------------Chart class exposed to outer world----END------------------------//
    return BarChart;
}));