# Area Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Area Chart**.

```bash
npm install @impetusuxp/vizualy-area-chart
```

### Sample Data (Chart's required data format)

    const data = [
        { key: 'area-1', "date": new Date("2017-04-23 00:00:00"), "count": 10.78 },
        { key: 'area-1', "date": new Date("2017-04-24 00:00:00"), "count": 56.54 },
        { key: 'area-1', "date": new Date("2017-04-25 00:00:00"), "count": 23.85 },
        { key: 'area-1', "date": new Date("2017-04-26 00:00:00"), "count": 80 },
        { key: 'area-1', "date": new Date("2017-04-23 00:00:00"), "count": -15.78 },
        { key: 'area-1', "date": new Date("2017-04-24 00:00:00"), "count": 40.54 },
        { key: 'area-1', "date": new Date("2017-04-25 00:00:00"), "count": -23.85 },
        { key: 'area-1', "date": new Date("2017-04-26 00:00:00"), "count": 60 }
    ];

## Usage

1.
```
import AreaChart from '@impetusuxp/vizualy-area-chart';

const areaChart = new AreaChart();

// Draw chart
areaChart
      .container('containerID')
      .x('x axis key in data') // Referred as "date" key in sample Data
      .y('y axis key in data') // Referred as "count" key in sample Data
      .area(key) // Referred as "key" key in sample Data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
areachart.data(updated data object).update();
```
   2.
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-area-chart/vizualy-area-chart.js"></script>
<script>
const areachart = new vizualy.AreaChart();

// Draw chart
areaChart
      .container('containerID')
      .x('x axis key in data') // Referred as "date" key in sample Data
      .y('y axis key in data') // Referred as "count" key in sample Data
      .area(key) // Referred as "key" key in sample Data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
areaChart.data(updated data object).update();
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
rotateXAxisTick: {
    value: [0, 0, 0],
    isVisible: false
}
```
Key | Type | Default | Description
----|-------- | -------|------
value| Array | [0, 0, 0] | [relative X position of ticks label, relative y position, rotation-angle]
isVisible| Boolean | False | To show/hide rotateXAxisTick

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
content| Function | Area chart specific HTML | To provide custom tooltip content
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
xScaleType: {
        type: "time"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the X scale type such as band, linear etc.

10)
```
yScaleType: {
        type: "linear"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the Y scale type such as linear etc.

11)
```
yAxisTicksCount: {
    value: 3, 
    isApplied: false
},
```
Key | Type | Default | Description
----|-------- | -------|------
value| Number | True | Set Y-Axis tick count and axis will be restricted to plot only given ticks count.
isApplied| Boolean | false | To show/hide line label.

12)
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

13)
```
xWordWrap: {
        isVisible: false,
        linesToAddEllipses: 1
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text.

14)
```
isResponsive: true
```
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

15)
```
colors: []
```
Key | Type | Default | Description
----|-------- | -------|------
colors| Object | [] | To provide color property.

16)
```
emptyDataMessage: 'No Data Available'
```
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

17)
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
areachart.getElement("area").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(area).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)
