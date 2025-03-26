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
            global.vizualy.CirclePackingChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const circlePackingChartFactory = Symbol();
    class CirclePackingChartFactory extends Observer {

        constructor(child) {
            super();
            this.chartObject = child;
            this.observer = new Observer();

            this.containerElementIdentifier;
            this.containerElement;
            this.data;
            this.nodesData;
            this.isChartPlotted = false;
            this.width,
            this.height,
            this.colors,
            this.svg;
            this.svgGroup;
            this.observer;
            this.elements = {};

            // Default chart settings
            this.settings = {
                dimension: {
                    width: "",
                    height: "",
                    margin: assistant.getDefaultMargin()
                },
                label: {
                    isVisible: true,
                    textLabelFormat: (d) => d
                },
                arcMinRadius: 200,
                tooltip: {
                    isVisible: true,
                    content: (d) => {
                        let tooltipContent = this.label + ": <b>" + d[this.label] + "</b>";
                        if(d[this.size]) {
                            tooltipContent += "<br>" + this.size + ": <b>" + d[this.size] + "</b>";
                        }
                        return tooltipContent;
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

            this.circleGroup;
            this.color;
            this.pack;
            this.view;
            this.size;
            this.root;
            this.children;
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

        getDiameter() {
            return Math.sqrt((this.width * this.width) + (this.height * this.height));
        }

        createScale() {
            this.color = d3.scaleLinear()
                .domain([-1, 5])
                .range((this.colors && this.colors.range) ? this.colors.range : ['#bfbfbf','#838383','#4c4c4c','#1c1c1c'])
                .interpolate(d3.interpolateHcl);
            let diameter = Math.min(this.width, this.height);
            this.pack = d3.pack()
                .size([diameter, diameter])
                .padding(2);
        }

        prepareData() {
            this.nodesData = {
                name: this.data[this.label]
            };
            if(this.data[this.children] && this.data[this.children].length > 0) {
                this.nodesData.children = this.data[this.children].map((ele, i) => {
                    return this.prepareNodesData(ele);
                });
            }
            if(this.data[this.size]) {
                this.nodesData.size = this.data[this.size];
            }
            if(this.colors && this.colors.nodeColorKey && this.data[this.colors.nodeColorKey]) {
                this.nodesData.color = this.data[this.colors.nodeColorKey];
            }
        }

        prepareNodesData(datum){
            let element = {
                name: datum[this.label]
            };
            if(datum[this.children] && datum[this.children].length > 0) {
                element.children = datum[this.children].map((ele, i) => {
                    return this.prepareNodesData(ele);
                });
            }
            if(datum[this.size]) {
                element.size = datum[this.size];
            }
            if(this.colors && this.colors.nodeColorKey && datum[this.colors.nodeColorKey]) {
                element.color = datum[this.colors.nodeColorKey];
            }
            return element;
        }

        drawCircles() {
            if (this.svgGroup.select('.uxp-circle-group').empty()) {
                this.circleGroup = this.svgGroup
                    .append("g")
                    .attr("class", "uxp-circle-group");
            }
            this.root = d3.hierarchy(this.nodesData)
                .sum((d) => { return d.size})
                .sort(function(a, b) { return b.value - a.value; });

            let nodes = this.pack(this.root).descendants();

            let circle = this.circleGroup.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", (d) => {
                    return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
                })
                .style("fill", (d) => {
                    return (d.data && d.data.color) ? d.data.color : (d.children ? this.color(d.depth) : (this.colors && this.colors.leafColor) ? this.colors.leafColor : null);
                });

            if(this.settings.label.isVisible) {
                let text = this.circleGroup.selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("class", "label")
                    .style("fill-opacity", (d) => {
                        return d.parent === this.root ? 1 : 0;
                    })
                    .style("display", (d) => {
                        return d.parent === this.root ? "inline" : "none";
                    })
                    .text((d) => {
                        return d.data.name;
                    });
            }

            this.svg.style("background", (this.colors && this.colors.ground) ? this.colors.ground : this.color(-1)).on("click", (event) => {
                if(this.root.value == 0 || (this.root.x == this.view[0]) && (this.root.y == this.view[1])) {
                    return false;
                }
                this.zoom(this.root, event);
            });

            if(this.root.value > 0) {
                this.zoomTo([this.root.x, this.root.y, this.root.r * 2]);
            } else {
                this.displayMessageOnScreen();
            }

            // // expose element to outer world for customizations
            this.observer.exposeElement(this.elements, "circle", this.circleGroup.selectAll('circle'));

            if (!this.isChartPlotted) {
                //Adding default action to element "circle-group"
                const elementInfomationObj = this.chartObject.getElement("circle");
                elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
                elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
                elementInfomationObj.on('click', [this.zoomToNode.bind(this)], true);
            }
        }

        zoomToNode(d, elem, event) {
            if(d.children == undefined) {
                this.zoom(d.parent, event)
            } else if (this.root !== d) {
                this.zoom(d, event)
            }
            event.stopPropagation();
        }

        zoom(data, event) {
            let transition = d3.transition()
                .duration(event.altKey ? 7500 : 750)
                .tween("zoom", (d) => {
                    let i = d3.interpolateZoom(this.view, [data.x, data.y, data.r * 2 + 20]);
                    return (t) => {
                        this.zoomTo(i(t));
                    };
                });
            transition.selectAll("text")
                .filter(function(d) {
                    return d.parent === data || this.style.display === "inline";
                })
                .style("fill-opacity", (d) => {
                    return d.parent === data ? 1 : 0;
                })
                .on("start", function(d) {
                    if (d.parent === data) {
                        this.style.display = "inline";
                    }
                })
                .on("end", function(d) {
                    if (d.parent !== data) {
                        this.style.display = "none";
                    }
                });
        }

        zoomTo(v) {
            this.view = v;
            let usableArea = ((Math.min(this.width, this.height) === this.height) ? (this.settings.dimension.margin.top + this.settings.dimension.margin.bottom) : (this.settings.dimension.margin.left + this.settings.dimension.margin.right))/100;
            let k = (Math.min(this.width, this.height)/(v[2]) * usableArea);
            let node = this.circleGroup.selectAll("circle,text");
            node.attr("transform", (d) => {
                return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
            });
            node.attr("r", (d) => {
                return d.r * k;
            });
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
            this.svgGroup.attr("transform", "translate(" + ((this.chartWidth / 2) +  this.settings.dimension.margin.left) + "," + ((this.chartHeight / 2) +  this.settings.dimension.margin.top) + ")");
        }

        populateTooltipWithContent(d, elem, event) {
            if (!this.settings.tooltip.isVisible) {
                return;
            }
            assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), (d.data) ? d.data : d, this.settings.tooltip, event]);
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
            this.createScale();
            this.drawCircles();
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
            this.circleGroup.remove();
            this.setChartDimension();
            this.updateGround();
            this.prepareData();
            this.createScale();
            this.drawCircles();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeUpdate", this);
        }

        resize() {
            if (this.resizeHappening)
                return;
            this.circleGroup.remove();
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
            this.prepareData();
            this.createScale();
            this.drawCircles();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class CirclePackingChart {
        constructor() {
            this[circlePackingChartFactory] = new CirclePackingChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].containerElement;
            }
            this[circlePackingChartFactory].containerElementIdentifier = args[0];
            this[circlePackingChartFactory].createContainerObject(this[circlePackingChartFactory].containerElementIdentifier);
            return this;
        }

        size(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].size;
            }
            this[circlePackingChartFactory].size = args[0];
            return this;
        }

        children(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].children;
            }
            this[circlePackingChartFactory].children = args[0];
            return this;
        }

        label(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].label;
            }
            this[circlePackingChartFactory].label = args[0];
            return this;
        }

        colors(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].colors;
            }
            this[circlePackingChartFactory].colors = args[0];
            return this;
        }

        value(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].value;
            }
            this[circlePackingChartFactory].value = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[circlePackingChartFactory].width,
                height: this[circlePackingChartFactory].height,
                chartWidth: this[circlePackingChartFactory].chartWidth,
                chartHeight: this[circlePackingChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[circlePackingChartFactory].data;
            }
            this[circlePackingChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[circlePackingChartFactory].settings);
            }
            this[circlePackingChartFactory].settings = utility.unifyObject([this[circlePackingChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[circlePackingChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[circlePackingChartFactory].elements;
        }

        on(eventId, handler) {
            this[circlePackingChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[CirclePackingChartFactory].draw();
            let result = utility.handleException(this[circlePackingChartFactory], this[circlePackingChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[circlePackingChartFactory].displayMessageOnScreen(this[circlePackingChartFactory].settings.exceptionMessage);
                this[circlePackingChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[circlePackingChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[circlePackingChartFactory], this[circlePackingChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[circlePackingChartFactory].displayMessageOnScreen(this[circlePackingChartFactory].settings.exceptionMessage);
                this[circlePackingChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[circlePackingChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[circlePackingChartFactory], this[circlePackingChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[circlePackingChartFactory].displayMessageOnScreen(this[circlePackingChartFactory].settings.exceptionMessage);
                this[circlePackingChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[circlePackingChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return CirclePackingChart;
}));