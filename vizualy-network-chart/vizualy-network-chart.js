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
			global.vizualy.NetworkChart = factory(global.vizualy.utility,
				global.vizualy.assistant,
				global.vizualy.Observer,
				d3);
		} else {
			console.error("Utility or assistant object is missing. Please check the order of scripts.");
		}
	}
}(this, function (utility, assistant, Observer, d3) {

	const networkChartFactory = Symbol();
	class NetworkChartFactory extends Observer {

		constructor(child) {
			super();
			this.chartObject = child;
			this.observer = new Observer();

			this.containerElementIdentifier;
			this.containerElement;
			this.data;
			this.isChartPlotted = false;
			this.width,
			this.height,
			this.colors,
			this.svg;
			this.svgGroup;
			this.shiftKey;
			this.ctrlKey;
			this.brush;
			this.zoomEvent;
			this.zoomActionBtn;
			this.panning;
			this.observer;
			this.elements = {};
			this.nodeFilter;
			this.circles;
			this.nodeFilterActionSelected;
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
						let tooltipContent = `<b>${this.settings.tooltip.tooltipDataKey ? d[this.settings.tooltip.tooltipDataKey] : d.id}</b>`;
						return tooltipContent;
					},
					tooltipDataKey: null,
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
				exceptionMessage: 'Something went wrong!! Please look into logs.',
				zoomBtnVisible: true,
				zoom: {
					scaleBy: 1,
					defaultZoomTo: 1,
					isZoomVisible: true
				},
				brush: {
					brushMode: false,
					brushing: false,
					gBrush: null,
					gBrushHolder: null
				},
				isExpandCollapseNode: false,
				showNodesInclusion: false,
				radius: (d)=> {
					// const childNodesCount = this.data.links.filter(link => link.source === d.id || link.source.id === d.id);
					// 	if (childNodesCount.length === 0) {
					// 		return 5;
					// 	} else if (childNodesCount.length > 0 && childNodesCount.length < 20) {
					// 		return 5 + childNodesCount.length;
					// 	} else {
					// 		return 25;
					// 	}
					return 10;
				}
			};
			// Define settings for the minimap
			this.minimapSettings = {
				width: 150,
				height: 150,
				padding: 10
			};

			this.minimapGroup;
			this.minimapViewport;
			this.minimapScale;
			// Viewport position in the minimap
			this.viewportX = 0;
			this.viewportY = 0;
			this.scaleFactor = 1; // To handle zooming in and out
			this.networkGroup;
			this.pack;
			this.nodes;
			this.links;
			this.nodeLayer;
			this.edgeLayer;
			this.simulation;
			this.selections = [];
			this.expandedNodes = [];
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
				.range((this.colors && this.colors.range) ? this.colors.range : ['#bfbfbf', '#838383', '#4c4c4c', '#1c1c1c'])
				.interpolate(d3.interpolateHcl);
			let diameter = Math.min(this.width, this.height);
			this.pack = d3.pack()
				.size([diameter, diameter])
				.padding(2);
		}

		renderLayers() {
			if (this.svgGroup.select('.uxp-network-group').empty()) {
				this.networkGroup = this.svgGroup
					.append("g")
					.attr("class", "uxp-network-group");
				this.networkGroup.attr("transform", "translate(" + 0 + "," + 0 + ")" + " scale(" + this.settings.zoom.defaultZoomTo + ")");
			}
			this.edgeLayer = this.networkGroup.append("g").attr("class", "edge-layer");
			this.nodeLayer = this.networkGroup.append("g").attr("class", "node-layer");

		}

		getRootNodes() {
			if (this.settings.isExpandCollapseNode) {
				// Identify root nodes (depth 0)
				const rootNodes = this.data.nodes.filter(node => {
					const isRoot = !this.data.links.some(link =>
						link.source?.id === node.id || link.source === node.id
					);
					return isRoot;
				});

				const renderedNodes = new Set();
				const renderedLinks = new Set();

				const childNodes = [];
				const linksToRender = [];
				const expandedRoot  = [];

				// filtering the root nodes which are already expanded in depth 1
				const updatedRoots = rootNodes.filter(rootNode => {
					const isRootExpanded = this.expandedNodes.includes(rootNode.id);

					if (isRootExpanded) {
						expandedRoot.push(rootNode.id);
						return false;
					}
					return true;
				});

				// Fetch immediate children of root nodes (depth 1)
				updatedRoots.forEach(rootNode => {
					const childLinks = this.data.links.filter(link => {
						if (link.target?.id) {
							return (link.target.id === rootNode.id || (!expandedRoot.includes(link.target.id) && this.expandedNodes.includes(link.target.id)));
						} else {
							return (link.target === rootNode.id || this.expandedNodes.includes(link.target));
						}
					});

					childLinks.forEach(link => {
						// Add unique links only
						const linkId = link.source?.id ? `${link.source?.id}-${link.target?.id}` : `${link.source}-${link.target}`;
						if (!renderedLinks.has(linkId)) {
							linksToRender.push(link);
							renderedLinks.add(linkId);
						}
					});

					childNodes.push(
						...childLinks.map(link => link.source?.id || link.source)
					);
				});

				// Collect all nodes (root and children at depth 1) for initial render
				const filteredNodes = this.data.nodes.filter(d => {
					const isRoot = rootNodes.includes(d);
					const isChild = childNodes.flat(1).includes(d.id);

					if (isRoot || isChild) {
						if (!renderedNodes.has(d.id)) {
							renderedNodes.add(d.id);
							return true;
						}
					}
					return false;
				});

				return {
					nodes: filteredNodes,
					links: linksToRender.flat(1),
				};
			} else {
				return {
					nodes: this.data.nodes,
					links: this.data.links,
				}
			}
		}


		drawNodes() {
			const { nodes, links } = this.getRootNodes();
			const entityNodes = this.nodeLayer.selectAll(".entity-node").data(nodes, (d) => {
				return d.id;
			});
			this.nodes = entityNodes
				.enter()
				.append("g")
				.attr("class", "entity-node graph-node")
				.attr("transform", "translate(0,0)scale(0)");

			this.circles = this.nodes
				.append("circle")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1.5)
				.attr("id", function (d) {
					return d.id;
				})
				.attr("r", this.settings.radius.bind(this))
				.style("fill", (d, i) => {
					return (d.color) ? d.color : assistant.getDefaultColor((d.group) ? d.group : i);
				});

			if (this.settings.isExpandCollapseNode) {
				this.circles.style('cursor', 'pointer')
			}

			// Images
			this.nodes
				.append("image")
				.attr("class", "filterIcon edgesNode")
				.data(nodes)
				.attr("x", (d) => {
                    return "-5";
                })
                .attr("y", (d) => {
                    return "-6";
                })
				.attr("width", 10)
				.attr("height", 10)
				.style("cursor", "pointer")
				.attr("href", (d) => {
					return d.img;
				});


			this.nodes
				.append("text")
				.attr("class", "node-badge")
				.text((d) => {
					const childNodesCount = this.data.links.filter(link => link.source === d.id || link.source.id === d.id);
					return (childNodesCount.length > 9) ? '9+' : childNodesCount.length;
				})
				.style("font-size", "9")
				.style("stroke", (d, i) => {
					const colorCode = (d.color) ? d.color : assistant.getDefaultColor((d.group) ? d.group : i);
					if (colorCode) {
						return this.invertColor(colorCode);
					}
				})
				.attr("x", function (d) {
					const parent = d3.select(this.parentElement);
                    const radius = parseInt(parent.selectAll('circle').node().getAttribute('r'));
                    return radius / 2;
				})
				.attr("y", function (d) {
					const parent = d3.select(this.parentElement);
                    const radius = parseInt(parent.selectAll('circle').node().getAttribute('r'));
                    return - (radius / 2);
				});

				this.addDragBehavior();

			// // expose element to outer world for customizations
			this.observer.exposeElement(this.elements, "circle", this.networkGroup.selectAll('circle'));

			if (!this.isChartPlotted) {
				// 	// Adding default action to element "circle-group"
				const elementInfomationObj = this.chartObject.getElement("circle");
				elementInfomationObj.on('mouseMove', [this.populateTooltipWithContent.bind(this)], true);
				elementInfomationObj.on('mouseOut', [this.hideTooltip.bind(this)], true);
				if (this.settings.isExpandCollapseNode) {
					elementInfomationObj.on('click', [(d, elem, event) => {
					event.stopPropagation();
					this.nodeClicked(d, elem, event);
				}], true);
				}
			}
		}
		selectnodes() {
			const self = this;
			// Add click event to select source and destination nodes
			self.nodes.on("click", function (event, d) {
				if (!sourceNode) {    // Select source node
					sourceNode = d.id;
					d3.select(this).attr("fill", "orange");  // Highlight the source node
					console.log("Source node selected:", sourceNode);
				} else if (!destinationNode) {    // Select destination node
					destinationNode = d.id;
					d3.select(this).attr("fill", "green");  // Highlight the destination node
					console.log("Destination node selected:", destinationNode);    // Calculate and highlight the shortest path
					const shortestPath = self.dijkstra(networkData, sourceNode, destinationNode);
					self.highlightPath(shortestPath);
				} else {    // Reset source and destination selection if both are already selected
					self.resetHighlightNodes(self,this,d);
				}
			});
		}
		resetHighlightNodes(self,_this,d) {
			self.nodes.attr("fill", "#69b3a2");  // Reset node colors
			sourceNode = d.id;
			destinationNode = null;
			d3.select(this).attr("fill", "orange");  // Highlight new source node
			console.log("Source node re-selected:", sourceNode);
			self.highlightPath([]);  // Reset highlighted path
		}
		highlightPath(path) {
			this.links.attr("class", d =>
				path.includes(d) ? "link highlight" : "link");
		}

		addDragBehavior() {
			// Add a drag behavior.
			const drag = d3.drag()
				.on("start", this.dragstarted.bind(this))
				.on("drag", this.dragged.bind(this))
				.on("end", this.dragended.bind(this));

			this.nodes.call(drag).on("click", this.nodeClicked.bind(this));
		}


		drawLinks() {
			const { links } = this.getRootNodes();
			const entityEdges = this.edgeLayer.selectAll(".entity-edges").data(links, (d) => {
				return d.target.id ? d.target.id : d.id;
			});
			const newEntityEdges = entityEdges
				.enter()
				.append("g")
				.attr("class", "graph-edges entity-edges");

			this.links = newEntityEdges.append("line")
				.data(links)
				.join("line")
				.lower()
				.attr("stroke", "#999")
				.attr("stroke-opacity", 0.6)
				.attr("stroke-width", 1)
				.classed("node", true)
				.classed("fixed", d => d.fx !== undefined);
		}

		invertColor(hex) {
			if (hex.indexOf('#') === 0) {
				hex = hex.slice(1);
			}
			// convert 3-digit hex to 6-digits.
			if (hex.length === 3) {
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}
			if (hex.length !== 6) {
				throw new Error('Invalid HEX color.');
			}
			let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
				g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
				b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
			// pad each with zeros and return
			return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b);
		}

		padZero(str, len) {
			len = len || 2;
			let zeros = new Array(len).join('0');
			return (zeros + str).slice(-len);
		}

		// This function is run at each iteration of the force algorithm, updating the nodes position.
		ticked() {
			this.links
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);
			this.nodes.each(function (d) {
				d3.select(this).attr("transform", `translate(${d.x},${d.y})`)
			});
		}

		applyForceSimulation() {
			const links = this.data.links;
			this.simulation = d3.forceSimulation(this.data.nodes)
				.force("link", d3.forceLink(links).id(d => d.id))
				.force("charge", d3.forceManyBody())
				.force("center", d3.forceCenter(this.width / 2, this.height / 2))
				.on("tick", () => {
					this.ticked();
					// this.updateMinimap(); // Update the minimap on every tick
				});
		}

		// Zoom Handling
		initZoom(event) {
			this.zoomEvent = d3.zoom()
				.filter(function (event) {
					return !event.shiftKey
				})
				.on("zoom", this.handleZoom.bind(this));
			d3.select('.network-chart-factory').call(this.zoomEvent);
		}

		handleZoom(event) {
			const transform = event.transform;
			this.scaleFactor = transform.k;
			d3.select('.uxp-network-group').attr('transform', event?.transform);
			// Update the minimap viewport size and position based on zoom
			// this.updateMinimapViewport();
		}

		performZoomAction(btnType, d) {
			this.zoomEvent = d3.zoom().on('zoom', this.handleZoom?.bind(this));
			if (btnType === 'zoomIn') {
				d3.select('.network-chart-factory')
					.transition()
					.call(this.zoomEvent.scaleBy, 2);
			} else if (btnType === 'zoomOut') {
				d3.select('.network-chart-factory')
					.transition()
					.call(this.zoomEvent.scaleBy, 0.5);
			} else if (btnType === 'reset') {
				d3.select('.network-chart-factory')
					.transition()
					.call(this.zoomEvent.scaleTo, 1);
				this.highlightPath([]);
				d3.selectAll('.selected-network-chart-nodes').attr('class', null);
			}
		}


		zoomActionBtnCreation() {
			const divAction = this.containerElement
				.append("div")
				.attr("class", "uxp-vizualy-action-btn network-action")
				.style("transform-origin", "top left")
				.style("transform", "rotate(90deg) translateX(0%) translateY(-80%)")
			if (this.settings.zoom.isZoomVisible) {
				divAction.append("button")
					.attr("class", "btn network_btn-action zoomIn zoomBtn")
					.text("+").on('click', this.performZoomAction.bind(this, 'zoomIn'));
				divAction.append("button")
					.attr("class", "btn network_btn-action zoomOut zoomBtn")
					.text("-").on('click', this.performZoomAction.bind(this, 'zoomOut'));
				divAction.append("button")
					.attr("class", "btn network_btn-action reset zoomBtn")
					.text("<>").on('click', this.performZoomAction.bind(this, 'reset'));
			}
			return [divAction];
		}

		actionNodeFilterCreation() {
			const divAction = this.containerElement
				.append("div")
				.attr("class", "uxp-vizualy-node-filter network-node-filter-action")
			if (this.settings.showNodesInclusion) {
				var select = divAction.append("select")
					.attr("id", "filterNode")
					.attr("name", "filterNode")
					.attr("class", "searchw8").on('click', this.captureDropdownEvent.bind(this))

				const option1 = select.append("option");

				option1.attr("value", "Include Node")
					.attr("selected", "")
					.text("Include Node");

				const option2 = select.append("option");

				option2.attr("value", "Exclude Node")
					.attr("selected", "")
					.text("Exclude Node");
			}
			return [divAction];
		}

		captureDropdownEvent(event) {
			console.log(event?.target?.value);
			this.nodeFilterActionSelected = event?.target?.value;
		}

		drawActionButton() {
			[this.zoomActionBtn] = this.zoomActionBtnCreation.apply(this);
		}

		drawNodeFilterDropdown() {
			[this.nodeFilter] = this.actionNodeFilterCreation.apply(this);
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
			this.svgGroup.attr("transform", null);

			// Handle keyup keydown event
			d3.select('#chartContainer').attr("tabIndex", 1)
				.style('outline', 'none')
				.on("keydown", this.keydown.bind(this))
				.on("keyup", this.keyup.bind(this))
			if (this.settings.zoom.isZoomVisible) {
				this.svgGroup.call(this.initZoom.bind(this));
			}
		}

		drawBrush() {
			this.settings.brush.gBrushHolder = this.networkGroup.append('g').attr("class", "brush");
			this.brush = d3.brush()
				.filter(function (event) {
					return event.shiftKey
				})
				.keyModifiers(false)
				.on("start", this.brushstarted.bind(this))
				.on("brush", this.brushed.bind(this))
				.on("end", this.brushended.bind(this));
		}
		brushstarted(event) {
			// keep track of whether we're actively brushing so that we
			// don't remove the brush on keyup in the middle of a selection
			this.settings.brush.brushing = true;

			this.circles.each(function (d) {
				d.previouslySelected = this.shiftKey && d.selected;
			});
		}

		brushed(event) {
			if (!event.sourceEvent) return;
			if (!event.selection) return;
			let extent = event.selection;

			this.circles.classed("selected-network-chart-nodes", function (d) {
				return d.selected = d.previouslySelected ^
					(extent[0][0] <= d.x && d.x < extent[1][0]
						&& extent[0][1] <= d.y && d.y < extent[1][1]);
			});
		}

		brushended(event) {
			if (!event.sourceEvent) return;
			if (!event.selection) return;
			if (!this.settings.brush.gBrush) return;

			this.settings.brush.gBrush.call(this.brush.move, null);

			if (!this.settings.brush.brushMode) {
				// the shift key has been release before we ended our brushing
				this.settings.brush.gBrush.remove();
				this.settings.brush.gBrush = null;
			}
			this.settings.brush.brushing = false;
		}

		keydown(event) {
			this.shiftKey = event.shiftKey;
			if (this.shiftKey) {
				if (this.settings.brush.gBrush) {
					return;
				}
				this.settings.brush.brushMode = true;
				if (!this.settings.brush.gBrush) {
					this.settings.brush.gBrush = this.settings.brush?.gBrushHolder?.append('g');
					this.settings.brush.gBrush?.call(this.brush);
				}
			}
		}

		keyup(event) {
			this.shiftKey = false;
			this.settings.brush.brushMode = false;
			if (!this.settings.brush.gBrush && !event?.key === 'Escape') {
				return;
			}
			if(event && event.key === 'Escape') {
				this.unSelectAllNodes();
			}
			if (!this.settings.brush.brushing) {
				this.settings.brush.gBrush.remove();
				this.settings.brush.gBrush = null;
			}
		}

		populateTooltipWithContent(d, elem, event) {
			if (!this.settings.tooltip.isVisible) {
				return;
			}
			assistant.populateTooltipContent.apply(this.chartObject, [d3.select(".uxp-tooltip"), d, this.settings.tooltip, event]);
			assistant.setTooltipPosition.apply(this.chartObject, [d3.select(".uxp-tooltip"), this.settings.tooltip, event]);
		}

		nodeClicked(d, elem, event) {
			if (this.settings.isExpandCollapseNode) {
				if (!this.expandedNodes.includes(elem.id)) {
					this.expandedNodes.push(elem.id)
				} else {
					this.expandedNodes = this.expandedNodes.filter(item => item !== elem.id);
				}
				this.update();

				if (d.ctrlKey) {
					elem.isSelected = !elem.isSelected;
					if (elem.isSelected) {
						if (this.selections.length < 2) {
							this.selections.push(d);
							d3.select(elem).attr("r", 10);
						}
					} else {
						const index = this.selections.findIndex(index => index.id === elem.id);
						this.selections.splice(index, 1);
						d3.select(elem).attr("r", 5);
					}
				} else {
					this.unSelectAllNodes();
				}
			} else if (this.settings.showNodesInclusion && this.nodeFilterActionSelected) {
			}

		}

		unSelectAllNodes() {
			this.selections = [];
			this.circles.each(function (d, i) {
				d3.select(this);
				d.selected = false;
				d.previouslySelected = false;
			});
			this.circles.classed("selected-network-chart-nodes", false);
		}

		// Reheat the simulation when drag starts, and fix the subject position.
		dragstarted(event, d3Elem) {
			if (!event.active) this.simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
			if (!d3Elem.selected && !event.sourceEvent.shiftKey) {
				// if this node isn't selected, then we have to unselect every other node
				this.circles.classed("selected-network-chart-nodes", function (p) {
					return p.selected = p.previouslySelected = false;
				});
			}
			d3.select(`#${event.subject.id}`).classed("selected-network-chart-nodes", function (p) { d3Elem.previouslySelected = d3Elem.selected; return d3Elem.selected = true; });

			this.circles.filter(function (d) { return d.selected; })
				.each(function (d) { //d.fixed |= 2;
					d.fx = d.x;
					d.fy = d.y;
				});
		}
		// // Update the subject (dragged node) position during drag.
		dragged(event) {
			this.circles.filter(function (d) { return d.selected });
			event.subject.fx = event.x;
			event.subject.fy = event.y;
			this.fix_nodes(event);
		}

		// Restore the target alpha so the simulation cools after dragging ends.
		// Unfix the subject position now that it’s no longer being dragged.
		dragended(event) {
			if (!event.active) this.simulation.alphaTarget(0);
			// event.subject.fx = null;
			// event.subject.fy = null;
		}

		fix_nodes(node) {
			this.nodes.each((d) => {
				if (node.subject.id !== d.id) {
					d.fx = d.x;
					d.fy = d.y;
				}
			});
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
			// Ensure all nodes start with isExpanded set to false

			assistant.emitEvent("beforeDraw", this);
			this.cleanContainer();
			this.setChartDimension();
			if (this.settings.zoomBtnVisible) {
				this.drawActionButton();
			}
			if (this.settings.showNodesInclusion) {
				this.drawNodeFilterDropdown();
			}
			this.drawGround();
			if (utility.isDataEmpty(this.data)) {
				this.displayMessageOnScreen();
				this.isChartPlotted = false;
				return this.chartObject;
			}
			this.createScale();
			this.renderLayers();
			this.drawNodes();
			this.drawLinks();
			this.drawBrush();

			this.applyForceSimulation();
			if (this.settings.tooltip.isVisible) {
				assistant.createTooltipWrapper();
			}
			assistant.applyResizeEventHandler(this.settings.isResponsive, this.chartObject.resize.bind(this.chartObject));
			assistant.emitEvent("completeDraw", this);
			this.isChartPlotted = true;
			this.selectnodes();
			// this.drawMinimap(); // Add minimap drawing here
		}
		// Dijkstra's algorithm for shortest path
		dijkstra(graph, source, target) {
			const distances = {};
			const prevNodes = {};
			const unvisited = new Set(graph.nodes.map(node => node.id));

			graph.nodes.forEach(node => {
				distances[node.id] = Infinity;
			});
			distances[source] = 0;

			while (unvisited.size > 0) {
				const currentNode = Array.from(unvisited).reduce((minNode, node) =>
					(distances[node] < distances[minNode] ? node : minNode)
				);

				// If the target is reached, break
				if (currentNode === target) break;

				// Remove the current node from the unvisited set
				unvisited.delete(currentNode);

				// Update distances for neighbors
				graph.links.forEach(link => {
					if (link.source.id === currentNode || link.target.id === currentNode) {
						const neighbor = link.source.id === currentNode ? link.target.id : link.source.id;
						if (unvisited.has(neighbor)) {
							const newDist = distances[currentNode] + link.value;
							if (newDist < distances[neighbor]) {
								distances[neighbor] = newDist;
								prevNodes[neighbor] = currentNode;
							}
						}
					}
				});
			}

			// Construct the shortest path by backtracking from the target
			let path = [];
			let currentNode = target;
			while (currentNode !== source) {
				const prevNode = prevNodes[currentNode];
				if (!prevNode) return []; // No path found
				path.unshift(graph.links.find(link =>
					(link.source.id === prevNode && link.target.id === currentNode) ||
					(link.target.id === prevNode && link.source.id === currentNode)
				));
				currentNode = prevNode;
			}

			return path;
		}

		drawMinimap() {
			// Create minimap element
			const minimapElement = d3.select("#minimap");

			// Set dimensions of minimap
			minimapElement
				.attr("width", this.minimapSettings.width)
				.attr("height", this.minimapSettings.height);

			// Create group for minimap
			this.minimapGroup = minimapElement.append("g");

			// Create the scale for minimap
			this.minimapScale = d3.scaleLinear()
				.domain([0, Math.max(this.width, this.height)])
				.range([0, this.minimapSettings.width]);

			// Draw nodes on the minimap
			this.minimapGroup.selectAll("circle")
				.data(this.data.nodes)
				.join("circle")
				.attr("cx", d => this.minimapScale(d.x))
				.attr("cy", d => this.minimapScale(d.y))
				.attr("r", 3)
				.attr("fill", "gray");

			// Create a draggable viewport rectangle on the minimap
			this.minimapViewport = minimapElement.append("rect")
				.attr("class", "minimap-viewport")
				.attr("width", this.minimapScale(this.width / this.scaleFactor))
				.attr("height", this.minimapScale(this.height / this.scaleFactor))
				.attr("x", this.viewportX)
				.attr("y", this.viewportY)
				.call(d3.drag()
					.on("drag", this.dragMinimap.bind(this))
				);
		}
		dragMinimap(event) {
			const dx = event.dx;
			const dy = event.dy;

			// Update viewport position
			this.viewportX = Math.max(0, Math.min(this.minimapSettings.width - this.minimapViewport.attr("width"), this.viewportX + dx));
			this.viewportY = Math.max(0, Math.min(this.minimapSettings.height - this.minimapViewport.attr("height"), this.viewportY + dy));

			// Move the viewport rectangle
			this.minimapViewport.attr("x", this.viewportX).attr("y", this.viewportY);

			// Calculate the new translation for the main chart group based on minimap
			const translateX = -(this.viewportX / this.minimapSettings.width) * this.width * this.scaleFactor;
			const translateY = -(this.viewportY / this.minimapSettings.height) * this.height * this.scaleFactor;

			// Apply the translation to the main chart
			this.svgGroup.attr("transform", `translate(${translateX}, ${translateY}) scale(${this.scaleFactor})`);
		}
		updateMinimapViewport() {
			// Calculate the new width and height of the minimap viewport based on the zoom scale
			const viewportWidth = this.minimapScale(this.width / this.scaleFactor);
			const viewportHeight = this.minimapScale(this.height / this.scaleFactor);

			// Update the viewport position and size
			this.minimapViewport
				.attr("width", viewportWidth)
				.attr("height", viewportHeight)
				.attr("x", this.viewportX)
				.attr("y", this.viewportY);
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
			this.networkGroup.remove();
			this.setChartDimension();
			this.updateGround();
			this.createScale();
			this.renderLayers();
			this.drawNodes();
			this.drawLinks();
			this.drawBrush();
			this.applyForceSimulation();
			if (this.settings.tooltip.isVisible) {
				assistant.createTooltipWrapper();
			}
			// this.updateMinimap();
			assistant.emitEvent("completeUpdate", this);

		}

		updateMinimap() {
			// Update nodes in the minimap
			this.minimapGroup.selectAll("circle")
				.data(this.data.nodes)
				.attr("cx", d => this.minimapScale(d.x))
				.attr("cy", d => this.minimapScale(d.y));

			// Update viewport size and position
			this.minimapViewport
				.attr("width", this.minimapScale(this.width / this.scaleFactor))
				.attr("height", this.minimapScale(this.height / this.scaleFactor))
				.attr("x", this.viewportX)
				.attr("y", this.viewportY);
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
			this.networkGroup.remove();
			this.setChartDimension();
			this.updateGround();
			this.createScale();
			this.renderLayers();
			this.drawNodes();
			this.drawLinks();
			this.drawBrush();
			this.applyForceSimulation();
			if (this.settings.tooltip.isVisible) {
				assistant.createTooltipWrapper();
			}
			// this.updateMinimap();
			assistant.emitEvent("completeResize", this);
			this.resizeHappening = false;
		}
	}
	//--------------------------Chart class exposed to outer world----START-------------------------//
	class NetworkChart {
		constructor() {
			this[networkChartFactory] = new NetworkChartFactory(this);
		}

		container(...args) {
			if (!args || !args.length) {
				return this[networkChartFactory].containerElement;
			}
			this[networkChartFactory].containerElementIdentifier = args[0];
			this[networkChartFactory].createContainerObject(this[networkChartFactory].containerElementIdentifier);
			return this;
		}

		activeDimension() {
			return {
				width: this[networkChartFactory].width,
				height: this[networkChartFactory].height,
				chartWidth: this[networkChartFactory].chartWidth,
				chartHeight: this[networkChartFactory].chartHeight
			};
		}

		data(...args) {
			if (!args || !args.length) {
				return this[networkChartFactory].data;
			}
			this[networkChartFactory].data = args[0];
			return this;
		}

		settings(...args) {
			if (!args || !args.length) {
				return utility.deepCopyObject(this[networkChartFactory].settings);
			}
			this[networkChartFactory].settings = utility.unifyObject([this[networkChartFactory].settings, args[0]]);
			return this;
		}

		// Getter method for accessing exposed element
		getElement(elementIdentifier) {
			return this[networkChartFactory].elements[elementIdentifier];
		}

		getElementList() {
			return this[networkChartFactory].elements;
		}

		on(eventId, handler) {
			this[networkChartFactory][eventId] = handler;
			return this;
		}

		draw() {
			let result = utility.handleException(this[networkChartFactory], this[networkChartFactory].draw);
			if (result && result.isExceptionOccurred) {
				this[networkChartFactory].displayMessageOnScreen(this[networkChartFactory].settings.exceptionMessage);
				this[networkChartFactory].isChartPlotted = false;
				assistant.emitEvent("error", this[networkChartFactory]);
			}
			return this;
		}

		update() {
			let result = utility.handleException(this[networkChartFactory], this[networkChartFactory].update);
			if (result && result.isExceptionOccurred) {
				this[networkChartFactory].displayMessageOnScreen(this[networkChartFactory].settings.exceptionMessage);
				this[networkChartFactory].isChartPlotted = false;
				assistant.emitEvent("error", this[networkChartFactory]);
			}
			return this;
		}

		resize() {
			let result = utility.handleException(this[networkChartFactory], this[networkChartFactory].resize);
			if (result && result.isExceptionOccurred) {
				this[networkChartFactory].displayMessageOnScreen(this[networkChartFactory].settings.exceptionMessage);
				this[networkChartFactory].isChartPlotted = false;
				assistant.emitEvent("error", this[networkChartFactory]);
			}
		}

		performZoomAction(zoomType) {
			if (zoomType !== '') {
				return this[networkChartFactory].performZoomAction(zoomType, this);
			}
		}
	}
	//--------------------------Chart class exposed to outer world----END------------------------//
	return NetworkChart;
}));