(function (global, factory) {
    if (typeof exports === "object" && typeof module !== 'undefined') {
        module.exports = factory(require('@impetusuxp/vizualy-assistant/src/js/utility'),
            require('d3'));
    } else if (typeof define === "function" && define.amd) {
        define(['../vizualy-assistant/src/js/utility', '../libs/d3.v6.min.js'], factory);
    } else {
        if (global.vizualy) {
            global.vizualy.assistant = factory(global.vizualy.utility, d3);
        } else {
            console.error("utility object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, d3) {

    const axisLabelMargin = {
        xAxis: 40, yAxis: 50, y1Axis: 30
    };

    class Assistant {
        constructor() { }

        getDefaultMargin() {
            return { top: 30, right: 30, bottom: 50, left: 50 };
        }

        getDefaultColor(i) {
            return d3.schemePaired[i];
        }

        emitEvent(eventName, chartFactory) {
            const userDefinedEvent = chartFactory[eventName];
            if (userDefinedEvent) {
                return userDefinedEvent();
            }
        }

        drawSVG() {
            const svg = this.containerElement
                .append("svg")
                .attr("class", "uxp-vizualy " + this.constructor.name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).substring(1));
            const svgGroup = svg.append("g")
                .attr("class", "uxp-base-group");
            return [svg, svgGroup];
        }

        updateSVG() {
            if (this.settings.brush && this.settings.brush.isVisible) {
                this.height = this.height + this.settings.brush.height + this.settings.brush.margin;
            }
            this.svg.attr("width", this.width)
                .attr("height", this.height)
                .attr('viewBox', '0 ,0, ' + this.width + ', ' + this.height)
                .attr('preserveAspectRatio', 'xMidYMid meet');

            let xTranslate = this.settings.dimension.margin.left;
            let yTranslate = this.settings.dimension.margin.top;
            if (this.settings.legend.isVisible) {
                yTranslate = yTranslate + this.settings.legend.margin.top + this.settings.legend.margin.bottom;
            }
            this.svgGroup.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")");
        }

        drawAxisGroup(axis) {
            this.svgGroup
                .append("g")
                .attr("class", "uxp-axis uxp-" + axis + "-axis");
        }

        wordWrap(text, width, axis, linesToAddEllipses) {
            text.each(function () {
                let text = d3.select(this),
                    titleText = text.text(),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line,
                    lines = [],
                    lineNumber = 0,
                    lineHeight = 1, // ems
                    lineWidth = 1.2,
                    xMargin = -12,
                    yMargin = -10,
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")) ? parseFloat(text.attr("dy")) : 0,
                    x = 3;

                linesToAddEllipses = (linesToAddEllipses !== undefined) ? linesToAddEllipses : 0;

                text.text(null);
                text.append("title").text(titleText);
                text.attr("transform", "translate(" + xMargin + "," + (y - 18) + ")");
                let tspan = text.append("tspan").attr("x", x).attr("y", y)
                    .attr("dy", lineHeight * lineWidth + dy + "em").text(text);
                let collectiveWord;
                let isEllipsesAdded = false;
                let wordFlag = true;
                while (wordFlag) {
                    word = words.pop();
                    if (!word) {
                        break;
                    }
                    if (isEllipsesAdded) break;
                    collectiveWord = (lines.slice(-1).pop() ? lines.slice(-1).pop() + " " : "") + word;
                    tspan.text(collectiveWord);
                    if (width > text.node().getBBox().width) {
                        lines.pop();
                        lines.push(collectiveWord);
                    } else {
                        tspan.text(word);
                        if (linesToAddEllipses && lines.length >= linesToAddEllipses) {
                            // Ellipsis for line control
                            let ellipseWord = lines.pop();
                            tspan.text(ellipseWord + "...");
                            while (width < tspan.node().getBBox().width) {
                                ellipseWord = ellipseWord.slice(0, -1);
                                tspan.text(ellipseWord + "...");
                            }
                            if (width < tspan.node().getBBox().width + 5) ellipseWord = ellipseWord.slice(0, -1);
                            isEllipsesAdded = true;
                            lines.push(ellipseWord + "...");
                        } else if (width > text.node().getBBox().width) {
                            lines.push(word);
                        } else {
                            // Ellipsis for long word
                            let ellipseWord = word;
                            tspan.text(word + "...");
                            while (width < tspan.node().getBBox().width) {
                                ellipseWord = ellipseWord.slice(0, -1);
                                tspan.text(ellipseWord + "...");
                            }
                            if (width < tspan.node().getBBox().width + 5) ellipseWord = ellipseWord.slice(0, -1);
                            isEllipsesAdded = true;
                            lines.push(ellipseWord + "...");
                        }
                    }
                }
                d3.select(tspan.node()).remove();
                let linesCount = lines.length;
                let lineFlag = true;
                while (lineFlag) {
                    line = lines.shift();
                    if (!line) {
                        break;
                    }
                    if (axis === "yAxis") {
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight * lineWidth + dy + "em").text(line);
                    } else {
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(line);
                    }
                }

                if (axis === "yAxis") {
                    text.attr("transform", "translate(" + xMargin + "," + (-(text.node().getBBox().height - ((linesCount - 1) * 7))) + ")");
                } else {
                    text.attr("transform", "translate(0, " + yMargin + ")");
                }
            });
        }

        updateXAxis() {
            let xAxisFunction;
            if (this.settings['xAxis'].tickUnit && this.settings['xAxis'].tickInterval) {
                const tickUnit = 'time' + this.settings['xAxis'].tickUnit.charAt(0).toUpperCase() + this.settings['xAxis'].tickUnit.slice(1).toLowerCase();
                const tickInterval = Number(this.settings['xAxis'].tickInterval);
                xAxisFunction = d3.axisBottom(this.xScale)
                    .ticks(d3[tickUnit].every(tickInterval))
                    .tickFormat(this.settings.xAxis.tickFormat);
            } else {
                xAxisFunction = d3.axisBottom(this.xScale)
                    .ticks(d3.timeDay)
                    .tickFormat(this.settings.xAxis.tickFormat);
            }

                const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-x-axis")]);
                
                this.svgGroup
                .select(".uxp-x-axis")
                .attr("transform", "translate(0," + this.chartHeight + ")")
                .transition(t)
                .call(xAxisFunction)
        }

        updateYAxis() {
            const yAxisFunction = d3.axisLeft(this.yScale)
                .tickFormat(this.settings.yAxis.tickFormat);

            const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-y-axis")]);

            this.svgGroup
                .select(".uxp-y-axis")
                .transition(t)
                .call(yAxisFunction);
        }

        updateY1Axis() {
            const y1AxisFunction = d3.axisRight(this.yLineScale)
                .tickFormat(this.settings.yAxis.tickFormat);

            const t = assistant.getTransitionFunction.apply(this, [this.svgGroup.select(".uxp-y1-axis")]);
            this.svgGroup.select(".uxp-y1-axis").call(y1AxisFunction).attr("transform", "translate(" + this.chartWidth + ",0)");
            this.svgGroup
                .select(".uxp-y1-axis")
                .transition(t)
                .call(y1AxisFunction);
        }
        //adjust ticks spacing to not overlap
        adjustTicks(svgGroup, rotateXAxisTick, axis, selectorArg) {
            var tickStartX = 0,
                tickEndX = 0,
                tickNumber = 0, //Tick to be compared with subsequent tick.
                tickBox,
                transform,
                transformX,
                tickStartY = 0,
                tickEndY = 0,
                transformY,
                selector;

            if (!selectorArg) {
                selector = svgGroup.selectAll('.tick');
            } else {
                selector = selectorArg;
            }
            selector.style('visibility', function () {
                tickBox = this.getBBox();
                transform = d3.select(this).attr("transform");

                if (axis == 'x') {
                    transformX = transform.split(',')[0].split('(')[1];
                    if (rotateXAxisTick && Array.isArray(rotateXAxisTick) && rotateXAxisTick.length) {
                        tickStartX = Number(transformX) + Number(rotateXAxisTick[1]);
                    } else {
                        tickStartX = Number(transformX) - Number(tickBox.width / 2);
                    }
                    
                    if (tickEndX > 0) {
                        if (tickStartX < tickEndX) {
                            return 'hidden';
                        }
                    }
                    if (rotateXAxisTick && Array.isArray(rotateXAxisTick) && rotateXAxisTick.length) {
                        tickEndX = Number(transformX) + Number(rotateXAxisTick[1]) + Number(tickBox.width);
                    } else {
                        tickEndX = Number(transformX) + Number((tickBox.width / 2));
                    }
                    tickNumber = tickNumber + 1;

                } else if (axis == 'y' || axis == 'y1') {
                    transformY = transform.split(',')[1].split(')')[0];
                    tickStartY = Number(transformY) + Number(tickBox.height / 2);
                    if (tickEndY == 0) {
                        if (tickStartY < 0) {
                            return 'hidden';
                        }
                    } else {
                        if (tickStartY > tickEndY) {
                            return 'hidden';
                        }
                    }
                    tickEndY = Number(transformY) - Number((tickBox.height) / 2);
                }
            });
        }
        // displays provided messages on screen
        displayMessageOnScreen(message) {
            let chart = this;
            chart.container().selectAll("g").remove();
            chart.container().select(".uxp-error-warning-message").remove();

            chart.container().select("svg").append("text")
                .attr("x", chart.container().node().getBoundingClientRect().width / 2)
                .attr("y", chart.container().node().getBoundingClientRect().height / 2)
                .attr("class", "uxp-error-warning-message")
                .style("text-anchor", "middle")
                .text(message);
        }

        setDimension() {
            const containerElement = this.container(),
                settings = this.settings();

            let width,
                height,
                chartHeight,
                chartWidth;

            width = settings.dimension.width || (containerElement.node().getBoundingClientRect().width || containerElement.node().parentNode.getBoundingClientRect().width);
            height = settings.dimension.height || (containerElement.node().getBoundingClientRect().height || containerElement.node().parentNode.getBoundingClientRect().height);
            chartWidth = width - settings.dimension.margin.left - settings.dimension.margin.right;
            chartHeight = height - settings.dimension.margin.top - settings.dimension.margin.bottom;
            if (settings.legend.isVisible) {
                chartHeight = chartHeight - settings.legend.margin.top - settings.legend.margin.bottom;
            }
            return [width, height, chartWidth, chartHeight];
        }

        cleanContainer(containerElement) {
            containerElement.select("svg").remove();
        }

        createTooltipWrapper() {
            if (d3.select(".uxp-tooltip").empty()) {
                d3.select("body").append("div").attr("class", "uxp-tooltip");
            }
        }

        hideTooltipWrapper() {
            if (!d3.select(".uxp-tooltip").empty()) {
                d3.select(".uxp-tooltip").style("display", "none");
            }
        }

        drawGridLines(axis, scale, chartDimension, svgGroup, clipContainerId = "containerId") {
            var grid,
                gridGroup,
                gridClass = 'uxp-grid-' + axis;

            gridGroup = svgGroup.select('.uxp-grid-group');
            if (gridGroup.empty()) {
                gridGroup = svgGroup.append("g")
                    .attr("class", "uxp-grid-group")
                    .attr("clip-path", "url(#" + clipContainerId + "-ux-clip)");
            }

            grid = gridGroup.select('.' + gridClass);
            if (grid.empty()) {
                grid = gridGroup.append("g")
                    .attr("class", "uxp-grid " + gridClass + "");
            }
            if (axis == 'y' || axis == 'y1') {
                grid.call(d3.axisLeft(scale).tickSize(-chartDimension).tickFormat(""));
            } else if (axis == 'x') {
                grid.attr("transform", "translate(0," + chartDimension + ")")
                    .call(d3.axisBottom(scale).tickSize(-chartDimension).tickFormat(""));
            }
            grid.selectAll("line")
                .attr('class', (d) => {
                    if (!d) {
                        return 'uxp-zero-grid';
                    }
                    return 'uxp-non-zero-grid';
                });
        }

        removeGridLines(axis, svgGroup) {
            let grid,
                gridGroup;

            svgGroup.select('.uxp-grid-' + axis).remove();
            gridGroup = svgGroup.select('.uxp-grid-group');
            grid = gridGroup.selectAll('.uxp-grid');
            if (grid.empty()) {
                gridGroup.remove();
            }
        }
        drawAxisLabels(axis, svgGroup) {
            let axisLabel;
            const self = this;

            axisLabel = svgGroup.select(".uxp-" + axis + "-axis-label");
            assistant.removeAxisLabel(axis, svgGroup);
            axisLabel = svgGroup
                .select(".uxp-" + axis + "-axis")
                .append("text")
                .attr("class", "uxp-" + axis + "-axis-label")
                .text(() => {
                    return (axis == 'y1') ? self.settings().y1AxisLabel.value : (axis == 'y') ?
                        self.settings().yAxisLabel.value : self.settings().xAxisLabel.value;
                });
            axisLabel
                .append('title')
                .text(() => {
                    return (axis == 'y1') ? self.settings().y1AxisLabel.value : (axis == 'y') ?
                        self.settings().yAxisLabel.value : self.settings().xAxisLabel.value;
                });

            axisLabel
                .attr("x", () => {
                    return (axis == 'y' || axis == 'y1') ? -((self.activeDimension().chartHeight / 2)) : ((self.activeDimension().chartWidth) / 2);
                })
                .attr("y", () => {
                    let y;
                    if (axis == 'y1') {
                        var y1AxisLabel = (self.settings().y1AxisLabel) ? self.settings().y1AxisLabel : undefined;
                        y = (y1AxisLabel && y1AxisLabel.margin) ? y1AxisLabel.margin : axisLabelMargin.y1Axis;
                    } else if (axis == 'y') {
                        var yAxisLabel = (self.settings().yAxisLabel) ? self.settings().yAxisLabel : undefined;
                        y = (yAxisLabel && yAxisLabel.margin) ? -yAxisLabel.margin : -axisLabelMargin.yAxis;
                    } else {
                        var xAxisLabel = (self.settings().xAxisLabel) ? self.settings().xAxisLabel : undefined;
                        y = (xAxisLabel && xAxisLabel.margin) ? xAxisLabel.margin : axisLabelMargin.xAxis;
                    }
                    return y;
                });
        }
        removeAxisLabel(axis, svgGroup) {
            svgGroup.select(".uxp-" + axis + "-axis-label").remove();
        }

        populateTooltipContent(tooltipContainer, d, tooltipConfiguration, event) {
            tooltipContainer
                .style("display", "inline-block")
                .html(() => {
                    const tooltipContent = tooltipConfiguration.content;
                    if (tooltipContent && typeof tooltipContent === "function") {
                        return tooltipContent(d, this, event);
                    } else {
                        console.error("Tooltip should have content as a function embadding HTML!!");
                    }
                });
        }

        getAxisFirstTick(obj) {
            if (obj.type == "log") {
                return 0.5;
            } else {
                return 0;
            }
        }

        setScale(scaleObj, range, domain) {
            var scale, scaleType;
            if (typeof scaleObj !== "object") {
                console.log('Pass an object to set axis scale.');
            }
            scaleType = scaleObj.type.charAt(0).toUpperCase() + scaleObj.type.substr(1);
            scale = d3["scale" + scaleType]().domain(domain).range(range);
            assistant.setScaleRounding(scaleObj, scale);
            assistant.setScalePadding(scaleObj, scale);
            if (scaleType == "Log") {
                if (domain[0] == 0) {
                    domain[0] = 0.5;
                }
                if (scaleObj.base) {
                    return scale.domain(domain).range(range).base(scaleObj.base);
                } else {
                    return scale.domain(domain).range(range);
                }
            } else if (scaleType == "Band") {
                if (this.settings().barSpace) {
                    if (this.settings().barSpace.type === 'px') {
                        let validatedBarSpaceValue = this.settings().barSpace.value >= scale.bandwidth() ? scale.bandwidth() / 10 : this.settings().barSpace.value;
                        return scale.padding(validatedBarSpaceValue / scale.bandwidth());
                    } else {
                        return scale.padding(this.settings().barSpace.value);
                    }
                }
            } else if (scaleType == "Pow") {
                if (scaleObj.exponent) {
                    return scale.exponent(scaleObj.exponent);
                }
            } else if (scaleType == "time") {
                scale.domain(domain).range(range);
            }
            return scale;
        }

        setScaleRounding(scaleObj, scale) {
            if (scaleObj.round === true) {
                scale.round(true);
            }
        }

        setScalePadding(scaleObj, scale) {
            if (typeof scaleObj.padding === "number") {
                scale.padding(scaleObj.padding);
            } else if (Array.isArray(scaleObj.padding) && scaleObj.padding.length === 2) {
                scale.paddingInner(scaleObj.padding[0]);
                scale.paddingOuter(scaleObj.padding[1]);
            }
        }

        // function to validate scale type for given data
        isValidScaleType(scale, isDataValueNegative) {
            if ((scale == 'log' || scale == 'pow') && isDataValueNegative) {
                assistant.displayMessageOnScreen.apply(this, ["Something went wrong, please check log."]);
                console.error('Exponential scales does not support negative data');
                return false;
            }

            return true;
        }

        // function to validate barspace value in percentage
        isValidbarSpaceValue(barSpaceConfig) {
            if ((barSpaceConfig.type == 'perc' && barSpaceConfig.value > 0.9)) {
                assistant.displayMessageOnScreen.apply(this, ["Something went wrong, please check log."]);
                console.error('barspace value should be between 0 to 0.9 in perc');
                return false;
            }
            return true;
        }

        setTooltipPosition(tooltipContainer, tooltipConfiguration, event) {
            const tooltipDiamension = tooltipContainer.node().getBoundingClientRect();
            let mouseX, calculatedX, calculatedY, mouseY, placement;
            mouseX = calculatedX = event.pageX + 10;  //right aligned
            mouseY = calculatedY = event.pageY; //bottom aligned
            if (tooltipConfiguration.placement && tooltipConfiguration.placement != "") {
                placement = tooltipConfiguration.placement.split('-');
            }
            if (placement && placement.length > 1) {
                if (placement.indexOf("left") > -1) {
                    calculatedX = mouseX - tooltipDiamension.width - 15;
                }
                if (placement.indexOf("top") > -1) {
                    calculatedY = mouseY - tooltipDiamension.height;
                }
                if (placement.indexOf("bottom") > -1) {
                    mouseY = calculatedY = event.y;
                }
                if (placement.indexOf("right") > -1) {
                    mouseX = calculatedX = event.x + 10;
                }
            } else if (!placement || (placement && placement.indexOf("auto") > -1)) {
                if (mouseX + tooltipDiamension.width > this.activeDimension().width) {
                    calculatedX = mouseX - tooltipDiamension.width - 15;
                }
                if (mouseY + tooltipDiamension.width > this.activeDimension()) {
                    calculatedY = mouseY - tooltipDiamension.height;
                }
            }
            tooltipContainer
                .style("left", calculatedX + "px")
                .style("top", calculatedY + "px");
        }

        drawLegendContainer() {
            const containerElement = this.container();

            let legendContainerElement = containerElement.select("svg").append("g")
                .attr("class", "uxp-legend-wrapper")
                .attr("transform", "translate(" + (this.activeDimension().width) + ", 10)");

            return legendContainerElement;
        }

        drawZoomButtonsContainer(callbackToEmitButtonEvent) {
            const containerElement = this.container();

            let zoomButtomContainerElement = containerElement.append("div")
                .attr("class", "uxp-zoom-buttons-wrapper")
                .style("position", "absolute")
                .style("top", "15px")
                .style("left", this.settings().dimension.margin.left);

            const button = zoomButtomContainerElement.selectAll('g')
            .data(this.settings().brush.zoomButtonDetails)
            .enter();

            // for the append the zoom icons
            button.append('button')
            .style("margin-right", '10px')
            .style("width", '90px')
            .style('font-size', '14px')
            .attr('title', d => {
                return d.title;
            })
            .text(d => {
                return d.title;
            }).on("click", (d, index) => {
                callbackToEmitButtonEvent(index.type);
            });
        }

        drawLegend(legendContainerElement, legendData, callbackToGetDisplayText) {
            const settings = this.settings(),
                legendSettings = settings.legend;

            let textDimensions = [];
            const textMargin = 10;

            let legendDataJoin = legendContainerElement.selectAll(".uxp-legend-group")
                .remove()
                .exit()
                .data(utility.deepCopyObject(legendData));

            let legend = legendDataJoin.enter()
                .append("g")
                .attr("class", "uxp-legend-group")
                .style('cursor', 'pointer');

            legend.append("title").html(callbackToGetDisplayText);

            legend.append("text")
                .attr("class", "uxp-legend-label")
                .attr("y", 10)
                .text(callbackToGetDisplayText)
                .each(function () {
                    textDimensions.push({ "textLength": this.getComputedTextLength() });
                })
                .attr("x", (d, i) => {
                    textDimensions[i].xPos = textDimensions[i].xPos ? textDimensions[i].xPos : legendSettings.rectWidth;
                    for (let x = 1; x <= i; x++) {
                        textDimensions[i].xPos += textDimensions[x - 1].textLength + (legendSettings.rectWidth) + textMargin;
                    }
                    return textDimensions[i].xPos;
                })
                .style("text-anchor", "start")
                .style("fill", "#000");

            legend.append("rect")
                .attr("x", (d, i) => {
                    return textDimensions[i].xPos - legendSettings.rectWidth - (textMargin / 5);
                })
                .attr('height', legendSettings.rectHeight)
                .attr('width', legendSettings.rectWidth)
                .style("fill", (d, i) => { return (d.color) ? d.color : assistant.getDefaultColor(i); });

            return legend;
        }

        clickLegend(legendContainerElement, callbackToUpdateLineOnLegend) {
            legendContainerElement.on("click", (d) => {
              let key = d.target.__data__.key;
              callbackToUpdateLineOnLegend(key);
            })
        }
        
        positionLegend(legendContainerElement) {
            const settings = this.settings(),
                legendSettings = settings.legend,
                leftMargin = legendSettings.margin.left,
                topMargin = (settings.brush && settings.brush.isZoomable === true) ? (legendSettings.margin.top + 25) : legendSettings.margin.top,
                rightMargin = legendSettings.margin.right;

            let activeDimension = this.activeDimension();
            if (legendSettings.placement === 'left') {
                legendContainerElement.attr("transform", "translate(" + leftMargin + ", " + topMargin + ")");
            } else if (legendSettings.placement === 'center') {
                const xTranslate = (activeDimension.width / 2) - (legendContainerElement.node().getBBox().width / 2) + leftMargin;
                legendContainerElement.attr("transform", "translate(" + xTranslate + ", " + topMargin + ")");
            } else if (legendSettings.placement === 'right') {
                const xTranslate = activeDimension.width - legendContainerElement.node().getBBox().width - rightMargin;
                legendContainerElement.attr("transform", "translate(" + xTranslate + ", " + topMargin + ")");
            }
        }

        getTransitionFunction(element) {
            return element
                .transition()
                .ease(d3['ease' + utility.capitalizeFirstLetter(this.settings.animation.type)])
                .duration((!this.settings.animation.isApplied || this.resizeHappening) ? 0 : this.settings.animation.duration);
        }

        applyResizeEventHandler(isResponsive, resizeChart) {
            if (isResponsive) {
                window.addEventListener('resize', resizeChart);
            } else if (!isResponsive) {
                window.removeEventListener('resize', resizeChart, true);
            }
        }

        resizeChart() {
            const self = this;
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(() => { self.resize(); });
            } else {
                setTimeout(() => { self.resize(); }, 66);
            }
        }
    }
    const assistant = new Assistant();
    return assistant;
}));