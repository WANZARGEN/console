import type { ManipulateType } from 'dayjs';
import dayjs from 'dayjs';
import { orderBy, sum } from 'lodash';

import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import { isDateField } from '@/common/modules/widgets/_helpers/widget-field-helper';
import type { DateFormat } from '@/common/modules/widgets/_widget-fields/date-format/type';
import type { TableDataFieldValue } from '@/common/modules/widgets/_widget-fields/table-data-field/type';
import type { DateRange, DynamicFieldData } from '@/common/modules/widgets/types/widget-data-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


export const getTimeUnit = (granularity: string): ManipulateType => {
    if (granularity === 'DAILY') return 'day';
    if (granularity === 'YEARLY') return 'year';
    return 'month';
};
export const getDateFormat = (granularity: string, isSeparatedDate?: boolean): string => {
    if (granularity === 'DAILY') return isSeparatedDate ? 'DD' : 'YYYY-MM-DD';
    if (granularity === 'YEARLY') return 'YYYY';
    return isSeparatedDate ? 'MM' : 'YYYY-MM';
};
export const getDateLabelFormat = (granularity: string): string => {
    if (granularity === 'DAILY') return 'MMM D';
    if (granularity === 'YEARLY') return 'YYYY';
    return 'MMM YYYY';
};

/**
 * @name getWidgetBasedOnDate
 * @description Get date based on granularity, end
 * @example ('MONTHLY', '2024-03') '2024-03' // ('YEARLY', '2024-03') '2024'
 */
export const getWidgetBasedOnDate = (granularity: string, end?: string): string => {
    const _dateFormat = getDateFormat(granularity);
    if (end) {
        if (granularity === 'DAILY') {
            const endDate = dayjs.utc(end);
            return endDate.endOf('month').format(_dateFormat);
        }
        return dayjs.utc(end).format(_dateFormat);
    }
    return dayjs.utc().format(_dateFormat);
};

/**
 * @name getWidgetDateFields
 * @description Get date fields based on granularity, start, end
 * @example ('MONTHLY', '2024-03', '2024-06') ['2024-03', '2024-04', '2024-05', '2024-06']
 */
export const getWidgetDateFields = (granularity: string, start?: string, end?: string, isSeparatedDate = false): string[] => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity, isSeparatedDate);

    const results: string[] = [];
    let now = dayjs.utc(start).clone();
    while (now.isSameOrBefore(dayjs.utc(end), _timeUnit)) {
        results.push(now.format(_dateFormat));
        now = now.add(1, _timeUnit);
    }
    return results;
};

/**
 * @name getWidgetDateRange
 * @description Get start, end date based on granularity, basedOnDate, subtractCount
 * @example ('MONTHLY', '2024-03', 3) ['2023-01', '2024-03']
 */
export const getWidgetDateRange = (granularity: string, basedOnDate: string, subtractCount: number): string[] => {
    const _timeUnit = getTimeUnit(granularity);
    const _dateFormat = getDateFormat(granularity);
    // get start, end with granularity and subtractCount
    const _start = dayjs.utc(basedOnDate).clone().subtract(subtractCount - 1, _timeUnit);
    const _end = dayjs.utc(basedOnDate);

    let refinedDateRange: DateRange = {
        start: _start.format(_dateFormat),
        end: _end.format(_dateFormat),
    };

    if (granularity === 'DAILY') {
        if (_end.diff(_start, _timeUnit) > 31) {
            refinedDateRange = {
                start: _end.subtract(31, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    } else if (granularity === 'MONTHLY') {
        if (_end.diff(_start, _timeUnit) > 12) {
            refinedDateRange = {
                start: _end.subtract(11, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    } else if (granularity === 'YEARLY') {
        if (_end.diff(_start, _timeUnit) > 3) {
            refinedDateRange = {
                start: _end.subtract(2, _timeUnit).format(_dateFormat),
                end: _end.format(_dateFormat),
            };
        }
    }
    return [refinedDateRange.start || '', refinedDateRange.end];
};

export const getPreviousDateRange = (granularity: string, dateRange: DateRange): DateRange => {
    if (!granularity) return dateRange;
    const format = getDateFormat(granularity);

    const start = dayjs.utc(dateRange.start, format);
    const end = dayjs.utc(dateRange.end, format);

    const unitMap = {
        DAILY: 'day',
        MONTHLY: 'month',
        YEARLY: 'year',
    } as const;
    const unit = unitMap[granularity];

    const endDiff = end.diff(start, unit);
    const duration = endDiff + 1;
    const dayCountOfPreviewDate = end.subtract(1, 'month').endOf('month').date();

    const previousStart = start.subtract(duration > dayCountOfPreviewDate ? dayCountOfPreviewDate : duration, unit);
    const previousEnd = end.subtract(duration, unit);

    return {
        start: previousStart.format(format),
        end: previousEnd.format(format),
    };
};

export const getReferenceLabel = (allReferenceTypeInfo: AllReferenceTypeInfo, field?: string, val?: string) => {
    if (!val) return '';
    if (field === 'Workspace' || field === 'workspace_id') {
        return allReferenceTypeInfo.workspace.referenceMap[val]?.label ?? val;
    }
    if (field === 'Project' || field === 'project_id') {
        return allReferenceTypeInfo.project.referenceMap[val]?.label ?? val;
    }
    if (field === 'Region' || field === 'region_code') {
        return allReferenceTypeInfo.region.referenceMap[val]?.name || val;
    }
    if (field === 'Provider' || field === 'provider') {
        return allReferenceTypeInfo.provider.referenceMap[val]?.label || val;
    }
    if (field === 'Service Account' || field === 'service_account_id') {
        return allReferenceTypeInfo.service_account.referenceMap[val]?.label || val;
    }
    return val;
};

export const getRefinedDateFormatByGranularity = (granularity: string, dateFormat: DateFormat): string => DATE_FORMAT[dateFormat][granularity];

export const getFormattedDate = (date: string, dateFormat: string): string => {
    const dateFormatsWithMMM = Object.values(DATE_FORMAT['MMM DD, YYYY']) as string[];
    if (dateFormatsWithMMM.includes(dateFormat)) return dayjs.utc(date).locale('en').format(dateFormat);
    return dayjs.utc(date).format(dateFormat);
};


export const getRefinedDynamicFieldData = (rawData: DynamicFieldData, dynamicFieldInfo: TableDataFieldValue['dynamicFieldInfo'], xAxisField: string): [any[], string[]] => {
    if (!rawData?.results?.length) return [[], []];

    const valueType = dynamicFieldInfo?.valueType;
    const valueCount = dynamicFieldInfo?.count || 0;
    const criteria = dynamicFieldInfo?.criteria as string;
    const dataField = dynamicFieldInfo?.fieldValue as string;
    const dynamicFieldValue = dynamicFieldInfo?.fixedValue || [];

    const _refinedResults: any[] = [];
    let _seriesFields: string[] = [];
    if (valueType === 'fixed') {
        let _etcExists = false;
        rawData.results.forEach((result) => {
            const _filteredData = (result[criteria] || []).filter((d) => dynamicFieldValue.includes(d[dataField]));

            // etc data
            const _etcData = (result[criteria] || []).filter((d) => !dynamicFieldValue.includes(d[dataField]));
            const _etcValueSum = sum(_etcData.map((v) => v.value || 0));
            if (_etcValueSum > 0) _etcExists = true;

            _refinedResults.push({
                ...result,
                [criteria]: [
                    ..._filteredData,
                    { [dataField]: 'etc', value: _etcValueSum },
                ],
            });
        });
        _seriesFields = [...dynamicFieldValue];
        if (_etcExists) _seriesFields.push('etc');
    } else {
        let _etcExists = false;
        const _seriesFieldsSet = new Set<string>();

        rawData.results?.forEach((result) => {
            let _refinedData: any[] = [];
            if (isDateField(dataField)) {
                _refinedData = orderBy(result[criteria], dataField, 'desc') ?? [];
            } else {
                _refinedData = orderBy(result[criteria], 'value', 'desc') ?? [];
            }
            _refinedData = _refinedData.slice(0, valueCount);
            _refinedData.forEach((v) => {
                _seriesFieldsSet.add(v[dataField]);
            });
            _seriesFields = Array.from(_seriesFieldsSet);
            if (isDateField(dataField)) _seriesFields.sort();

            // etc data
            const _etcData = (result[criteria] || []).filter((d) => !_seriesFields.includes(d[dataField]));
            const _etcValueSum = sum(_etcData.map((v) => v.value || 0));
            if (_etcValueSum > 0) _etcExists = true;

            _refinedResults.push({
                [criteria]: [
                    ..._refinedData,
                    { [dataField]: 'etc', value: _etcValueSum },
                ],
                [xAxisField]: result[xAxisField],
            });
        });


        if (!isDateField(dataField) && _etcExists) _seriesFields.push('etc');
    }

    return [_refinedResults, _seriesFields];
};
export const getRefinedHeatmapDynamicFieldData = (rawData: DynamicFieldData, dynamicFieldInfo: TableDataFieldValue['dynamicFieldInfo']): string[] => {
    if (!rawData?.results?.length) return [];

    const valueType = dynamicFieldInfo?.valueType;
    const valueCount = dynamicFieldInfo?.count || 0;
    const criteria = dynamicFieldInfo?.criteria as string;
    const dataField = dynamicFieldInfo?.fieldValue as string;
    const dynamicFieldValue = dynamicFieldInfo?.fixedValue || [];

    let _seriesFields: string[] = [];
    if (valueType === 'fixed') {
        _seriesFields = [...dynamicFieldValue];
    } else {
        const _subTotalResults: Record<string, number> = {};
        rawData.results.forEach((result) => {
            if (!Array.isArray(result[criteria])) return;
            result[criteria]?.forEach((d) => {
                if (d[dataField] in _subTotalResults) {
                    _subTotalResults[d[dataField]] += d.value;
                } else {
                    _subTotalResults[d[dataField]] = d.value;
                }
            });
        });
        _seriesFields = orderBy(Object.entries(_subTotalResults), 1, 'desc').slice(0, valueCount).map(([k]) => k);
    }
    return _seriesFields;
};
