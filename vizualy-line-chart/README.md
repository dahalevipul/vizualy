# Line Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Line Chart**.

```bash
npm install @impetusuxp/vizualy-line-chart
```

### Sample Data (Chart's required data format)

    const data = [
        {"key":"Company A","color":"#A3D3E8","date":"1999-12-31T18:30:00.000Z","count":92},
        {"key":"Company B","color":"#FF9900","date":"1999-12-31T18:30:00.000Z","count":55},
        {"key":"Company C","color":"#00c476","date":"1999-12-31T18:30:00.000Z","count":94},
        {"key":"Company A","color":"#A3D3E8","date":"2000-12-31T18:30:00.000Z","count":67},
        {"key":"Company B","color":"#FF9900","date":"2000-12-31T18:30:00.000Z","count":26},
        {"key":"Company C","color":"#00c476","date":"2000-12-31T18:30:00.000Z","count":23},
        {"key":"Company A","color":"#A3D3E8","date":"2001-12-31T18:30:00.000Z","count":17},
        {"key":"Company B","color":"#FF9900","date":"2001-12-31T18:30:00.000Z","count":4},
        {"key":"Company C","color":"#00c476","date":"2001-12-31T18:30:00.000Z","count":95}
    ];

    Date should be converted into JavaScript date object

## Usage

1.
```
import LineChart from '@impetusuxp/vizualy-line-chart';

const lineChart = new LineChart();

// Draw chart
lineChart
      .container('containerID')
      .x('x axis key in data') // Referred as "date" in sample data
      .y('y axis key in data') // Referred as "count" in sample data
      .line('line key in data') // Referred as "key" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
lineChart.data(updated data object).update();
```
   2.
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-line-chart/vizualy-line-chart.js"></script>
<script>
const linechart = new vizualy.LineChart();

// Draw chart
lineChart
      .container('containerID')
      .x('x axis key in data') // Referred as "date" in sample data
      .y('y axis key in data') // Referred as "count" in sample data
      .line('line key in data') // Referred as "key" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
lineChart.data(updated data object).update();
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
tooltip: {
    isVisible: true,
    content: (d, chartObject) => "Some html",
    placement: "top-right"
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the tooltip in active/hidden state
content| Function | Line chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

7)
```
animation: {
    isApplied: true,
    duration: 750,
    type: 'cubic',
    isProgressive: true,
    enableCurve: true
}
```
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | True | To activate/deactivate animations
duration| Number(in ms) | 750 | duration of animation
type| String("elastic", "bounce", "linear", "sin", "quad", "cubic", "poly", "circle", "exp", "back") | 'cubic' | type of animation.
isProgressive | Boolean |True| Set isProgressive property of animation.
enableCurve | Boolean | True| Set true/false to enableCurve.

8)
```
isResponsive: true
```
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.


9)
```
emptyDataMessage: 'No Data Available'
```
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

10)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
```
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

11)
```
rotateXAxisTick: {
    isVisible: true,
    value: [-10, 10, 10]
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
value | Array | [-10, 10, 10] | To rotate X-Axis ticks, Values represent as [relative X position of ticks label, relative y position, rotation-angle].

12)
```
xWordWrap: {
    isVisible: true,
    linesToAddEllipses: 1
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text

13)
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

14)
```
brush: {
        isVisible: false,
        isZoomable: false,
        zoomPerenctage: 10,
        limit: 30,
        offset: 0,
        height: 80,
        margin: 60
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the legend in active/hidden state.
isZoomable| Boolean | False | Allows chart to zoom with buttons and hides brush
zoomPerenctage| Number | 10 | Set zoom percentage on single click
limit| Number | 30 | To set the limit of brush.
offset| Number | 0 | Add offset on brush.
height| Number | 80 | Height of brush.
margin| Number | 60 | Margin around the brush.

15)
```
xScaleType: {
    type: "time"
}
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | time | Set the X scale type such as time, linear etc

16)
```
yScaleType: {
    type: "linear"
}
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | time | Set the Y scale type such as time, linear etc

17)
```
yAxisTicksCount: {
    isVisible: true,
    value: 3
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide line label.
value | Number | No limit | Set Y-Axis tick count and axis will be restricted to plot only given ticks count


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
linechart.getElement("line").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(line).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)
