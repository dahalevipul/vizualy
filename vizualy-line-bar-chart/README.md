# Line Bar Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Line Bar Chart**.

```bash
npm install @impetusuxp/vizualy-line-bar-chart
```

### Sample Data (Chart's required data format)

    const data = [
        {
            "customer_count": 50,
            "Month": 201911,
            "checkout_count": 90,
            "abort_count": 20,
            "company": "Company A"
        },
        {
            "customer_count": 65,
            "Month": 201911,
            "checkout_count": 90,
            "abort_count": 10,
            "company": "Company B"
        },
        {
            "customer_count": 40,
            "Month": 201912,
            "checkout_count": 10,
            "abort_count": 30,
            "company": "Company A"
        },
        {
            "customer_count": 35,
            "Month": 201912,
            "checkout_count": 10,
            "abort_count": 30,
            "company": "Company B"
        },
        {
            "customer_count": 10,
            "Month": 202001,
            "checkout_count": 30,
            "abort_count": 50,
            "company": "Company A"
        },
        {
            "customer_count": 15,
            "Month": 202001,
            "checkout_count": 30,
            "abort_count": 50,
            "company": "Company B"
        },
        {
            "customer_count": 25,
            "Month": 202002,
            "checkout_count": 120,
            "abort_count": 20,
            "company": "Company A"
        },
        {
            "customer_count": 20,
            "Month": 202002,
            "checkout_count": 120,
            "abort_count": 20,
            "company": "Company B"
        },
        {
            "customer_count": 25,
            "Month": 202003,
            "checkout_count": 60,
            "abort_count": 90,
            "company": "Company A"
        },
        {
            "customer_count": 15,
            "Month": 202003,
            "checkout_count": 160,
            "abort_count": 60,
            "company": "Company B"
        },
        {
            "customer_count": 33,
            "Month": 202004,
            "checkout_count": 30,
            "abort_count": 14,
            "company": "Company A"
        },
        {
            "customer_count": 15,
            "Month": 202004,
            "checkout_count": 30,
            "abort_count": 14,
            "company": "Company B"
        },
        {
            "customer_count": 39,
            "Month": 202005,
            "checkout_count": 50,
            "abort_count": 100,
            "company": "Company A"
        },
        {
            "customer_count": 29,
            "Month": 202005,
            "abort_count": 30,
            "company": "Company B"
        },
        {
            "customer_count": 42,
            "Month": 202006,
            "checkout_count": 110,
            "abort_count": 40,
            "company": "Company A"
        },
        {
            "customer_count": 45,
            "Month": 202006,
            "checkout_count": 110,
            "abort_count": 40,
            "company": "Company B"
        }
    ];

## Usage

1.
```
import LineBarChart from '@impetusuxp/vizualy-line-bar-chart';

const LineBarChart = new LineBarChart();

const exampleYAxisConfigurationObject = {
            bar: {
                key: 'customer_count',
                value: 'Customer Count'
            },
            line: {
                isVisible: true,
                linesConfig: [
                    {
                        key: 'checkout_count',
                        value: 'Checkout Count',
                        color: "#2e7d32",
                        circleColor: "#2e7d32",
                        circleRadius: 5,
                        lineType: "curveLinear",
                        isVisible: true,
                        labelConfig: { // data type should be number for translateX, translateY
                            isVisible: true,
                            fontSize: 12,
                            labelColor: '#2e7d32',
                            textAnchor: 'middle',
                            translateX: 0, // left (-ve value) | right (+ve value)
                            translateY: -10, // up (-ve value) | down (+ve value)
                            format: function (d) {
                                return d3.format('.2s')(d);
                            }
                        }
                    },
                    {
                        key: 'abort_count',
                        value: 'Abort Count',
                        color: "#ffb300",
                        circleColor: "#ffb300",
                        circleRadius: 5,
                        lineType: "curveLinear",
                        isVisible: true,
                        labelConfig: { // data type should be number for translateX, translateY
                            isVisible: true,
                            fontSize: 12,
                            labelColor: '#ffb300',
                            textAnchor: 'middle',
                            translateX: 0, // left (-ve value) | right (+ve value)
                            translateY: -10, // up (-ve value) | down (+ve value)
                            format: function (d) {
                                return d3.format('.2s')(d);
                            }
                        }
                    }
                ]
            }
        };

// Draw chart
LineBarChart
      .container('containerID')
      .x('x axis key in data') // Referred as "Month" in sample data
      .y('y axis configuration object') // Referred exampleYAxisConfigurationObject above
      .stack('stack key in data') // Referred as "company" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
lineBarChart.data(updated data object).update();
```
   2.
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-line-bar-chart/vizualy-line-bar-chart.js"></script>
<script>
const LineBarChart = new vizualy.LineBarChart();

// Draw chart
LineBarChart
      .container('containerID')
      .x('x axis key in data') // Referred as "Month" in sample data
      .y('y axis key in data') // Provided Y Axis Configuration
      .stack('stack key in data') // Referred as "company" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
LineBarChart.data(updated data object).update();
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
y1AxisLabel: {
    value: '',
    margin: 50,
    isVisible: true
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide Y axis label.
margin| Number | 50 | To provide right margin from Y1 axis line.
value| String(any) | 'Y1-axis' | To provide custom Y1 axis label.


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
content| Function | Chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

8)
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

9)
```
isResponsive: true
```
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.


10)
```
emptyDataMessage: 'No Data Available'
```
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

11)
```
exceptionMessage: 'Something went wrong!! Please see logs.'
```
Key | Type | Default | Description
----|-------- | -------|------
exceptionMessage| String | 'Something went wrong!! Please see logs.'| To customize message to be displayed on screen when any error occurs.

12)
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

13)
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

14)
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

15)
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
isVisible| Boolean | True | To keep the legend in active/hidden state.
limit| number | 30 | To set the limit of brush.
offset| number | 0 | Add offset on brush.
height| number | 80 | Height of brush.
margin| number | 60 | Margin around the brush.

16)
```
xScaleType: {
    type: "time"
}
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | time | Set the X scale type such as time, linear etc

17)
```
yScaleType: {
    type: "linear"
}
```
Key | Type | Default | Description
----|-------- | -------|------
type | String | time | Set the Y scale type such as time, linear etc

18)
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

19)
```
barBuffer: {
    x: 0,
    y: 0,
    y1: 0
}
```
Key | Type | Default | Description
----|-------- | -------|------
x| Number | 0 | Set bar buffer for X-Axis
y | Number | 0 | Set bar buffer for Y-Axis
y1 | Number | 0 | Set bar buffer for Y1-Axis

20)
```
barSpace: { 
    type: 'perc',
    value: 0.1 
},
```
Key | Type | Default | Description
----|-------- | -------|------
type| String | 'perc' | Set bar space type to keep the bar separated at certain space
value | Number | 0 | Set bar space value

21)
```
lineStrokeWidth: 2
```
Key | Type | Default | Description
----|-------- | -------|------
lineStrokeWidth| Number | 2 | Set line stroke to make line thik/thin

22)
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

23)
```
xAxisCenter: true
```
Key | Type | Default | Description
----|-------- | -------|------
xAxisCenter | Boolean | True | Provide true/false to axis center.

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
LineBarChart.getElement("line").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(line).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)
