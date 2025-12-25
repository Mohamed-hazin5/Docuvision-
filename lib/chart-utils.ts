/**
 * Enhanced Chart Utilities
 * Functions for chart customization and manipulation
 */

import * as echarts from 'echarts';

export interface ChartCustomization {
    title?: string;
    xLabel?: string;
    yLabel?: string;
    chartType?: string;
    color?: string;
    showLegend?: boolean;
}

/**
 * Apply customizations to ECharts option
 */
export function applyChartCustomization(
    baseOption: any,
    customization: ChartCustomization
): any {
    const option = { ...baseOption };

    // Apply title
    if (customization.title) {
        option.title = {
            text: customization.title,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#1e293b',
            },
        };
    }

    // Apply axis labels
    if (customization.xLabel && option.xAxis) {
        option.xAxis = {
            ...option.xAxis,
            name: customization.xLabel,
            nameLocation: 'middle',
            nameGap: 30,
            nameTextStyle: {
                fontSize: 12,
                fontWeight: 'bold',
                color: '#64748b',
            },
        };
    }

    if (customization.yLabel && option.yAxis) {
        option.yAxis = {
            ...option.yAxis,
            name: customization.yLabel,
            nameLocation: 'middle',
            nameGap: 50,
            nameTextStyle: {
                fontSize: 12,
                fontWeight: 'bold',
                color: '#64748b',
            },
        };
    }

    // Apply color
    if (customization.color && option.series) {
        if (Array.isArray(option.series)) {
            option.series = option.series.map((s: any) => ({
                ...s,
                itemStyle: {
                    ...s.itemStyle,
                    color: customization.color,
                },
                areaStyle: s.areaStyle ? {
                    ...s.areaStyle,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: customization.color || '#6366f1' },
                        { offset: 1, color: (customization.color || '#6366f1') + '00' },
                    ]),
                } : undefined,
            }));
        }
    }

    // Apply legend visibility
    if (customization.showLegend !== undefined) {
        option.legend = {
            ...option.legend,
            show: customization.showLegend,
        };
    }

    return option;
}

/**
 * Enable zoom and pan on chart
 */
export function enableChartZoom(option: any): any {
    return {
        ...option,
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                },
                restore: {},
                saveAsImage: {},
            },
            right: 20,
            top: 20,
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                start: 0,
                end: 100,
            },
        ],
    };
}

/**
 * Convert chart type
 */
export function convertChartType(
    option: any,
    newType: 'line' | 'bar' | 'pie'
): any {
    const newOption = { ...option };

    if (newType === 'pie') {
        // Convert to pie chart
        const data = option.series[0].data || [];
        const xData = option.xAxis?.data || [];

        newOption.series = [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: xData.map((name: string, i: number) => ({
                name,
                value: data[i],
            })),
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2,
            },
            label: {
                show: true,
                formatter: '{b}: {d}%',
            },
        }];

        delete newOption.xAxis;
        delete newOption.yAxis;
        delete newOption.grid;
    } else {
        // Convert to line or bar
        if (option.series[0].type === 'pie') {
            // Converting from pie
            const pieData = option.series[0].data || [];
            newOption.xAxis = {
                type: 'category',
                data: pieData.map((d: any) => d.name),
            };
            newOption.yAxis = {
                type: 'value',
            };
            newOption.series = [{
                type: newType,
                data: pieData.map((d: any) => d.value),
            }];
            newOption.grid = {
                left: '10%',
                right: '10%',
                bottom: '10%',
                top: '15%',
                containLabel: true,
            };
        } else {
            // Just change type
            newOption.series = option.series.map((s: any) => ({
                ...s,
                type: newType,
            }));
        }
    }

    return newOption;
}

/**
 * Get chart as image data URL
 */
export function getChartImageURL(chartInstance: any): string {
    return chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff',
    });
}

/**
 * Reset chart zoom/pan
 */
export function resetChartView(chartInstance: any): void {
    chartInstance.dispatchAction({
        type: 'dataZoom',
        start: 0,
        end: 100,
    });
}

/**
 * Zoom in on chart
 */
export function zoomInChart(chartInstance: any): void {
    const option = chartInstance.getOption();
    const dataZoom = option.dataZoom?.[0];

    if (dataZoom) {
        const range = dataZoom.end - dataZoom.start;
        const newRange = range * 0.8; // Zoom in by 20%
        const center = (dataZoom.start + dataZoom.end) / 2;

        chartInstance.dispatchAction({
            type: 'dataZoom',
            start: center - newRange / 2,
            end: center + newRange / 2,
        });
    }
}

/**
 * Zoom out on chart
 */
export function zoomOutChart(chartInstance: any): void {
    const option = chartInstance.getOption();
    const dataZoom = option.dataZoom?.[0];

    if (dataZoom) {
        const range = dataZoom.end - dataZoom.start;
        const newRange = Math.min(range * 1.2, 100); // Zoom out by 20%
        const center = (dataZoom.start + dataZoom.end) / 2;

        chartInstance.dispatchAction({
            type: 'dataZoom',
            start: Math.max(0, center - newRange / 2),
            end: Math.min(100, center + newRange / 2),
        });
    }
}

/**
 * Toggle fullscreen for chart element
 */
export function toggleChartFullscreen(element: HTMLElement): void {
    if (!document.fullscreenElement) {
        element.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}
