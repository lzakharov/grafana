import { css } from '@emotion/css';
import React, { useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';

import { GrafanaTheme2, PanelData, SelectableValue } from '@grafana/data';
import { CustomScrollbar, Field, FilterInput, RadioButtonGroup, useStyles2 } from '@grafana/ui';
import { LS_VISUALIZATION_SELECT_TAB_KEY, LS_WIDGET_SELECT_TAB_KEY } from 'app/core/constants';
import { VisualizationSelectPaneTab } from 'app/features/dashboard/components/PanelEditor/types';
import { VisualizationSuggestions } from 'app/features/panel/components/VizTypePicker/VisualizationSuggestions';
import { VizTypePicker } from 'app/features/panel/components/VizTypePicker/VizTypePicker';
import { VizTypeChangeDetails } from 'app/features/panel/components/VizTypePicker/types';

import { PanelModelCompatibilityWrapper } from '../utils/PanelModelCompatibilityWrapper';

import { VizPanelManager } from './VizPanelManager';

export interface Props {
  data?: PanelData;
  panelManager: VizPanelManager;
  onChange: () => void;
}

export function PanelVizTypePicker({ panelManager, data, onChange }: Props) {
  const { panel } = panelManager.useState();
  const styles = useStyles2(getStyles);
  const [searchQuery, setSearchQuery] = useState('');

  const isWidgetEnabled = false;
  const tabKey = isWidgetEnabled ? LS_WIDGET_SELECT_TAB_KEY : LS_VISUALIZATION_SELECT_TAB_KEY;
  const defaultTab = isWidgetEnabled ? VisualizationSelectPaneTab.Widgets : VisualizationSelectPaneTab.Visualizations;
  const panelModel = useMemo(() => new PanelModelCompatibilityWrapper(panel), [panel]);

  const [listMode, setListMode] = useLocalStorage(tabKey, defaultTab);

  const radioOptions: Array<SelectableValue<VisualizationSelectPaneTab>> = [
    { label: 'Visualizations', value: VisualizationSelectPaneTab.Visualizations },
    { label: 'Suggestions', value: VisualizationSelectPaneTab.Suggestions },
    // {
    //   label: 'Library panels',
    //   value: VisualizationSelectPaneTab.LibraryPanels,
    //   description: 'Reusable panels you can share between multiple dashboards.',
    // },
  ];

  const onVizTypeChange = (options: VizTypeChangeDetails) => {
    panelManager.changePluginType(options.pluginId);
    onChange();
  };

  return (
    <div className={styles.wrapper}>
      <FilterInput
        className={styles.filter}
        value={searchQuery}
        onChange={setSearchQuery}
        autoFocus={true}
        placeholder="Search for..."
      />
      <Field className={styles.customFieldMargin}>
        <RadioButtonGroup options={radioOptions} value={listMode} onChange={setListMode} fullWidth />
      </Field>
      <CustomScrollbar autoHeightMin="100%">
        {listMode === VisualizationSelectPaneTab.Visualizations && (
          <VizTypePicker pluginId={panel.state.pluginId} searchQuery={searchQuery} onChange={onVizTypeChange} />
        )}
        {/* {listMode === VisualizationSelectPaneTab.Widgets && (
                <VizTypePicker pluginId={plugin.meta.id} onChange={onVizChange} searchQuery={searchQuery} isWidget />
              )} */}
        {listMode === VisualizationSelectPaneTab.Suggestions && (
          <VisualizationSuggestions
            onChange={onVizTypeChange}
            searchQuery={searchQuery}
            panel={panelModel}
            data={data}
          />
        )}
      </CustomScrollbar>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: theme.spacing(1),
    height: '100%',
    gap: theme.spacing(1),
    border: `1px solid ${theme.colors.border.weak}`,
    borderRight: 'none',
    borderBottom: 'none',
    borderTopLeftRadius: theme.shape.radius.default,
  }),
  customFieldMargin: css({
    marginBottom: theme.spacing(1),
  }),
  filter: css({
    minHeight: theme.spacing(4),
  }),
});
