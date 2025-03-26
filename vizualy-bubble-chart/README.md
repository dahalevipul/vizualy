# Bubble Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Bubble Chart**.

```bash
npm install @impetusuxp/vizualy-bubble-chart
```

### Sample Data (Chart's required data format)

    const data = [{
        labelName: "China",
        x: 10,
        y: 33.828,
        radius: 20
    }, {
        labelName: "Canada",
        x: 40,
        y: 56.34,
        radius: 28
    }, {
        labelName: "India",
        x: 60,
        y: 72.423,
        radius: 25
    }, {
        labelName: "Belgium",
        x: 50,
        y: 67.78,
        radius: 28,
    }, {
        labelName: "Brazil",
        x: 20,
        y: 64.23,
        radius: 26,
    }, {
        labelName: "Argentina",
        x: 90,
        y: 40,
        radius: 24,
    }, {
        labelName: "France",
        x: 44,
        y: 30,
        radius: 30,
    }];

## Usage

1. 
```
import BubbleChart from '@impetusuxp/vizualy-bubble-chart';

const bubbleChart = new BubbleChart();

// Draw chart
bubbleChart
      .container('containerID')
      .x('x axis key in data') // Referred as "x" key in sample Data
      .y('y axis key in data') // Referred as "y" key in sample Data
      .r('r key in data') // Referred as "radius" key in sample Data
      .labelName('label key in data') // Referred as "labelName" key in sample Data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
bubbleChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-bubble-chart/vizualy-bubble-chart.js"></script>
<script>
const bubblechart = new vizualy.BubbleChart();

// Draw chart
bubbleChart
      .container('containerID')
      .x('x axis key in data') // Referred as "PerCapita" key in sample Data
      .y('y axis key in data') // Referred as "Value" key in sample Data
      .r('r key in data') // Referred as "lifeExp" key in sample Data
      .labelName('label key in data') // Referred as "labelName" key in sample Data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
bubbleChart.data(updated data object).update();
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
bubbleLabel: {
    isVisible: true,
    labelFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide bubble label.
labelFormat | Function | Default label | To customize labels inside bubble.

7)
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
content| Function | Bubble chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

8)
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

9)
```
xWordWrap: {
    isVisible: false,
    linesToAddEllipses: 1
},
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text

10)
```
bubbleSpace : {
    type: 'perc',
    value: 0.1 
},
```
Key | Type | Default | Description
----|-------- | -------|------
type| String | 'perc' | Set bubble space type to keep the bubble separated at certain space
value | Number | 0 | Set bubble space value

11)
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
isVisible| Boolean | True | To keep the legend in active/hidden state.
limit| number | 30 | To set the limit of brush.
offset| number | 0 | Add offset on brush.
height| number | 80 | Height of brush.
margin| number | 60 | Margin around the brush.

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
type | String | time | Set the Y scale type such as linear etc

14)
```
yAxisTicksCount : {
    value: 3,
    isApplied: false
},
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
value | Number | No limit | Set Y-Axis tick count and axis will be restricted to plot only given ticks count

15)
```
rotateXAxisTick: false,
```
Key | Type | Default | Description
----|-------- | -------|------
rotateXAxisTick | Boolean | false | To rotate the xAxis tick labels when sufficient space is not available for display.

16)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

17)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

18)
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
bubblechart.getElement("bubble").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(bubble).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)