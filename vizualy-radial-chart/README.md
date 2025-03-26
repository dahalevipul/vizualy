# Radial Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Radial Chart**.

```bash
npm install @impetusuxp/vizualy-radial-chart
```

### Sample Data (Chart's required data format)

    const data = [
        {
            "name": "Jan",
            "value": 40
        },
        {
            "name": "Feb",
            "value": 20
        },
        {
            "name": "Mar",
            "value": 25
        },
        {
            "name": "Apr",
            "value": 10
        },
        {
            "name": "May",
            "value": 60
        },
        {
            "name": "June",
            "value": 75
        },
        {
            "name": "July",
            "value": 30
        },
        {
            "name": "August",
            "value": 30
        }
    ];

## Usage

1. 
```
import RadialChart from '@impetusuxp/vizualy-radial-chart';

const radialChart = new RadialChart();

// Draw chart
radialChart
      .container('containerID')
      .value('value key in data') // Referred as "value" in sample data
      .label('label key in data') // Referred as "name" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
radialChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-radial-chart/vizualy-radial-chart.js"></script>
<script>
const radialchart = new vizualy.RadialChart();

// Draw chart
radialchart
      .container('containerID')
      .value('value key in data') // Referred as "value" in sample data
      .label('label key in data') // Referred as "name" in sample data
      .data(data object) // Referred to sample data
      .settings(chart configuration object)
      .draw();

// Update chart
radialchart.data(updated data object).update();
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
radialScaleType: {
    type: "linear"
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
type| String | 'linear' | To provide scale type for radial

3)
```
arcAngle: {
     baseRadial: {
        startAngle: 0,
        endAngle: 2
    }
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
baseRadial| Object | baseRadial: { startAngle: 0, endAngle: 2 } | To customize start and end angle for base radial.

4)
```
targetValue: 100
``` 
Key | Type | Default | Description
----|-------- | -------|------
targetValue| Number | Default target value for radial | To define the target value for radial.

5)
```
arcMinRadius: 200
``` 
Key | Type | Default | Description
----|-------- | -------|------
arcMinRadius| Number | Default minimum value for inner radius in radial | To adjust the inner radius in radial chart

6)
```
label: {
    isVisible: true,
    xTranslateLabel: 0,
    yTranslateLabel: -20,
    xTranslateValueLabel: 0,
    yTranslateValueLabel: 10,
    dataKey: null,
    isTargetValueVisible: false,
    textLabelFormat: (d) => d,
    textValueFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible | Boolean | True | To show/hide label.
xTranslateLabel | Number | 0 | To adjust X position of label.
yTranslateLabel | Number | -20 | To adjust Y position of label.
xTranslateValueLabel | Number | 0 | To adjust X position of value label.
yTranslateValueLabel | Number | 10 | To adjust Y position of value label.
dataKey | String | null | Property key in data as label text.
isTargetValueVisible | Boolean | false | To show/hide target value.
textLabelFormat | Function | Default label | To customize labels of radial.
textValueFormat | Function | Default value | To customize value labels of radial.

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
content| Function | Radial chart specific HTML | To provide custom tooltip content
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
radialchart.getElement("radial-bar").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(radial-bar).
>We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)