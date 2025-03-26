# Vertical Grouped Bar Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Vertical Grouped Bar Chart**.

```bash
npm install @impetusuxp/vizualy-vertical-grouped-bar-chart
```

### Sample Data (Chart's required data format)

    const data = [
        {
            material: "Brass",
            property: "Density",
            value: 8.4
        },
        {
            material: "Brass",
            property: "Melting Point",
            value: 80
        },
        {
			material: "Iron",
			property: "Density",
			value: 40
		},
		{
			material: "Iron",
			property: "Melting Point",
			value: 80
		},
		{
			material: "Zinc",
			property: "Density",
			value: 6.6
		},
		{
			material: "Zinc",
			property: "Melting Point",
			value: 85
		}
    ];

## Usage

1. 
```
import VerticalGroupedBarChart from '@impetusuxp/vizualy-vertical-grouped-bar-chart';

const vtGroupedBarchart = new VerticalGroupedBarChart();

// Draw chart
vtGroupedBarchart
      .container('containerID')
      .x('x axis key in data') // Referred as "material" in sample data
      .y('y axis key in data') // Referred as "value" in sample data
      .column('column axis key in data') // Referred as "property" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
vtGroupedBarchart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-vertical-grouped-bar-chart/vizualy-vertical-grouped-bar-chart.js"></script>
<script>
const vtGroupedBarchart = new vizualy.VerticalGroupedBarChart();

// Draw chart
vtGroupedBarchart
      .container('containerID')
      .x('x axis key in data') // Referred as "material" in sample data
      .y('y axis key in data') // Referred as "value" in sample data
      .column('column axis key in data') // Referred as "property" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
vtGroupedBarchart.data(updated data object).update();
</script>
```
```
Make sure to use/import vizualy-assistant/src/css/common.css in your code-base as per recommended by frontend framework being used
```
## Configurations/Settings
1)
```
dimension: {
    width: 500,
    height: 500,
    margin: { top: 20, right: 20, bottom: 40, left: 40 }
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
width | Number in px | Default width of container | To provide custom width to chart.
height| Number in px | Default height of container | To provide custom height to chart.
margin| Object | { top: 20, right: 20, bottom: 40, left: 40 } | To provide margin to chart.

2)
```
xAxis: {
    isVisible: true,
    isGridsVisible: true,
    tickFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide X axis
isGridsVisible| Boolean  | True | To show/hide X axis grids
tickFormat | Function | Default ticks | To customize ticks labels available via argument(d).

3)
```
yAxis: {
    isVisible: true,
    isGridsVisible: true,
    tickFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide Y axis.
isGridsVisible| Boolean  | True | To show/hide Y axis grids.
tickFormat | Function | Default ticks | To customize ticks labels available via argument(d).

4)
```
xAxisLabel: {
    value: '',
    margin: 40,
    isVisible: true
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
value| String(any) | 'X-axis' | To provide custom X axis label.
margin| Number | 40 | To provide top margin from X axis line.
isVisible| Boolean | True | To show/hide X axis label.

5)
```
yAxisLabel: {
    value: '',
    margin: 50,
    isVisible: true
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
value| String(any) | 'Y-axis' | To provide custom Y axis label.
margin| Number | 50 | To provide right margin from Y axis line.
isVisible| Boolean | True | To show/hide Y axis label.

6)
```
barLabel: {
    isVisible: true,
    labelFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
labelFormat | Function | Default label | To customize labels on bars

7)
```
barSpace : {
    type: 'perc',
    value: 0.1 
},
```
Key | Type | Default | Description
----|-------- | -------|------
type| String | 'perc' | Set bar space type to keep the bar separated at certain space
value | Number | 0 | Set bar space value

8)
```
brush: {
    isVisible: false,
    limit: 30,
    offset: 0,
    height: 80,
    margin: 60
},
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To keep the legend in active/hidden state.
limit| number | 30 | To set the limit of brush.
offset| number | 0 | Add offset on brush.
height| number | 80 | Height of brush.
margin| number | 60 | Margin around the brush.

9)
```
tooltip: {
    isVisible: true,
    content: (d, chartObject) => "Some html",
    placement: "top-right"
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the tooltip in active/hidden state
content| Function | Chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

10)
```
animation: {
    isApplied: true,
    duration: 750,
    type: 'cubic'
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | True | To activate/deactivate animations
duration| Number(in ms) | 750 | duration of animation
type| String("elastic", "bounce", "linear", "sin", "quad", "cubic", "poly", "circle", "exp", "back") | 'cubic' | type of animation.

11)
```
legend: {
    isVisible: true,
    placement: 'right',
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    rectWidth: 10,
    rectHeight: 10,
    textKey: null,
    textFormat: (d) => d,
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the legend in active/hidden state.
placement| String("right", "center", "left") | 'right' | Placement(direction) at the top of charts.
margin| Object | { top: 10, right: 10, bottom: 10, left: 10 } | To provide margin to legends.
rectWidth| number | 10 | Width of legend rectangle.
rectHeight| number | 10 | Height of legend rectangle.
textKey| String | null | Property key in data as legend text.
textFormat | Function | Default text | To customize legend text available via argument(d).

12)
```
xScaleType: {
    type: "band"
},
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | "band" | Set the X scale type such as band, linear etc


13)
```
yScaleType: {
    type: "Linear"
},
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | "Linear" | Set the Y scale type such as linear etc

14)
```
yAxisTicksCount : {
    value: 3,
    isApplied: false
},
```
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | false | To show/hide line label.
value | Number | No limit | Set Y-Axis tick count and axis will be restricted to plot only given ticks count

15)
```
xWordWrap: {
    isVisible: false,
    linesToAddEllipses: 1
},
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text

16)
```
rotateXAxisTick: false,
```
Key | Type | Default | Description
----|-------- | -------|------
rotateXAxisTick | Boolean | false | To rotate the xAxis tick labels when sufficient space is not available for display.

17)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

18)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

19)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
``` 
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

### Chart's life cycle hooks:-
```
chartObject.on('beforeDraw', () => { // do something })
chartObject.on('completeDraw', () => { // do something })
chartObject.on('beforeUpdate', () => { // do something })
chartObject.on('completeUpdate, () => { // do something })
chartObject.on('beforeResize', () => { // do something })
chartObject.on('completeResize', () => { // do something })
``` 
Key | Type | Default | Description
----|-------- | -------|------
on| Function('eventId', handler) | No action | To perform custom actions on mentioned events.


## Event subscription

```
vtGroupedBarchart.getElement("bar").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(bar).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)