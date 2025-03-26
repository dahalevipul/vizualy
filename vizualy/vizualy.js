(function (global, factory) {
    if (typeof exports === "object" && typeof module !== 'undefined') {
        module.exports = factory(require('@impetusuxp/vizualy-assistant/src/js/utility'),
            require('@impetusuxp/vizualy-bar-chart'),
            require('@impetusuxp/vizualy-pie-chart'),
            require('@impetusuxp/vizualy-bubble-chart'),
            require('@impetusuxp/vizualy-sunburst-chart'),
            require('@impetusuxp/vizualy-vertical-grouped-bar-chart'),
            require('@impetusuxp/vizualy-line-chart'),
            require('@impetusuxp/vizualy-area-chart'),
            require('@impetusuxp/vizualy-line-bar-chart'),
            require('@impetusuxp/vizualy-network-chart'),
            require('@impetusuxp/vizualy-radial-chart'),
            require('@impetusuxp/vizualy-vertical-stacked-bar-chart'),
            require('@impetusuxp/vizualy-horizontal-stacked-bar-chart'),
            require('@impetusuxp/vizualy-horizontal-grouped-bar-chart'),
            require('@impetusuxp/vizualy-horizontal-bullet-chart'),
            require('@impetusuxp/vizualy-circle-packing-chart'));
    } else if (typeof define === "function" && define.amd) {
        define(['./vizualy-assistant/src/js/utility',
            './vizualy-bar-chart/vizualy-bar-chart',
            './vizualy-pie-chart/vizualy-pie-chart',
            './vizualy-bubble-chart/vizualy-bubble-chart',
            './vizualy-sunburst-chart/vizualy-sunburst-chart',
            './vizualy-vertical-grouped-bar-chart/vizualy-vertical-grouped-bar-chart',
            './vizualy-line-chart/vizualy-line-chart',
            './vizualy-area-chart/vizualy-area-chart',
            './vizualy-line-bar-chart/vizualy-line-bar-chart',
            './vizualy-network-chart/vizualy-network-chart',
            './vizualy-radial-chart/vizualy-radial-chart',
            './vizualy-vertical-stacked-bar-chart/vizualy-vertical-stacked-bar-chart',
            './vizualy-horizontal-stacked-bar-chart/vizualy-horizontal-stacked-bar-chart',
            './vizualy-horizontal-grouped-bar-chart/vizualy-horizontal-grouped-bar-chart',
            './vizualy-horizontal-bullet-chart/vizualy-horizontal-bullet-chart',
            './vizualy-circle-packing-chart/vizualy-circle-packing-chart'
        ], factory);
    } else {
        if (global.vizualy) {
            global.vizualy.lib = factory(global.vizualy.utility, global.vizualy.BarChart, global.vizualy.PieChart, global.vizualy.BubbleChart, global.vizualy.SunburstChart, global.vizualy.VerticalGroupedBarChart, global.vizualy.LineChart, global.vizualy.AreaChart, global.vizualy.LineBarChart, global.vizualy.NetworkChart, global.vizualy.RadialChart, global.vizualy.VerticalStackedBarChart, global.vizualy.HorizontalStackedBarChart, global.vizualy.HorizontalGroupedBarChart,  global.vizualy.HorizontalBulletChart, global.vizualy.CirclePackingChart);
        } else {
            console.error("Chart's object are missing. Please check the order of scripts.");
        }
    }
}(this, function (utility, BarChart, PieChart, BubbleChart, SunburstChart, VerticalGroupedBarChart, LineChart, AreaChart, LineBarChart, NetworkChart, RadialChart, VerticalStackedBarChart, HorizontalStackedBarChart, HorizontalGroupedBarChart, HorizontalBulletChart, CirclePackingChart) {
    const charts = { 'BarChart': BarChart, 'PieChart': PieChart, 'BubbleChart': BubbleChart, 'SunburstChart': SunburstChart, 'VerticalGroupedBarChart': VerticalGroupedBarChart, 'LineChart': LineChart, 'AreaChart': AreaChart, 'LineBarChart': LineBarChart, 'NetworkChart': NetworkChart, 'RadialChart': RadialChart, 'VerticalStackedBarChart': VerticalStackedBarChart, 'HorizontalStackedBarChart': HorizontalStackedBarChart, 'HorizontalGroupedBarChart': HorizontalGroupedBarChart, 'HorizontalBulletChart': HorizontalBulletChart, 'CirclePackingChart': CirclePackingChart};
    class Vizualy {
        static getChart(chartType) {
            return charts[chartType];
        }
        static getUtility() {
            return utility;
        }
    }
    return Vizualy;
}));
