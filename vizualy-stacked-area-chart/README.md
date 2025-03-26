# Stacked Area Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Stacked Area Chart**.

```bash
npm install @impetusuxp/vizualy-stacked-area-chart
```

### Sample Data (Chart's required data format)

    const data = [
        { key: 'area-1', category:'population', "date": new Date("2017-04-23 00:00:00"), "country": 10000},
        { key: 'area-1', category:'population', "date": new Date("2017-04-24 00:00:00"), "country": 12000 },
        { key: 'area-1', category:'population', "date": new Date("2017-04-25 00:00:00"), "country": 19000},
        { key: 'area-1', category:'population', "date": new Date("2017-04-26 00:00:00"), "country": 13000 },
        { key: 'area-1', category:'population', "date": new Date("2017-04-27 00:00:00"), "country": 24000 },
        { key: 'area-1', category:'population', "date": new Date("2017-04-28 00:00:00"), "country": 38000 }
    ];

## Usage

1.
```
import StackedAreaChart from '@impetusuxp/vizualy-stacked-area-chart';

const stackedareachart = new StackedAreaChart();

// Draw chart
stackedareachart
      .container('containerID')
      .x('x axis key in data') // Referred as "date" in sample data
      .y('y axis key in data') // Referred as "country" in sample data
      .area(key) // Referred as "key" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
stackedAreachart.data(updated data object).update();
```
   2.
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-stacked-area-chart/vizualy-stacked-area-chart.js"></script>
<script>
const stackedAreachart = new vizualy.StackedAreaChart();

// Draw chart
stackedAreachart
      .container('containerID')
      .x('x axis key in data')
      .y('y axis key in data')
      .area(key)
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
stackedAreachart.data(updated data object).update();
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
barLabel: {
    isVisible: true,
    labelFormat: (d) => d
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide barLabel
labelFormat| Function | Default ticks | To customize ticks labels available via arguement(d).

8)
```
tooltip: {
    isVisible: false,
    content: (d, chartObject) => "Some html",
    placement: "top-right"
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the tooltip in active/hidden state
content| Function | Area chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

9)
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

10)
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
placement| String(right, left, bottom, top) | 'right' | To give position to legend
margin| Object | { top: 10, right: 10, bottom: 10, left: 10 } | To give margin around Legend
rectWidth| Number | 10 | Width of legend rectangle.
rectHeight| Number | 10 | Height of legend rectangle.
textkey| Object | null | Property key in data as legend text.
textFormat| Function | Default ticks | To customize legend text available via argument(d).

11)
```
xScaleType: {
        type: "time"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the X scale type such as band, linear etc.

12)
```
yScaleType: {
        type: "linear"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the Y scale type such as linear etc.

13)
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

14)
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

15)
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

16)
```
isResponsive: true
```
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

17)
```
colors: []
```
Key | Type | Default | Description
----|-------- | -------|------
colors| Object | [] | To provide color property.

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
areachart.getElement("area").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(area).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)
