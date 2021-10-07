import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { ITableRef } from 'types/components/Table/Table';
import {
  GroupNameType,
  IMetricAppConfig,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IFocusedState,
  IMetricAppModelState,
  IAggregationConfig,
  IAggregatedData,
  IAlignmentConfig,
  IChartTooltip,
  IChartTitleData,
  IGroupingSelectOption,
  IChartZoom,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/components/TableColumns/TableColumns';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ILine } from 'types/components/LineChart/LineChart';
import { RowHeightSize } from 'config/table/tableConfigs';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { IModel } from 'types/services/models/model';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  tableRef: React.RefObject<ITableRef>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  lineChartData: ILine[][];
  panelResizing: boolean;
  chartTitleData: IChartTitleData;
  tableData: IMetricTableRowData[];
  aggregatedData: IAggregatedData[];
  tableColumns: ITableColumn[];
  ignoreOutliers: boolean;
  zoom: IChartZoom;
  curveInterpolation: CurveEnum;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  focusedState: IFocusedState;
  highlightMode: HighlightEnum;
  groupingData: IMetricAppConfig['grouping'];
  notifyData: IMetricAppModelState['notifyData'];
  tooltip: IChartTooltip;
  aggregationConfig: IAggregationConfig;
  alignmentConfig: IAlignmentConfig;
  selectedMetricsData: IMetricAppConfig['select'];
  tableRowHeight: RowHeightSize;
  sortFields: [string, 'asc' | 'desc' | boolean][];
  hiddenMetrics: string[];
  hiddenColumns: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  requestIsPending: boolean;
  resizeMode: ResizeModeEnum;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onZoomChange: (zoom: Partial<IChartZoom>) => void;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
  onHighlightModeChange: (mode: HighlightEnum) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onTableRowHover: (rowKey: string) => void;
  onTableRowClick: (rowKey?: string) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
  onGroupingSelectChange: (params: IOnGroupingSelectChangeParams) => void;
  onGroupingModeChange: (params: IOnGroupingModeChangeParams) => void;
  onGroupingPaletteChange: (index: number) => void;
  onGroupingReset: (groupName: GroupNameType) => void;
  onGroupingApplyChange: (groupName: GroupNameType) => void;
  onGroupingPersistenceChange: (groupName: 'color' | 'stroke') => void;
  onBookmarkCreate: (params: IBookmarkFormState) => void;
  onBookmarkUpdate: (id: string) => void;
  onNotificationAdd: (notification: INotification) => void;
  onNotificationDelete: (id: number) => void;
  onResetConfigData: () => void;
  onAlignmentMetricChange: (metric: string) => void;
  onAlignmentTypeChange: (type: XAlignmentEnum) => void;
  onMetricsSelectChange: IMetricAppConfig['onMetricsSelectChange'];
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onExportTableData: (e: React.ChangeEvent<any>) => void;
  onRowHeightChange: (height: RowHeightSize) => void;
  onSortReset: () => void;
  onSortChange?: (field: string, value?: 'asc' | 'desc' | 'none') => void;
  onMetricVisibilityChange: (metricKeys: string[]) => void;
  onColumnsOrderChange: (order: any) => void;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  onTableDiffShow: () => void;
  onTableResizeModeChange: (mode: ResizeModeEnum) => void;
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  columnsWidths: { [key: string]: number };
}

export interface IOnSmoothingChange {
  smoothingAlgorithm?: SmoothingAlgorithmEnum;
  smoothingFactor?: number;
  curveInterpolation?: CurveEnum;
}
