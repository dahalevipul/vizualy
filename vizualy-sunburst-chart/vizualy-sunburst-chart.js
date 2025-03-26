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
            global.vizualy.SunburstChart = factory(global.vizualy.utility,
                global.vizualy.assistant,
                global.vizualy.Observer,
                d3);
        } else {
            console.error("Utility or assistant object is missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, assistant, Observer, d3) {

    const sunburstChartFactory = Symbol();
    class SunburstChartFactory extends Observer {
      constructor(child) {
        super();
        this.chartObject = child;
        this.observer = new Observer();

        this.containerElementIdentifier,
          this.containerElement,
          this.legendContainerElement,
          this.x,
          this.y,
          this.data,
          (this.isChartPlotted = false),
          this.width,
          this.height,
          // this.chartWidth ?
          // this.chartHeight ?
          this.legendData = [];
          (this.isFirstTime = false),
          this.svg,
          this.svgGroup,
          this.observer,
          this.totalSize,
          this.arc,
          this.sequenceContainerElem,
          this.legend,
          (this.elements = {}),
          // Breadcrumb dimensions: width, height, spacing, width of tip/tail
          (this.b = {
            w: 75,
            h: 30,
            s: 3,
            t: 10,
          }),
          //Default chart settings
          (this.settings = {
            showSequence: false,
            sequenceContainerId: "",
            // labelFormat: (d) => d,
            donut: true,
            donutRatio: 0.5,
            // showLabel: true,
            // labelKey: "percent",
            showTooltip: true,
            label: {
              isVisible: true,
              dataKey: "percent",
              textFormat: (d) => d
            },
            legend: {
              isVisible: true,
              placement: "right",
              margin: { top: 10, right: 10, bottom: 10, left: 10 },
              rectWidth: 10,
              rectHeight: 10,
              textKey: null,
              textFormat: (d) => d,
              data: null
            },
            legendContainer: "",
            dimension: {
              width: "",
              height: "",
              margin: assistant.getDefaultMargin(),
            },
            tooltip: {
              isVisible: true,
              content: (d) => {
                return d.data[this.x] + "<br>" + d.value;
              },
              placement: "top-right",
            },
            isResponsive: true,
            emptyDataMessage: "No Data Available",
            exceptionMessage: "Something went wrong!! Please look into logs.",
          });
      }

      cleanContainer() {
        assistant.cleanContainer(this.containerElement);
        assistant.hideTooltipWrapper();
      }

      createContainerObject() {
        const clipedContainerElementIdentifier =
          this.containerElementIdentifier.replace(/\s#/g, "-");
        this.containerElement = d3.select(
          "#" + clipedContainerElementIdentifier
        );
      }

      setChartDimension() {
        [this.width, this.height, this.chartWidth, this.chartHeight] =
          assistant.setDimension.apply(this.chartObject);
      }

      callbackToGetDisplayText(d) {
        const textKey = this.settings.legend.textKey
          ? this.settings.legend.textKey
          : this.chartObject.x();
        return d[textKey];
      }


      prepareLegendData(obj) {
          obj.forEach((element) => {
                this.legendData.push(element);
                if(element.children) {
                    this.prepareLegendData(element.children);
                }
          });
      }



      drawLegend() {
        this.legendData = [];
        if (!this.settings.legend.isVisible) {

          if (
            this.legendContainerElement &&
            !this.legendContainerElement.empty()
          ) {
            this.legendContainerElement.remove();
          }
          return;
        } else {
          if (!this.legendContainerElement || !this.isChartPlotted) {
            this.legendContainerElement = assistant.drawLegendContainer.apply(
              this.chartObject
            );
          }
        }
        if(this.settings.legend.data !== null) {
            this.legendData = this.settings.legend.data;
        } else {
          this.prepareLegendData(this.data.children);
        }

        this.legend = assistant.drawLegend.apply(this.chartObject, [
          this.legendContainerElement,
          this.legendData,
          this.callbackToGetDisplayText.bind(this),
        ]);
        assistant.positionLegend.apply(this.chartObject, [
          this.legendContainerElement,
        ]);
        //expose element to outer world for customizations
        this.observer.exposeElement(this.elements, "legend", this.legend);
      }

      populateTooltipWithContent(d, elem, event) {
        if (!this.settings.tooltip.isVisible) {
          return;
        }
        assistant.populateTooltipContent.apply(this.chartObject, [
          d3.select(".uxp-tooltip"),
          d,
          this.settings.tooltip,
          event,
        ]);
        assistant.setTooltipPosition.apply(this.chartObject, [
          d3.select(".uxp-tooltip"),
          this.settings.tooltip,
          event,
        ]);
      }

      initializeBreadcrumbTrail() {
        if (this.sequenceContainerElem) {
          this.sequenceContainerElem.remove();
        }

        // Add the svg area.
        this.sequenceContainerElem = d3
          .select("#" + this.sequenceContainerId)
          .append("svg")
          .attr("class", "uxp-trail")
          .style("padding-bottom", "20px");
        // Add the label at the end, for the percentage.

        this.sequenceContainerElem
          .append("svg:text")
          .attr("class", "uxp-endlabel")
          .style("fill", "#000");
      }

      // Generate a string that describes the points of a breadcrumb polygon.
      breadcrumbPoints(d, i) {
        let points = [];
        points.push("0,0");
        points.push(this.b.w + ",0");
        points.push(this.b.w + this.b.t + "," + this.b.h / 2);
        points.push(this.b.w + "," + this.b.h);
        points.push("0," + this.b.h);
        if (i > 0) {
          // Leftmost breadcrumb; don't include 6th vertex.
          points.push(this.b.t + "," + this.b.h / 2);
        }
        return points.join(" ");
      }

      // Update the breadcrumb trail to show the current sequence and percentage.
      updateBreadcrumbs(nodeArray, percentageString) {
        // Data join; key function combines name and depth (= position in sequence).
        let g = d3
          .select(".uxp-trail")
          .selectAll("g")
          .data(nodeArray, function (d) {
            return d.data[this.x] + d.depth;
          });

        // Add breadcrumb and label for entering nodes.
        let entering = g.enter().append("svg:g");

        entering
          .append("svg:polygon")
          .attr("points", breadcrumbPoints())
          .style("fill", function (d) {
            return d.data.color;
          });

        entering
          .append("svg:text")
          .attr("x", (this.b.w + this.b.t) / 2)
          .attr("y", this.b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function (d) {
            return d.data[x];
          });

        // Set position for entering and updating nodes.
        g.attr("transform", function (d, i) {
          return "translate(" + i * (this.b.w + this.b.s) + ", 0)";
        });

        // Remove exiting nodes.
        g.exit().remove();

        // Now move and update the percentage at the end.
        d3.select(".uxp-trail")
          .select(".uxp-endlabel")
          .attr("x", (nodeArray.length + 0.5) * (this.b.w + this.b.s))
          .attr("y", this.b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(percentageString);

        // Make the breadcrumb trail visible, if it's hidden.
        d3.select(".uxp-trail").style("visibility", "");
      }

      hideTooltip() {
        if (!this.settings.tooltip.isVisible) {
          return;
        }
        d3.select(".uxp-tooltip").style("display", "none");
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
        //assistant.updateSVG.apply(this);
        this.svg
          .attr("width", this.width)
          .attr("height", this.height)
          .attr("viewBox", "0 ,0, " + this.width + ", " + this.height)
          .attr("preserveAspectRatio", "xMidYMid meet");

        this.svgGroup.attr(
          "transform",
          "translate(" +
            (this.width / 2 + this.settings.dimension.margin.left) +
            "," +
            (this.height / 2 + this.settings.dimension.margin.top) +
            ")"
        );
      }

      myArc() {
        let arc = d3
          .arc()
          .startAngle(function (d) {
            return d.x0;
          })
          .endAngle(function (d) {
            return d.x1;
          })
          .innerRadius(function (d) {
            return d.y0;
          })
          .outerRadius(function (d) {
            return d.y1;
          });

        return arc;
      }

      putColorInData(data, color) {
        if (data.children) {
          data.children.forEach((d, i) => {
            let tempColor = color ? color : assistant.getDefaultColor(i);
            d.color = d.color ? d.color : tempColor;
            this.putColorInData(d, d.color);
          });
        }
      }

      calculateRadius() {
        let radius =
          Math.min(this.width, this.height) / 2 -
          (this.settings.dimension.margin.left +
            this.settings.dimension.margin.top);
        return radius;
      }

      calculateDataRoot() {
        let root = d3.hierarchy(this.data).sum((d) => {
          return d[this.y];
        });
        console.log();
        return root;
      }

      createSunburst() {
        let radius = this.calculateRadius();
        // Data strucure
        let partition = d3.partition().size([2 * Math.PI, radius]);
        // Find data root
        let root = this.calculateDataRoot();
        // Size arcs
        root = partition(root);
        this.arc = this.myArc(root);
        let pathSelection = this.svgGroup
          .selectAll("path")
          .data(partition(root).descendants())
          .enter()
          .append("g")
          .attr("class", "node")
          .append("path")
          .attr("d", this.arc)
          .attr("display", function (d) {
            return d.depth ? null : "none";
          })
          .style("stroke", "#fff")
          .style("fill", function (d) {
            return d.data.color;
            //return (d.data.color) ? d.data.color : assistant.getDefaultColor()(i)
          });
        //Reveal element to outer world for customizations
        this.totalSize = pathSelection.datum().value;
        //expose element to outer world for customizations
        this.observer.exposeElement(
          this.elements,
          "arc",
          this.svgGroup.selectAll("path")
        );

        if (this.isFirstTime) {
          //Adding default tooltip handler to element "arc"
          var elemSummeryObj = chartObject.element("arc");
          elemSummeryObj.mouseMove([createTooltip], true);
          elemSummeryObj.mouseOut([hideTooltip], true);
        }
        if (!this.isChartPlotted) {
          //Adding default action to element "bar"
          const elementInfomationObj = this.chartObject.getElement("arc");
          elementInfomationObj.on(
            "mouseMove",
            [this.populateTooltipWithContent.bind(this)],
            true
          );
          elementInfomationObj.on(
            "mouseOut",
            [this.hideTooltip.bind(this)],
            true
          );
        }
      }

      updateSunburst() {
        let radius = this.calculateRadius();
        // Data strucure
        let partition = d3.partition().size([2 * Math.PI, radius]);
        // Find data root
        let root = this.calculateDataRoot();
        // Size arcs
        root = partition(root);
        this.arc = this.myArc(root);
        // Put it all together
        let existingPathSelection = this.svgGroup.selectAll(".node");
        let pathDataJoin = existingPathSelection.data(
          partition(root).descendants()
        );
        pathDataJoin
          .select("path")
          .attr("d", this.arc)
          .attr("display", function (d) {
            return d.depth ? null : "none";
          })
          .style("stroke", "#fff")
          .style("fill", function (d) {
            return d.data.color;
            //return (d.data.color) ? d.data.color : assistant.getDefaultColor()(i)
          });
        pathDataJoin.exit().remove();
        this.totalSize = pathDataJoin.datum().value;
      }

      displayValueLabel() {
        let self = this;
        this.svgGroup.selectAll(".node").select("text").remove();
        if (this.settings.label.isVisible) {
          this.svgGroup
            .selectAll(".node")
            .append("text")
            .attr("transform", (d) => {
              return (
                "translate(" +
                this.arc.centroid(d) +
                ") rotate(" +
                this.computeTextRotation(d) +
                ")"
              );
            })
            .attr("class", "uxp-sunburst-label")
            //.attr("dx", "-20") // radius margin
            //.attr("dy", ".5em") // rotation align
            .style("text-anchor", "middle")
            .text((d) => {      
              if (this.settings.label.dataKey === this.x) {
                return d.parent ? d.data[this.x] : "";
              } else if (this.settings.label.dataKey === this.y) {
                return d.parent ? this.settings.label.textFormat(d.value) : "";
              } else {
                return isNaN(d.data[this.settings.label.dataKey])
                  ? d.data[this.settings.label.dataKey]
                  : this.settings.label.textFormat(d.data[this.settings.label.dataKey]);
              }
            })
            .each(function (d) {
              var bb = this.getBBox(),
                center = self.arc.centroid(d);

              var topLeft = {
                x: center[0] + bb.x,
                y: center[1] + bb.y,
              };

              var topRight = {
                x: topLeft.x + bb.width,
                y: topLeft.y,
              };

              var bottomLeft = {
                x: topLeft.x,
                y: topLeft.y + bb.height,
              };

              var bottomRight = {
                x: topLeft.x + bb.width,
                y: topLeft.y + bb.height,
              };

              d.visible =
                self.pointIsInArc(topLeft, d, self.arc) &&
                self.pointIsInArc(topRight, d, self.arc) &&
                self.pointIsInArc(bottomLeft, d, self.arc) &&
                self.pointIsInArc(bottomRight, d, self.arc);
            })
            .style("display", function (d) {
              return d.visible ? null : "none";
            });
        }
      }

      pointIsInArc(pt, ptData, d3Arc) {
        // Center of the arc is assumed to be 0,0
        // (pt.x, pt.y) are assumed to be relative to the center
        var r1 = d3Arc.innerRadius()(ptData), // Note: Using the innerRadius
          r2 = d3Arc.outerRadius()(ptData),
          theta1 = d3Arc.startAngle()(ptData),
          theta2 = d3Arc.endAngle()(ptData);

        var dist = pt.x * pt.x + pt.y * pt.y,
          angle = Math.atan2(pt.x, -pt.y); // Note: different coordinate system.

        angle = angle < 0 ? angle + Math.PI * 2 : angle;

        return (
          r1 * r1 <= dist &&
          dist <= r2 * r2 &&
          theta1 <= angle &&
          angle <= theta2
        );
      }

      computeTextRotation(d) {
        var angle = ((d.x0 + d.x1) / Math.PI) * 90;
        // Avoid upside-down labels
        return angle < 120 || angle > 270 ? angle : angle + 180; // labels as rims
        //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
      }

      createSequenceContainer() {
        if (!this.settings.showSequence) {
          if (this.sequenceContainerElem) {
            this.sequenceContainerElem.remove();
            this.sequenceContainerElem = undefined;
          }
          return;
        }
        this.initializeBreadcrumbTrail();
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
        this.putColorInData(this.data);
        console.log(this.data);
        this.createSunburst();
        this.displayValueLabel();
        this.drawLegend();
        if (this.settings.tooltip.isVisible) {
          assistant.createTooltipWrapper();
        }
        if (this.showSequence) {
          this.createSequenceContainer();
        }
        assistant.applyResizeEventHandler(
          this.settings.isResponsive,
          this.chartObject.resize.bind(this.chartObject)
        );
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
        //this.updateBase();
        this.putColorInData(this.data);
        this.updateSunburst();
        this.displayValueLabel();
        this.drawLegend();
        if (this.settings.tooltip.isVisible) {
          assistant.createTooltipWrapper();
        }
        if (this.showSequence) {
          this.createSequenceContainer();
        }
        assistant.emitEvent("completeUpdate", this);
      }

      resize() {
        if (this.resizeHappening) return;
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
        //this.updateBase();
        this.putColorInData(this.data);
        this.updateSunburst();
        this.displayValueLabel();
         this.drawLegend();
        if (this.settings.tooltip.isVisible) {
          assistant.createTooltipWrapper();
        }
        assistant.emitEvent("completeResize", this);
        this.resizeHappening = false;
      }
    }
    //--------------------------Chart class exposed to outer world----START-------------------------//
    class SunburstChart {
        constructor() {
            this[sunburstChartFactory] = new SunburstChartFactory(this);
        }

        container(...args) {
            if (!args || !args.length) {
                return this[sunburstChartFactory].containerElement;
            }
            this[sunburstChartFactory].containerElementIdentifier = args[0];
            this[sunburstChartFactory].createContainerObject(this[sunburstChartFactory].containerElementIdentifier);
            return this;
        }

        x(...args) {
            if (!args || !args.length) {
                return this[sunburstChartFactory].x;
            }
            this[sunburstChartFactory].x = args[0];
            return this;
        }

        y(...args) {
            if (!args || !args.length) {
                return this[sunburstChartFactory].y;
            }
            this[sunburstChartFactory].y = args[0];
            return this;
        }

        activeDimension() {
            return {
                width: this[sunburstChartFactory].width,
                height: this[sunburstChartFactory].height,
                chartWidth: this[sunburstChartFactory].chartWidth,
                chartHeight: this[sunburstChartFactory].chartHeight};
        }

        data(...args) {
            if (!args || !args.length) {
                return this[sunburstChartFactory].data;
            }
            this[sunburstChartFactory].data = args[0];
            return this;
        }

        settings(...args) {
            if (!args || !args.length) {
                return utility.deepCopyObject(this[sunburstChartFactory].settings);
            }
            this[sunburstChartFactory].settings = utility.unifyObject([this[sunburstChartFactory].settings, args[0]]);
            return this;
        }

        // Getter method for accessing exposed element
        getElement(elementIdentifier) {
            return this[sunburstChartFactory].elements[elementIdentifier];
        }

        getElementList(){
            return this[sunburstChartFactory].elements;
        }

        on(eventId, handler) {
            this[sunburstChartFactory][eventId] = handler;
            return this;
        }

        draw() {
            //this[sunburstChartFactory].draw();
            let result = utility.handleException(this[sunburstChartFactory], this[sunburstChartFactory].draw);
            if (result && result.isExceptionOccurred) {
                this[sunburstChartFactory].displayMessageOnScreen(this[sunburstChartFactory].settings.exceptionMessage);
                this[sunburstChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[sunburstChartFactory]);
            }
            return this;
        }

        update() {
            let result = utility.handleException(this[sunburstChartFactory], this[sunburstChartFactory].update);
            if (result && result.isExceptionOccurred) {
                this[sunburstChartFactory].displayMessageOnScreen(this[sunburstChartFactory].settings.exceptionMessage);
                this[sunburstChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[sunburstChartFactory]);
            }
            return this;
        }

        resize() {
            let result = utility.handleException(this[sunburstChartFactory], this[sunburstChartFactory].resize);
            if (result && result.isExceptionOccurred) {
                this[sunburstChartFactory].displayMessageOnScreen(this[sunburstChartFactory].settings.exceptionMessage);
                this[sunburstChartFactory].isChartPlotted = false;
                assistant.emitEvent("error", this[sunburstChartFactory]);
            }
        }
    }
    //--------------------------Chart class exposed to outer world----END------------------------//
    return SunburstChart;
}));