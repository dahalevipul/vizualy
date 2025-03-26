# Horizontal Stacked Bar Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Horizontal Stacked Bar Chart**.

```bash
npm install @impetusuxp/vizualy-horizontal-stacked-bar-chart
```

### Sample Data (Chart's required data format)

    const data = [
            {
                "company": "Company A",
                "product": "Product A",
                "sell": 34
            },
            {
                "company": "Company A",
                "product": "Product B",
                "sell": 31
            },
            {
                "company": "Company A",
                "product": "Product C",
                "sell": 64,
            },
            {
                "company": "Company B",
                "product": "Product A",
                "sell": 34
            },
            {
                "company": "Company C",
                "product": "Product A",
                "sell": 56
            },
            {
                "company": "Company C",
                "product": "Product B",
                "sell": 22
            },
            {
                "company": "Company C",
                "product": "Product C",
                "sell": 18
            },
            {
                "company": "Company B",
                "product": "Product B",
                "sell": 16
            },
            {
                "company": "Company B",
                "product": "Product C",
                "sell": 18
            },
            {
                "company": "Company D",
                "product": "Product A",
                "sell": 34
            },
            {
                "company": "Company D",
                "product": "Product B",
                "sell": 31
            },
            {
                "company": "Company D",
                "product": "Product C",
                "sell": 64
            }
        ];

## Usage

1. 
```
import HorizontalStackedBarChart from '@impetusuxp/vizualy-horizontal-stacked-bar-chart';

const horizontalStackedBarChart = new HorizontalStackedBarChart();

// Draw chart
horizontalStackedBarChart
      .container('containerID')
      .x('x axis key in data') // Referred as "sell" in sample data
      .y('y axis key in data') // Referred as "company" in sample data
      .stack('stack key in data') // Referred as "product" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
horizontalStackedBarChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-horizontal-stacked-bar-chart/vizualy-horizontal-stacked-bar-chart.js"></script>
<script>
const horizontalStackedBarChart = new vizualy.HorizontalStackedBarChart();

// Draw chart
horizontalStackedBarChart
      .container('containerID')
      .x('x axis key in data') // Referred as "sell" in sample data
      .y('y axis key in data') // Referred as "company" in sample data
      .stack('stack key in data') // Referred as "product" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
horizontalStackedBarChart.data(updated data object).update();
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
isVisible| Boolean | True | To show/hide X axis label.
margin| Number | 40 | To provide top margin from X axis line.
value| String(any) | 'X-axis' | To provide custom X axis label.

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
isVisible| Boolean | True | To show/hide Y axis label.
margin| Number | 50 | To provide right margin from Y axis line.
value| String(any) | 'Y-axis' | To provide custom Y axis label.

6)
```
stackedBarLabel: {
    isVisible: true,
    labelFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide bar label.
labelFormat | Function | Default label | To customize labels inside bar.

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
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To keep the legend in active/hidden state.
limit | Number | 30 | To set limit to the brush.
offset| Number | 0 | Add offset to brush.
height| Number | 80 | To provide height of brush.
margin| Number | 60 | To provide margin around brush.

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
content| Function | horizontal Stacked Bar chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

10)
```
yWordWrap: {
    isVisible: false,
    linesToAddEllipses: 1
},
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text

11)
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

12)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

13)
```
xScaleType: {
        type: "linear"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the X scale type such as band, linear etc.

12)
```
yScaleType: {
        type: "band"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the Y scale type such as band, linear etc.

13)
```
xAxisTicksCount: {
    value: 5, 
    isApplied: false
},
```
Key | Type | Default | Description
----|-------- | -------|------
value| Number | True | Set X-Axis tick count and axis will be restricted to plot only given ticks count.
isApplied| Boolean | false | To show/hide line label.

14)
```
rotateYAxisTick: {
    isVisible: false,
    value: [-45, -20, -40]
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | False | To show/hide Y Axis tick.
value | Array | [-45, -20, -40] | To rotate Y-Axis ticks, Values represent as [relative Y position of ticks label, relative x position, rotation-angle].

15)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

16)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
``` 
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

17)
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
horizontalStackedBarChart.getElement("bar").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(bar).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)