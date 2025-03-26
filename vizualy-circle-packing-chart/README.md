# Circle Packing Chart

## Installation

Use the package manager [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install **Circle Packing Chart**.

```bash
npm install @impetusuxp/vizualy-circle-packing-chart
```

### Sample Data (Chart's required data format)

    const data = {
        "name": "Slavic Languages",
        "children": [
            {
                "name": "East Slavic",
                "color": "yellow",
                "children": [
                    {
                        "name": "Russian",
                        size: 150000000,
                        "color": "red"
                    },
                    {
                        "name": "Ukrainian",
                        size: 45000000,
                        "color": "red"
                    },
                    {
                        "name": "Belarusian",
                        size: 3200000,
                        "color": "red"
                    }
                ]
            },
            {
                "name": "West Slavic",
                "children": [
                    {
                        "name": "Polish",
                        size: 55000000,
                        "color": "green"
                    },
                    {
                        "name": "Czech",
                        size: 10600000,
                        "color": "green"
                    },
                    {
                        "name": "Slovak",
                        size: 5200000,
                        "color": "green"
                    }
                ]
            },
            {
                "name": "South Slavic",
                "children": [
                    {
                        "name": "Serbo-Croatian",
                        size: 21000000,
                        "color": "blue"
                    },
                    {
                        "name": "Bulgarian",
                        size: 9000000,
                        "color": "blue"
                    },
                    {
                        "name": "Slovene",
                        size: 2500000,
                        "color": "blue"
                    },
                    {
                        "name": "Macedonian",
                        size: 1400000,
                        "color": "blue"
                    }
                ]
            }
        ]
    };

## Usage

1. 
```
import CirclePackingChart from '@impetusuxp/vizualy-circle-packing-chart';

const circlePackingChart = new CirclePackingChart();

// Draw chart
circlePackingChart
	.container('containerID')
	.children('children key in data') // Referred as "children" in sample data
    .size('size key in data') // Referred as "size" in sample data
    .label('label key in data') // Referred as "name" in sample data
    .data(data object) // Referred to sample data
    .settings(chart configuration object)
    .draw();

// Update chart
circlePackingChart.data(updated data object).update();
```
   2.  
```
<script type="text/javascript" src="./libs/d3.v6.min.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/utility.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/assistant.js"></script>
<script type="text/javascript" src="./vizualy-assistant/src/js/observer.js"></script>
<script type="text/javascript" src="./vizualy-circle-packing-chart/vizualy-circle-packing-chart.js"></script>
<script>
const circlepackingchart = new vizualy.CirclePackingChart();

// Draw chart
circlepackingchart
    .container('containerID')
    .children('children key in data') // Referred as "children" in sample data
    .size('size key in data') // Referred as "size" in sample data
    .label('label key in data') // Referred as "name" in sample data
    .data(data object) // Referred to sample data
    .settings(chart configuration object)
    .draw();

// Update chart
circlepackingchart.data(updated data object).update();
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
label: {
    isVisible: true,
    textLabelFormat: (d) => d
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible | Boolean | True | To show/hide label.
textLabelFormat | Function| Default Label | To customize labels of radial.

3)
```
arcMinRadius: 200
```
Key | Type | Default | Description
----|-------- | -------|------
arcMinRadius| Number | Default minimum value for inner radius in radial | To adjust the inner radius in radial chart

4)
```
tooltip: {
    isVisible: true,
    content: (d) => "Some html",
    placement: "top-right"
}
``` 
Key | Type | Default | Description
----|-------- | -------|------
isVisible| Boolean | True | To keep the tooltip in active/hidden state
content| Function | Circle Packing chart specific HTML | To provide custom tooltip content
placement| String(top-right, top-left, bottom-right, bottom-left, auto) | 'top-right' | To provide static direction to tooltip wrapper.

5)
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


6)
```
isResponsive: true
``` 
Key | Type | Default | Description
----|-------- | -------|------
isResponsive| Boolean | True | To activate/deactivate responsive behavior of chart.


7)
```
emptyDataMessage: 'No Data Available'
``` 
Key | Type | Default | Description
----|-------- | -------|------
emptyDataMessage| String | 'No Data Available'| To customize message to be displayed on screen when data is empty.

8)
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
circlepackingchart.getElement("circle").on('mouseMove', [(d, element, event) => { }], removePreviousHandlers: boolean);
```
> We can attaché multiple handlers(Array of functions) on events(mouseMove) to exposed element(circle).
> We have below events to subscribe -> **mouseMove, mouseEnter, mouseOut, mouseOver**

## Contriubutor
[Impetus Technologies](https://www.impetus.com/)

## License
[MIT](https://choosealicense.com/licenses/mit/)