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
            global.vizualy.HorizontalBulletChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const horizontalBulletChartFactory = Symbol();
    class HorizontalBulletChartFactory extends Observer {

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
                        Object.keys(d).sort().sort((a, b) => {
                            if (a == this.y) { return -1; }
                            return 0;
                        }).forEach((key, i) => {
                            if (key == this.y) {
                                tooltipCotent += '<tr><td colspan="2" style="border-bottom:1px solid #b6b6b6;padding:2px 4px;"><b>' + d[key] + '</b></td></tr>';
                            } else {
                                let keyData = this.x.find(col => col.key === key);
                                let keyIndex = this.x.findIndex(col => col.key === key);
                                keyData = (keyData && keyData.value) ? keyData.value : key;
                                tooltipCotent += '<tr><td style="padding:2px 4px;"><span style="display:inline-block;width:8px;height:8px;margin-right:5px;background-color:' +
                                (this.colors ? this.colors[keyIndex] : assistant.getDefaultColor(keyIndex)) + ';"></span>' + keyData + '</td><td style="text-align:right;padding:2px 4px"><b>' + d[key] + '%</b></td></tr>';
                            }
                        });
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
                xWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                yWordWrap: {
                    isVisible: false,
                    linesToAddEllipses: 1
                },
                rotateXAxisTick: {
                    value: [0, 0, 0], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                rotateYAxisTick: {
                    value: [-45, -20, -40], // [relative X position of ticks label, relative y position, rotation-angle]
                    isVisible: false
                },
                isResponsive: true,
                emptyDataMessage: 'No Data Available',
                exceptionMessage: 'Something went wrong!! Please look into logs.'
            };
            this.bulletGroup;
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
            let xScaleRange = [0, this.chartWidth];
            let yScaleRange = [this.chartHeight, 0];
            // // Single Axis
            let scale = this.data.map((d, index) => {
                return this.x.sort((a, b) => {
                    if (a.key < b.key) { return -1; }
                    if (a.key > b.key) { return 1;}
                    return 0;
                  }).map((key) => d[key.key]);
            }).flat().sort();
            let xScaleMaxValue = d3.max(scale);
            // let xScaleMinValue = d3.min(scale);
            let xAxisDomain = [0, xScaleMaxValue];
            let yAxisDomain = this.data.map(d => d[this.y]);
            this.xScale = assistant.setScale.apply(this.chartObject, [this.settings.xScaleType, xScaleRange, xAxisDomain]);
            this.yScale = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yScaleRange, yAxisDomain]);
            this.ySubGroups = this.x.map(d => d.key);
            const yGroupRange = [0, this.yScale.bandwidth()];
            this.yScaleGroup = assistant.setScale.apply(this.chartObject, [this.settings.yScaleType, yGroupRange, this.ySubGroups]);
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
                // assistant.updateXAxis.apply(this);
                const xAxisFunction = d3.axisBottom(this.xScale)
                    .ticks(this.settings.xAxisTicksCount.value)
                    .tickFormat(this.settings.xAxis.tickFormat);

                const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-x-axis")]);

                this.svgGroup
                    .select(".uxp-x-axis")
                    .attr("transform", "translate(0," + this.chartHeight + ")")
                    .transition(t)
                    .call(xAxisFunction);

                this.svgGroup.select(".uxp-x-axis").selectAll(".tick").selectAll("text").attr("class", "uxp-xAxisTicks");

                if (this.settings.xWordWrap.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll(".tick text")
                        .call(assistant.wordWrap, this.xScale.bandwidth, 'xAxis', this.settings.xWordWrap.linesToAddEllipses, this.containerElement);
                }
                if (this.settings.rotateXAxisTick.isVisible) {
                    this.svgGroup.select(".uxp-x-axis").selectAll('.tick').selectAll("text")
                        .attr("y", this.settings.rotateXAxisTick.value[1])
                        .attr("x", this.settings.rotateXAxisTick.value[0])
                        .attr("transform", "rotate(" + this.settings.rotateXAxisTick.value[2] + ")")
                        .style("text-anchor", "start");
                }

                this.svgGroup.select(".uxp-x-axis")
                    .call(assistant.adjustTicks, this.settings.rotateYAxisTick, 'x');
            }
        }

        updateYAxis() {
            if (this.settings.yAxis.isVisible) {
                // update y Axis
                assistant.updateYAxis.apply(this);
                if (this.settings.rotateYAxisTick.isVisible) {
                    this.svgGroup.select(".uxp-y-axis").selectAll('.tick').selectAll("text")
                        .attr("y", this.settings.rotateYAxisTick.value[1])
                        .attr("x", this.settings.rotateYAxisTick.value[0])
                        .attr("transform", "rotate(" + this.settings.rotateYAxisTick.value[2] + ")")
                        .style("text-anchor", "start");

                }
                if (this.settings.yWordWrap.isVisible) {

                    this.svgGroup.select(".uxp-y-axis").selectAll(".tick text")
                        .call(assistant.wordWrap, this.yScale.bandwidth, 'yAxis', this.settings.yWordWrap.linesToAddEllipses, this.containerElement);
                }

                // if (this.settings.yAxisTicksCount.isApplied) {
                //     this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale).ticks(this.settings.yAxisTicksCount.value));
                // } else {
                //     this.svgGroup.select(".uxp-y-axis").call(d3.axisLeft(this.yScale));
                // }

                this.svgGroup.select(".uxp-y-axis")
                    .call(assistant.adjustTicks, this.settings.rotateYAxisTick, 'y');
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

        drawBullets() {
            if (this.svgGroup.select('.uxp-bars').empty()) {
                this.barGroup = this.svgGroup.append("g").attr("class", "uxp-bars").attr("clip-path", "url(#" + this.clipContainerId + "-ux-clip)");
            }
            const t = assistant.getTransitionFunction.apply(this, [this.barGroup]);
            
            if (!this.barGroup.select('.uxp-bar-group').empty()) {
                this.barGroup.selectAll('.uxp-bar-group').remove();
            }

            // Drawing
            this.barGroup.selectAll('.uxp-bar-group')
            .data(this.data)
            .join(enter => 
                enter.append('g')
                .attr("class", (d, index) => {
                    return "uxp-bar-group group-" + index;
                })
                .attr("transform", d => `translate(0, ${this.yScale(d[this.y])})`)
                .selectAll("rect")
                .data((d) => {
                    let rangesArray = [], measuresArray = [], markersArray = [];
                    this.x.forEach((key, index) => {
                        if((d[key.key]) != undefined) {
                            if(key.type == "range") {
                                rangesArray.push({
                                    key: key.key,
                                    type: key.type,
                                    value: d[key.key],
                                    color: this.colors ? this.colors[index] : undefined
                                });
                            } else if(key.type == "measure") {
                                measuresArray.push({
                                    key: key.key,
                                    type: key.type,
                                    value: d[key.key],
                                    color: this.colors ? this.colors[index] : undefined
                                });
                            } else if(key.type == "marker") {
                                markersArray.push({
                                    key: key.key,
                                    type: key.type,
                                    value: d[key.key],
                                    color: this.colors ? this.colors[index] : undefined
                                });
                            }
                        }
                    });
                    return [
                        ...rangesArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value)), 
                        ...measuresArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value)),
                        ...markersArray.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
                    ].flat();
                })
                .join("rect")
                .style("fill", (d, i) => {
                    return (d.color) ? d.color : assistant.getDefaultColor(i);
                })
            )
            .attr("class", (d) => {
                return "uxp-bar " + "upx-bar-" + d.type 
            })
            .attr("y", (d) => {
                return (d.type == "range" || d.type == "marker") ? this.yScaleGroup() : (((this.yScaleGroup.bandwidth() * this.ySubGroups.length) - (this.yScaleGroup.bandwidth()/this.yScaleGroup.length))/2);
            })
            .attr("width", 0)
            .attr("x", (d) => {
                // return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType));
                if(d.type == "range" || d.type == "measure") {
                    return this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType));
                } else {
                    return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                }
            })
            .attr("height", (d) => {
                return (d.type == "range" || d.type == "marker") ? (this.yScaleGroup.bandwidth() * this.ySubGroups.length) : (this.yScaleGroup.bandwidth()/this.yScaleGroup.length);
            })
            .transition(t)
            .call(enter => enter.transition(t)
                .attr("x", (d) => {
                    // return 0;
                    if(d.type == "range" || d.type == "measure") {
                        return 0;
                    } else {
                        return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    }
                })
                .attr("width", (d) => {
                    // return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    if(d.type == "range" || d.type == "measure") {
                        return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    } else {
                        return 2;
                    }
                })
            )
            .attr("transform", () => {
                    return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
                }
            ),
            update => update
            .style("fill", (d, i) => {
                return (d.color) ? d.color : assistant.getDefaultColor(i);
            })
            .call(update => update.transition(t)
                .attr("y", (d) => {
                    return (d.type == "range" || d.type == "marker") ? this.yScaleGroup() : (((this.yScaleGroup.bandwidth() * this.ySubGroups.length) - (this.yScaleGroup.bandwidth()/this.yScaleGroup.length))/2);
                })
                .attr("height", (d) => {
                    return (d.type == "range" || d.type == "marker") ? (this.yScaleGroup.bandwidth() * this.ySubGroups.length) : (this.yScaleGroup.bandwidth()/this.yScaleGroup.length);
                })
                .attr("x", (d) => {
                    // return 0;
                    if(d.type == "range" || d.type == "measure") {
                        return 0;
                    } else {
                        return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    }
                })
                .attr("width", (d) => {
                    // return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    if(d.type == "range" || d.type == "measure") {
                        return Math.abs(this.xScale(d.value) - this.xScale(assistant.getAxisFirstTick(this.settings.xScaleType)));
                    } else {
                        return 2;
                    }
                })
            )
            .attr("transform", () => {
                return this.settings.barSpace.type === 'perc' ? ("translate(" + (this.yScaleGroup.bandwidth() * this.settings.barSpace.value) / 2 + " , 0)") : '';
            }),
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
            return data.map((d) => {
                return this.x.filter((key, i) => {
                    return (d[key.key]) != undefined;
                }).map((key, i) => {
                    return {
                        key: key.key,
                        type: key.type,
                        value: d[key.key],
                        color: this.colors ? this.colors[i] : undefined
                    };
                })
            });
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
                    this.drawBullets();
                    this.drawGridLines();
                    this.drawBarLabel();
                    this.updateXAxis();
                    this.updateYAxis();
                    this.drawAxisLabels();
                }
            } else if (event.selection[0] != event.selection[1]) {
                this.brushScale.domain(event.selection);
                this.xScale.range([this.brushScale(0), this.brushScale(this.chartWidth)]);
                this.drawBullets();
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
            return this.settings.xAxis.tickFormat(d['property']);
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
            let legendData = this.x.sort((a, b) => {
                if (a.key < b.key) { return -1; }
                if (a.key > b.key) { return 1;}
                return 0;
              }).map((d, i) => {
                return {
                    color: this.colors ? this.colors[i] : assistant.getDefaultColor(i),
                    property: (d.value) ? d.value : d.key
                };
            });
            return legendData;
        }

        prepareLData(data) {
            let nestedData = [];
            d3.group(data, d => d[this.y]).forEach((d, i) => {
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
            this.createScales();
            this.drawXAxis();
            this.drawYAxis();
            this.drawGridLines();
            this.drawBullets();
            // if (this.settings.brush.isVisible) {
            //     this.createBrushScales();
            //     this.drawBrushStackedBars();
            //     this.defineBrush();
            // }
            this.drawAxisLabels();
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
            this.setNegativeValueFlag();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.drawBullets();
            this.drawAxisLabels();
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
                // this.draw();
                this.resizeHappening = false;
                return this.chartObject;
            }
            this.setChartDimension();
            this.updateGround();
            this.setNegativeValueFlag();
            this.createScales();
            this.updateXAxis();
            this.updateYAxis();
            this.drawGridLines();
            this.drawBullets();
            this.drawAxisLabels();
            this.drawLegend();
            if (this.settings.tooltip.isVisible) {
                assistant.createTooltipWrapper();
            }
            assistant.emitEvent("completeResize", this);
            this.resizeHappening = false;
        }
    }

    //--------------------------Chart class exposed to outer world----START-------------------------//
    class HorizontalBulletChart {
        constructor() {
            this[horizontalBulletChartFactory] = new HorizontalBulletChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].containerElement;
            }
            this[horizontalBulletChartFactory].containerElementIdentifier = args[0];
            this[horizontalBulletChartFactory].createContainerObject(this[horizontalBulletChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].x;
            }
            this[horizontalBulletChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].y;
            }
            this[horizontalBulletChartFactory].y = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[horizontalBulletChartFactory].width,
                height: this[horizontalBulletChartFactory].height,
                chartWidth: this[horizontalBulletChartFactory].chartWidth,
                chartHeight: this[horizontalBulletChartFactory].chartHeight
            };
        }

        data(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].data;
            }
            this[horizontalBulletChartFactory].data = args[0];
            return this;
        }

        colors(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].colors;
            }
            this[horizontalBulletChartFactory].colors = args[0];
            return this;
        }

        column(...args) {
            if (!args || !args.length) {
                return this[horizontalBulletChartFactory].column;
            }
            this[horizontalBulletChartFactory].column = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[horizontalBulletChartFactory].settings);
            }
            this[horizontalBulletChartFactory].settings = utility.unifyObject([this[horizontalBulletChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[horizontalBulletChartFactory].elements[elementIdentifier];
        }

        getElementList() {
            return this[horizontalBulletChartFactory].elements;
        }

        on(eventId, handler) {
            this[horizontalBulletChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[horizontalBulletChartFactory].draw();
            let result = utility.handleException(this[horizontalBulletChartFactory], this[horizontalBulletChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[horizontalBulletChartFactory].displayMessageOnScreen(this[horizontalBulletChartFactory].settings.exceptionMessage);
                this[horizontalBulletChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[horizontalBulletChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[horizontalBulletChartFactory], this[horizontalBulletChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[horizontalBulletChartFactory].displayMessageOnScreen(this[horizontalBulletChartFactory].settings.exceptionMessage);
                this[horizontalBulletChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[horizontalBulletChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[horizontalBulletChartFactory], this[horizontalBulletChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[horizontalBulletChartFactory].displayMessageOnScreen(this[horizontalBulletChartFactory].settings.exceptionMessage);
                this[horizontalBulletChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[horizontalBulletChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return HorizontalBulletChart;
}));