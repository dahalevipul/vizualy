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
        if(global.vizualy) {
            global.vizualy.PieChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const pieChartFactory = Symbol();
    class PieChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();
            this.containerElementIdentifier;
            this.containerElement;
            this.x;
            this.y;
            this.data;
            this.isChartPlotted = false;
            this.width;
            this.height;
            this.svg;
            this.svgGroup;
            this.observer;
            this.elements = {};
            this.arc;
            this.radius;
            this.innerRadius;

            //Default chart settings
            this.settings = {
                donut: {
                    isApplied: true,
                    thickness: { type: 'ratio', value: .5 } // { type: 'pixel', value: 50}
                },
                dimension: {
                    width: "",
                    height: "",
                    margin: { top: 0, right: 0, bottom: 0, left: 0 }
                },
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        return this.value + ": <b>" + d.data[this.value] + "</b><br>" +
                            this.label + ": <b>" + d.data[this.label] + "</b>";
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
                label: {
                    isVisible: true,
                    placement: 'in-out', //'in', 'out', 'in-out'
                    dataKey: null,
                    textFormat: (d) => d
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
            "translate(" + ((this.chartWidth / 2) +  this.settings.dimension.margin.left) + "," + ((this.chartHeight / 2) +  this.settings.dimension.margin.top) + ")");
        }

        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return (t) => {
                return this.arc(i(t));
            };
        }

        calculateRadius() {
            this.radius = (Math.min(this.chartWidth, this.chartHeight) / 2);
            this.innerRadius = 0;
            if (this.settings.donut.isApplied) {
                if (this.settings.donut.thickness.type === 'ratio') {
                    this.innerRadius = this.radius * (this.settings.donut.thickness.value);
                } else if (this.settings.donut.thickness.type === 'pixel') {
                    this.innerRadius = this.radius - this.settings.donut.thickness.value;
                }
            }
        }

        calculateArc() {
            this.arc = d3.arc()
                .outerRadius(this.radius)
                .innerRadius(this.innerRadius);
        }

        calculatePie() {
            this.pie = d3.pie()
                .sort(null)
                .value((d) => { return d[this.value]; });
        }

        drawPie() {
            if (this.svgGroup.select('.uxp-pie-group').empty()) {
                this.pieGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-pie-group");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.pieGroup]);

            this.calculateRadius();
            this.calculateArc();
            this.calculatePie();

            this.pieGroup
                .selectAll(".uxp-arc")
                .data(this.pie(this.data))
                .join(
                    enter => enter.append("path")
                        .attr("class", "uxp-arc")
                        .style("opacity", 0.6)
                        .attr("fill", (d, i) => {
                            return (d.data.color) ? d.data.color : assistant.getDefaultColor(i);
                        })
                        .call(enter => enter.transition(t)
                        .attrTween("d", (a) => this.arcTween(a))),
                    update => update
                        .attr("fill", (d, i) => {
                            return (d.data.color) ? d.data.color : assistant.getDefaultColor(i);
                        })
                        .call(update => update.transition(t)
                        .attrTween("d", (a) => this.arcTween(a))),
                    exit => exit.remove()
                );

            //expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "pie", this.pieGroup.selectAll(".uxp-arc"));

            if (!this.isChartPlotted) {
                //Adding default action to element "pie"
                const elementInfomationObj = this.chartObject.getElement("pie");
                elementInfomationObj.on('mouseEnter',[this.applyHoverEffect], true);
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this), this.revertHoverEffect], true);
            }
        }

        applyHoverEffect(d, elem) {
            d3.select(elem)
                 .style("opacity", 1);
        }

        revertHoverEffect(d, elem) {
            d3.select(elem)
                 .style("opacity", 0.6);
        }

        validateSpaceForLabel(d, elem) {
            const bb = elem.getBBox();
            const center = this.labelArc.centroid(d);
            const topLeft = {
                x: center[0] + bb.x,
                y: center[1] + bb.y
            };
            const topRight = {
                x: topLeft.x + bb.width,
                y: topLeft.y
            };
            const bottomLeft = {
                x: topLeft.x,
                y: topLeft.y + bb.height
            };
            const bottomRight = {
                x: topLeft.x + bb.width,
                y: topLeft.y + bb.height
            };
            d.visible = this.pointIsInArc(topLeft, d, this.labelArc) &&
                this.pointIsInArc(topRight, d, this.labelArc) &&
                this.pointIsInArc(bottomLeft, d, this.labelArc) &&
                this.pointIsInArc(bottomRight, d, this.labelArc);

        }

        pointIsInArc(pt, ptData, d3Arc) {
            // Center of the arc is assumed to be 0,0
            // (pt.x, pt.y) are assumed to be relative to the center
            const r1 = d3Arc.innerRadius()(ptData), // Note: Using the innerRadius
                r2 = d3Arc.outerRadius()(ptData),
                theta1 = d3Arc.startAngle()(ptData),
                theta2 = d3Arc.endAngle()(ptData);

            const dist = pt.x * pt.x + pt.y * pt.y;
            let angle = Math.atan2(pt.x, -pt.y); // Note: different coordinate system.

            angle = (angle < 0) ? (angle + Math.PI * 2) : angle;

            return (r1 * r1 <= dist) && (dist <= r2 * r2) &&
                (theta1 <= angle) && (angle <= theta2);
        }

        getMidAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        drawLabels() {
            if (!this.settings.label.isVisible) {
                this.pieGroup.selectAll(".uxp-arc-label").remove();
                return;
            }
            const self = this;
            this.labelArc = d3.arc()
                .outerRadius(this.radius)
                .innerRadius(this.innerRadius);

            const t = assistant.getTransitionFunction.apply(this, [this.pieGroup]);

            const text = this.pieGroup.selectAll("text").data(this.pie(this.data));

            text.join(
                enter => enter.append("text")
                    .attr("class", "uxp-arc-label")
                    .text((d) => {
                        if (this.settings.label.dataKey) {
                            return this.settings.label.textFormat(d.data[this.settings.label.dataKey]);
                        }
                        return this.settings.label.textFormat(d.data[this.value]);
                     })
                     .style("text-anchor", () => {
                        return 'middle';
                    })
                    .call(enter => enter.transition(t)
                    .text((d) => {
                        if (this.settings.label.dataKey) {
                            return this.settings.label.textFormat(d.data[this.settings.label.dataKey]);
                        }
                        return this.settings.label.textFormat(d.data[this.value]);
                     })
                     .each(function (d) { self.validateSpaceForLabel(d, this); })
                     .attr("transform", (d) => {
                        return "translate(" + this.labelArc.outerRadius(this.getLabelVisibilityParameters(d).radius).centroid(d) + ")";
                     })
                     .style('opacity', (d) => {
                         if (this.getLabelVisibilityParameters(d).visibleAlways) {
                             return 1;
                         } else {
                             return d.visible ? 1 : 0;
                         }
                     })),
                update => update
                    .call(update => update.transition(t)
                    .text((d) => {
                        if (this.settings.label.dataKey) {
                            return this.settings.label.textFormat(d.data[this.settings.label.dataKey]);
                        }
                        return this.settings.label.textFormat(d.data[this.value]);
                     })
                     .each(function (d) { self.validateSpaceForLabel(d, this); })
                     .attr("transform", (d) => {
                        return "translate(" + this.labelArc.outerRadius(this.getLabelVisibilityParameters(d).radius).centroid(d) + ")";
                     })
                     .style('opacity', (d) => {
                         if (this.getLabelVisibilityParameters(d).visibleAlways) {
                             return 1;
                         } else {
                             return d.visible ? 1 : 0;
                         }
                     })),
                exit => exit.remove()
            );
        }

        getLabelVisibilityParameters(d) {
            const labelVisibilityParameters = { checkVisibility: true, visibleAlways: false, radius: this.radius };
            if (this.settings.label.placement == 'out') {
                labelVisibilityParameters.checkVisibility = false;
                labelVisibilityParameters.visibleAlways = true;
                labelVisibilityParameters.radius = this.radius + (this.radius * 0.9);
            } else if (this.settings.label.placement == 'in-out') {
                labelVisibilityParameters.visibleAlways = true;
                if (!d.visible) {
                    labelVisibilityParameters.radius = this.radius + (this.radius * 0.9);
                }
            } else if (this.settings.label.placement == 'out-arrow') {
                labelVisibilityParameters.visibleAlways = true;
                labelVisibilityParameters.radius = radius + (this.radius * 0.9);
            }
            return labelVisibilityParameters;
        }

        callbackToGetDisplayText(d) {
            const textKey = this.settings.legend.textKey ? this.settings.legend.textKey : this.label;
            return d[textKey];
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
            this.radius = Math.min(this.chartWidth, this.chartHeight) / 2;
            if (utility.isDataEmpty(this.data)) {
                this.displayMessageOnScreen();
                this.isChartPlotted = false;
                return this.chartObject;
            }
            this.drawPie();
            this.drawLabels();
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
            this.setChartDimension();
            this.updateGround();
            this.drawPie();
            this.drawLabels();
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
            this.radius = Math.min(this.chartWidth, this.chartHeight) / 2;
            if (!this.isChartPlotted) {
                this.draw();
                this.resizeHappening = false;
                return this.chartObject;
            }
            this.setChartDimension();
            this.updateGround();
            this.drawPie();
            this.drawLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }

    class PieChart {
        constructor() {
            this[pieChartFactory] = new PieChartFactory(this);
        }
        container(...args) {
            if (!args || !args.length) {
                return this[pieChartFactory].containerElement;
            }
            this[pieChartFactory].containerElementIdentifier = args[0];
            this[pieChartFactory].createContainerObject(this[pieChartFactory].containerElementIdentifier);
            return this;
        }
        value(...args) {
            if (!args || !args.length) {
                return this[pieChartFactory].value;
            }
            this[pieChartFactory].value = args[0];
            return this;
        }

        label(...args) {
            if (!args || !args.length) {
                return this[pieChartFactory].label;
            }
            this[pieChartFactory].label = args[0];
            return this;
        }
        activeDimension() {
            return {
                width: this[pieChartFactory].width,
                height: this[pieChartFactory].height,
                chartWidth: this[pieChartFactory].chartWidth,
                chartHeight: this[pieChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[pieChartFactory].data;
            }
            this[pieChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[pieChartFactory].settings);
            }
            this[pieChartFactory].settings = utility.unifyObject([this[pieChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[pieChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[pieChartFactory].elements;
        }

        on(eventId, handler) {
            this[pieChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[pieChartFactory].draw();
            let result = utility.handleException(this[pieChartFactory], this[pieChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[pieChartFactory].displayMessageOnScreen(this[pieChartFactory].settings.exceptionMessage);
                this[pieChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[pieChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[pieChartFactory], this[pieChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[pieChartFactory].displayMessageOnScreen(this[pieChartFactory].settings.exceptionMessage);
                this[pieChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[pieChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[pieChartFactory], this[pieChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[pieChartFactory].displayMessageOnScreen(this[pieChartFactory].settings.exceptionMessage);
                this[pieChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[pieChartFactory]);
            }
        }
    }
    return PieChart;
}));