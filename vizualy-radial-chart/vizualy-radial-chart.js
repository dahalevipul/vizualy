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
            global.vizualy.RadialChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const radialChartFactory = Symbol();
    class RadialChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();

            this.containerElementIdentifier;
            this.containerElement;
            this.legendContainerElement;
            this.data;
            this.chartRadius;
            this.isChartPlotted = false;
            this.width,
                this.height,
                this.svg;
            this.svgGroup;
            this.radialGroup;
            this.radialScale;
            this.PI = Math.PI;
            this.arc;
            this.mainArc;
            this.numArcs;
            this.arcWidth;
            this.arcPadding = 10;
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
                radialScaleType: {
                    type: "linear"
                },
                arcAngle: {
                    baseRadial: {
                        startAngle: 0,
                        endAngle: 2
                    }
                },
                targetValue: 100,
                label: {
                    isVisible: true,
                    xTranslateLabel: 0,
                    yTranslateLabel: -20,
                    xTranslateValueLabel: 0,
                    yTranslateValueLabel: 10,
                    dataKey: null,
                    isTargetValueVisible: false,
                    textLabelFormat: (d) => d,
                    textValueFormat: (d) => d
                },
                arcMinRadius: 200,
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        return this.value + ": <b>" + d[this.value] + "</b><br>" +
                            this.label + ": <b>" + d[this.label] + "</b>";
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
            this.containerElement = d3.select("#" + clipedContainerElementIdentifier);
        }

        setChartDimension() {
            [this.width, this.height, this.chartWidth, this.chartHeight] = assistant.setDimension.apply(this.chartObject);
        }

        createRadialScale() {
            let radialScaleRange,
                radialAxisDomain;

            radialScaleRange = [this.settings.arcAngle.baseRadial.startAngle, this.settings.arcAngle.baseRadial.endAngle * Math.PI];
            // radialAxisDomain = [0, d3.sum(this.data, d => d[this.value])];
            radialAxisDomain = [0, this.settings.targetValue];

            this.radialScale = assistant.setScale.apply(this.chartObject, [this.settings.radialScaleType, radialScaleRange, radialAxisDomain]);
        }

        prepareData() {
            this.data.forEach((ele, i) => {
                ele.baseRadialColor = ele.baseRadialcolor ? ele.baseRadialcolor : '#f5f5f5';
                ele.mainRadialColor = ele.mainRadialColor ? ele.mainRadialColor : assistant.getDefaultColor(i);
            });
        }

        calculateArc() {
            this.arc = d3.arc()
                .innerRadius((d, i) => this.getInnerRadius(i))
                .outerRadius((d, i) => this.getOuterRadius(i))
                .startAngle(this.settings.arcAngle.baseRadial.startAngle * Math.PI)
                .endAngle((d) => this.radialScale(d));
        }

        calculateMainArc() {
            this.mainArc = d3.arc()
                .innerRadius((d, i) => this.getInnerRadius(i))
                .outerRadius((d, i) => this.getOuterRadius(i))
                .startAngle(this.settings.arcAngle.baseRadial.startAngle * Math.PI)
                .endAngle(this.settings.arcAngle.baseRadial.endAngle * Math.PI);
        }

        arcTween(d, i) {
            let interpolate = d3.interpolate(0, d[this.value]);
            return t => this.arc(interpolate(t), i);
        }
        mainArcTween(d, i) {
            let interpolate = d3.interpolate(0, d[this.value]);
            return t => this.mainArc(interpolate(t), i);
        }

        getArcNumbers() {
            let keys = this.data.map((d) => d[this.label]);
            this.numArcs = keys.length;
        }

        calculateArcWidth() {
            this.arcWidth = (this.chartRadius - this.settings.arcMinRadius - this.numArcs * this.arcPadding) / this.numArcs;
        }

        getInnerRadius(index) {
            return (index) * (this.arcWidth + this.arcPadding) + this.settings.arcMinRadius;
        }

        getOuterRadius(index) {
            return this.getInnerRadius(index) + this.arcWidth;
        }

        getChartRadius() {
            this.chartRadius = (Math.min(this.chartWidth, this.chartHeight) / 2);
        }

        drawRadialBar() {
            if (this.svgGroup.select('.uxp-radial-group').empty()) {
                this.radialGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-radial-group");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.radialGroup]);

            this.getChartRadius();
            this.getArcNumbers();
            this.calculateArcWidth();
            this.calculateMainArc();
            this.calculateArc();


            this.radialGroup
                .selectAll(".uxp-base-radial-arc")
                .data(this.data)
                .join(
                    enter => enter.append("path")
                        .attr("class", "uxp-base-radial-arc")
                        .style("opacity", 0.5)
                        .attr("fill", (d) => {
                            return d.baseRadialColor;
                        })
                        .call(enter => enter.transition(t)
                            .attrTween("d", (a, i) => this.mainArcTween(a, i))),
                    update => update
                        .attr("fill", (d) => {
                            return d.baseRadialColor;
                        })
                        .call(update => update.transition(t)
                            .attrTween("d", (a, i) => this.mainArcTween(a, i))),
                    exit => exit.remove()
                );

            this.radialGroup
                .selectAll(".uxp-main-radial-arc")
                .data(this.data)
                .join(
                    enter => enter.append("path")
                        .attr("class", "uxp-main-radial-arc")
                        .style("opacity", 1)
                        .attr("fill", (d) => {
                            return d.mainRadialColor;
                        })
                        .call(enter => enter.transition(t)
                            .attrTween("d", (a, i) => this.arcTween(a, i))),
                    update => update
                        .attr("fill", (d) => {
                            return d.mainRadialColor;
                        })
                        .call(update => update.transition(t)
                            .attrTween("d", (a, i) => this.arcTween(a, i))),
                    exit => exit.remove()
                );

            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "radial-bar", this.radialGroup.selectAll(".uxp-main-radial-arc"));

            if (!this.isChartPlotted) {
                //Adding default action to element "radial-bar"
                const elementInfomationObj = this.chartObject.getElement("radial-bar");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
            }
        }

        checkForLabelVisibility() {
            if (this.data && this.data.length > 1) {
                return false;
            } else {
                return true;
            }
        }
        drawRadialBarLabel() {
            if (this.settings.label.isVisible) {
                this.radialGroup
                    .selectAll(".uxp-arc-value-label")
                    .data([this.data[0]])
                    .join(
                        enter => enter.append("text")
                            .attr("class", "uxp-arc-value-label")
                            .style("opacity", 1)
                            .attr("text-anchor", "middle")
                            .attr('transform', `translate(${this.settings.label.xTranslateValueLabel},${this.settings.label.yTranslateValueLabel})`)
                            .text((d) => {
                                const labelState = this.checkForLabelVisibility();
                                if (labelState) {
                                    if (this.settings.label.isTargetValueVisible) {
                                        return this.settings.label.textValueFormat(d[this.value]) + ` / ${this.settings.targetValue}`;
                                    } else {
                                        return this.settings.label.textValueFormat(d[this.value]);
                                    }
                                } else {
                                    const total = d3.sum(this.data, d => d[this.value]);
                                    const targetValueCal = this.data.length * this.settings.targetValue;
                                    if (this.settings.label.isTargetValueVisible) {
                                        return this.settings.label.textValueFormat(total) + ` / ${targetValueCal}`;
                                    } else {
                                        return this.settings.label.textValueFormat(total);
                                    }
                                }
                            }),
                        update => update
                            .attr('transform', `translate(${this.settings.label.xTranslateValueLabel},${this.settings.label.yTranslateValueLabel})`)
                            .attr("text-anchor", "middle")
                            .text((d) => {
                                const labelState = this.checkForLabelVisibility();
                                if (labelState) {
                                    if (this.settings.label.isTargetValueVisible) {
                                        return this.settings.label.textValueFormat(d[this.value]) + ` / ${this.settings.targetValue}`;
                                    } else {
                                        return this.settings.label.textValueFormat(d[this.value]);
                                    }
                                } else {
                                    const total = d3.sum(this.data, d => d[this.value]);
                                    const targetValueCal = this.data.length * this.settings.targetValue;
                                    if (this.settings.label.isTargetValueVisible) {
                                        return this.settings.label.textValueFormat(total) + ` / ${targetValueCal}`;
                                    } else {
                                        return this.settings.label.textValueFormat(total);
                                    }
                                }
                            }),
                        exit => exit.remove()
                    );
                this.radialGroup
                    .selectAll(".uxp-arc-label")
                    .data([this.data[0]])
                    .join(
                        enter => enter.append("text")
                            .attr("class", "uxp-arc-label")
                            .style("opacity", 1)
                            .attr("text-anchor", "middle")
                            .attr('transform', `translate(${this.settings.label.xTranslateLabel}, ${this.settings.label.yTranslateLabel})`)
                            .text((d) => {
                                const singleLabel = this.checkForLabelVisibility();
                                if (singleLabel) {
                                    if (this.settings.label.dataKey) {
                                        return this.settings.label.textLabelFormat(d[this.settings.label.dataKey]);
                                    }
                                    return this.settings.label.textLabelFormat(d[this.label]);
                                } else {
                                    return this.settings.label.textLabelFormat('Total');
                                }
                            }),
                        update => update
                            .attr('transform', `translate(${this.settings.label.xTranslateLabel},${this.settings.label.yTranslateLabel})`)
                            .attr("text-anchor", "middle")
                            .text((d) => {
                                const singleLabel = this.checkForLabelVisibility();
                                if (singleLabel) {
                                    if (this.settings.label.dataKey) {
                                        return this.settings.label.textLabelFormat(d[this.settings.label.dataKey]);
                                    }
                                    return this.settings.label.textLabelFormat(d[this.label]);
                                } else {
                                    return this.settings.label.textLabelFormat('Total');
                                }
                            }),
                        exit => exit.remove()
                    );
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
            this.svgGroup.attr("transform",
                "translate(" + ((this.chartWidth / 2) + this.settings.dimension.margin.left) + "," + ((this.chartHeight / 2) + this.settings.dimension.margin.top) + ")");
        }

        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : d[this.label];
            return textKey;
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
            this.legend = assistant.drawLegend.apply(this.chartObject, [this.legendContainerElement, this.data, this.callbackToGetDisplayText.bind(this)]);
            assistant.positionLegend.apply(this.chartObject, [this.legendContainerElement]);
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
            this.createRadialScale();
            this.drawRadialBar();
            this.drawRadialBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
            assistant.emitEvent("completeDraw", this);
            this.isChartPlotted = true;
            this.updateLegendPos();
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
            this.prepareData();
            this.createRadialScale();
            this.drawRadialBar();
            this.drawRadialBarLabel();
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
            else {
                location.reload();
            }
            this.setChartDimension();
            this.updateGround();
            this.prepareData();
            this.createRadialScale();
            this.drawRadialBar();
            this.drawRadialBarLabel();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }

        updateLegendPos() {
            const containerRect = document.getElementById(this.containerElementIdentifier).getBoundingClientRect();
            const containerWidth = containerRect.width;
            const legendContainer = document.getElementsByClassName('uxp-legend-wrapper')[0];
            legendContainer.removeAttribute("transform");
            let previousWidth = 0;
            let prevLegendRect;
            let rowHeight = 20
            const childNodes = legendContainer.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
                const legendEle = childNodes[i];
                const legendRect = legendEle.getBoundingClientRect();
                if (containerWidth < legendRect.x + legendRect.width) {
                    const rectEle = legendEle.querySelector('rect');
                    if (prevLegendRect) {
                        previousWidth += prevLegendRect.width + 5
                    }
                    const value = (parseFloat(rectEle.getAttribute('x')) - previousWidth) * -1;
                    legendEle.setAttribute("transform", `translate(${value},${rowHeight})`);
                    prevLegendRect = legendRect;
                    if (this.isLegendOutOfContainer(legendEle, containerWidth)) {
                        prevLegendRect = null;
                        previousWidth = 0;
                        rowHeight += 20;
                        i--;
                    }
                }
            }
            const legendWrapperRect = legendContainer.getBoundingClientRect();
            const chartWrapperEle = document.getElementsByClassName('uxp-base-group')[0];
            const transformAttr = chartWrapperEle.getAttribute('transform');
            let val = transformAttr.substr(10, transformAttr.length - 11)
            // let temp = transformAttr.slice(10);
            // temp = temp.slice(0, temp.length - 1);
            const arr = val.split(',');
            const newYValue = parseFloat(arr[1]) + legendWrapperRect.height - 20;
            chartWrapperEle.setAttribute('transform', `translate(${parseFloat(arr[0])},${newYValue})`);
        }

        isLegendOutOfContainer(legendEle, containerWidth) {
            const legendRect = legendEle.getBoundingClientRect();
            return (legendRect.x + legendRect.width) > containerWidth;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class RadialChart {
        constructor() {
            this[radialChartFactory] = new RadialChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[radialChartFactory].containerElement;
            }
            this[radialChartFactory].containerElementIdentifier = args[0];
            this[radialChartFactory].createContainerObject(this[radialChartFactory].containerElementIdentifier);
            return this;
        }

        value(...args) {
            if (!args || !args.length) {
                return this[radialChartFactory].value;
            }
            this[radialChartFactory].value = args[0];
            return this;
        }

        label(...args) {
            if (!args || !args.length) {
                return this[radialChartFactory].label;
            }
            this[radialChartFactory].label = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[radialChartFactory].width,
                height: this[radialChartFactory].height,
                chartWidth: this[radialChartFactory].chartWidth,
                chartHeight: this[radialChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[radialChartFactory].data;
            }
            this[radialChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[radialChartFactory].settings);
            }
            this[radialChartFactory].settings = utility.unifyObject([this[radialChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[radialChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[radialChartFactory].elements;
        }

        on(eventId, handler) {
            this[radialChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[RadialChartFactory].draw();
            let result = utility.handleException(this[radialChartFactory], this[radialChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[radialChartFactory].displayMessageOnScreen(this[radialChartFactory].settings.exceptionMessage);
                this[radialChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[radialChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[radialChartFactory], this[radialChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[radialChartFactory].displayMessageOnScreen(this[radialChartFactory].settings.exceptionMessage);
                this[radialChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[radialChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[radialChartFactory], this[radialChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[radialChartFactory].displayMessageOnScreen(this[radialChartFactory].settings.exceptionMessage);
                this[radialChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[radialChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return RadialChart;
}));