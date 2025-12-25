/**
 * Export Utilities for DocuVision
 * Handles chart and dashboard exports in multiple formats
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Export a single chart as PNG
 */
export async function exportChartAsPNG(
    chartElement: HTMLElement,
    filename: string = 'chart.png'
): Promise<void> {
    try {
        const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            logging: false,
        });

        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, filename);
            }
        });
    } catch (error) {
        console.error('Error exporting chart as PNG:', error);
        throw new Error('Failed to export chart as PNG');
    }
}

/**
 * Export a single chart as SVG (using ECharts native export)
 */
export function exportChartAsSVG(
    chartInstance: any,
    filename: string = 'chart.svg'
): void {
    try {
        // Get SVG string from ECharts instance
        const svgStr = chartInstance.renderToSVGString();
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        saveAs(blob, filename);
    } catch (error) {
        console.error('Error exporting chart as SVG:', error);
        throw new Error('Failed to export chart as SVG');
    }
}

/**
 * Export dashboard as PDF
 */
export async function exportDashboardAsPDF(
    dashboardElement: HTMLElement,
    filename: string = 'dashboard.pdf',
    options?: {
        title?: string;
        includeDate?: boolean;
    }
): Promise<void> {
    try {
        // Fallback to Native Browser Print
        // html2canvas crashes on modern CSS (lab/oklch) which this project uses.
        // The most robust solution is to trigger the browser's print dialog
        // which renders CSS perfectly.

        console.log('Initiating native print for PDF...');

        // Add a class to body to optional styling
        const previousTitle = document.title;
        if (filename) document.title = filename.replace('.pdf', '');

        window.print();

        // Restore title
        if (filename) document.title = previousTitle;

    } catch (error: any) {
        console.error('Error initiating print:', error);
        throw new Error('Failed to initiate print dialog');
    }
}


/**
 * Export multiple charts as ZIP bundle
 */
export async function exportChartsAsZIP(
    charts: Array<{
        element: HTMLElement;
        name: string;
    }>,
    zipFilename: string = 'charts.zip'
): Promise<void> {
    try {
        const zip = new JSZip();

        // Convert each chart to PNG and add to ZIP
        for (const chart of charts) {
            const canvas = await html2canvas(chart.element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
            });

            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                });
            });

            zip.file(`${chart.name}.png`, blob);
        }

        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, zipFilename);
    } catch (error) {
        console.error('Error exporting charts as ZIP:', error);
        throw new Error('Failed to export charts as ZIP');
    }
}

/**
 * Export AI report as PDF
 */
export function exportReportAsPDF(
    reportContent: string,
    filename: string = 'ai-report.pdf',
    options?: {
        title?: string;
        includeCharts?: boolean;
    }
): void {
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Add title
        pdf.setFontSize(20);
        pdf.text(options?.title || 'AI Analysis Report', 20, 20);

        // Add date
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

        // Add content
        pdf.setFontSize(12);
        const lines = pdf.splitTextToSize(reportContent, 170);
        pdf.text(lines, 20, 45);

        pdf.save(filename);
    } catch (error) {
        console.error('Error exporting report as PDF:', error);
        throw new Error('Failed to export report as PDF');
    }
}

/**
 * Export chart with metadata (title, labels, insights)
 */
export async function exportChartWithMetadata(
    chartElement: HTMLElement,
    metadata: {
        title: string;
        xAxisLabel?: string;
        yAxisLabel?: string;
        insight?: string;
    },
    format: 'png' | 'pdf' = 'png',
    filename?: string
): Promise<void> {
    try {
        // Create a wrapper div with metadata
        const wrapper = document.createElement('div');
        wrapper.style.padding = '20px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.fontFamily = 'Arial, sans-serif';

        // Add title
        const titleEl = document.createElement('h2');
        titleEl.textContent = metadata.title;
        titleEl.style.marginBottom = '10px';
        titleEl.style.fontSize = '24px';
        wrapper.appendChild(titleEl);

        // Add axis labels if provided
        if (metadata.xAxisLabel || metadata.yAxisLabel) {
            const labelsEl = document.createElement('p');
            labelsEl.textContent = `X: ${metadata.xAxisLabel || 'N/A'} | Y: ${metadata.yAxisLabel || 'N/A'}`;
            labelsEl.style.marginBottom = '15px';
            labelsEl.style.color = '#666';
            wrapper.appendChild(labelsEl);
        }

        // Clone and add chart
        const chartClone = chartElement.cloneNode(true) as HTMLElement;
        wrapper.appendChild(chartClone);

        // Add insight if provided
        if (metadata.insight) {
            const insightEl = document.createElement('div');
            insightEl.style.marginTop = '20px';
            insightEl.style.padding = '15px';
            insightEl.style.backgroundColor = '#f0f0f0';
            insightEl.style.borderRadius = '8px';

            const insightTitle = document.createElement('strong');
            insightTitle.textContent = 'AI Insight: ';
            insightEl.appendChild(insightTitle);

            const insightText = document.createElement('span');
            insightText.textContent = metadata.insight;
            insightEl.appendChild(insightText);

            wrapper.appendChild(insightEl);
        }

        // Temporarily add to DOM for rendering
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        document.body.appendChild(wrapper);

        if (format === 'png') {
            await exportChartAsPNG(wrapper, filename || `${metadata.title}.png`);
        } else {
            await exportDashboardAsPDF(wrapper, filename || `${metadata.title}.pdf`, {
                title: metadata.title,
                includeDate: true,
            });
        }

        // Clean up
        document.body.removeChild(wrapper);
    } catch (error) {
        console.error('Error exporting chart with metadata:', error);
        throw new Error('Failed to export chart with metadata');
    }
}

/**
 * Get download filename with timestamp
 */
export function getTimestampedFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    return `${baseName}_${timestamp}.${extension}`;
}
