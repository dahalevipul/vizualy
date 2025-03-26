# Horizontal Bullet Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Horizontal Bullet Chart**.

```bash
npm install @impetusuxp/vizualy-horizontal-bullet-chart
```

### Sample Data (Chart's required data format)

    const data = [
        {
            "sales": 52,
            "marketing": 110,
            "hr": 250,
            "salesperson": "A salesperson"
        },
        {
            "sales": 600,
            "marketing": 1200,
            "salesperson": "B salesperson"
        },
        {
            "sales": 850,
            "marketing": 300,
            "salesperson": "C salesperson"
        },
        {
            "sales": 3052,
            "marketing": 2300,
            "salesperson": "D salesperson"
        },
        {
            "sales": 55,
            "marketing": 200,
            "salesperson": "E salesperson"
        },
        {
            "sales": 100,
            "marketing": 242,
            "salesperson": "F salesperson"
        },
        {
            "sales": 12,
            "marketing": 140,
            "salesperson": "G salesperson"
        }
    ];

## Usage

1. 
```
import HorizontalBulletChart from '@impetusuxp/vizualy-horizontal-bullet-chart';

const horizontalBulletChart = new HorizontalBulletChart();

// Draw chart
horizontalBulletChart
      .container('containerID')
      .x('x axis key in data') // Referred as "sales, hr, marketing" in sample data
      .y('y axis key in data') // Referred as "salesperson" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
horizontalBulletChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-horizontal-bullet-chart/vizualy-horizontal-bullet-chart.js"></script>
<script>
const horizontalBulletChart = new vizualy.HorizontalBulletChart();

// Draw chart
horizontalBulletChart
      .container('containerID')
      .x('x axis key in data') // Referred as "sales, hr, marketing" in sample data
      .y('y axis key in data') // Referred as "salesperson" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
horizontalBulletChart.data(updated data object).update();
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
barLabel: {
        isVisible: true,
        labelFormat: (d) => d
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To show/hide barLabel
labelFormat| Function | Default ticks | To customize ticks labels available via arguement(d).

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
placement| String(right, left, bottom, top) | 'right' | To give position to legend
margin| Object | { top: 10, right: 10, bottom: 10, left: 10 } | To give margin around Legend
rectWidth| Number | 10 | Width of legend rectangle.
rectHeight| Number | 10 | Height of legend rectangle.
textkey| Object | null | Property key in data as legend text.
textFormat| Function | Default ticks | To customize legend text available via argument(d).

12)
```
showLabel: {
        isVisible: false,
        key: "",
        format: (d) => {}
}
```
Key | Type | Default | Description
----|-------- | -------|------
isVisible | Boolean | False | To show/hide showLabel.
key | String | '' | To provide key to showLabel.
format | Function | |To customize labels available via argument(d).

13)
```
xScaleType: {
        type: "time"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the X scale type such as band, linear etc.

14)
```
yScaleType: {
        type: "linear"
    }
```
Key | Type | Default | Description
----|-------- | -------|------
type| Boolean | True | Set the Y scale type such as linear etc.

15)
```
xAxisTicksCount: {
    isApplied: false,
    value: ''
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isApplied| Boolean | False | To activate/deactivate Axis tick Count.
value | Number | 0 | Set x axis tick count

16)
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

17)
```
yWordWrap: {
    isVisible: false,
    linesToAddEllipses: 1
},
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | false | To show/hide line label.
linesToAddEllipses | Number | 1 | To apply ellipses (...) and wrap the text.

18)
```
rotateYAxisTick: {
    isVisible: false,
    value: [-10, 10, 10]
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | False | To show/hide Y Axis tick.
value | Array | [-10, 10, 10] | To rotate Y-Axis ticks, Values represent as [relative Y position of ticks label, relative x position, rotation-angle].

19)
```
rotateXAxisTick: {
    isVisible: false,
    value: [-10, 10, 10]
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | False | To show/hide X Axis tick.
value | Array | [-10, 10, 10] | To rotate X-Axis ticks, Values represent as [relative X position of ticks label, relative y position, rotation-angle].

20)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.

21)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

22)
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
horizontalBulletChart.getElement("bar").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(bar).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver, click**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)