


Dialogs.AnalysesDialog = $.dino({
	dtype: 'dialog',
	title: 'Справочник "Анализы"',
	renderTo: 'body',
	data: DataSources.Analyses,
	content: {
		dtype: 'box',
		width: 700,
		height: 600,
		components: {
			grid: {
				dtype: 'dictionary-grid',
				tableModel: {
					columns: [{
						header: 'Наименование'
					}, {
						header: 'Группа',
						width: 300
					}]
				}
			}
		}
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel']
});
