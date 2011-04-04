


Dialogs.DrugsDialog = $.dino({
	dtype: 'dialog',
	title: 'Справочник "Питание/препараты"',
	renderTo: 'body',
	data: DataSources.Drugs,
	content: {
		dtype: 'box',
		width: 900,
		height: 600,
		components: {
			grid: {
				dtype: 'dictionary-grid',
				tableModel: {
					columns: [{
						header: 'Наименование'
					}, {
						header: 'Категория'
					}, {
						header: 'Группа'
					}, {
						header: 'Параметры'
					}, {
						header: 'Ед.',
						width: 60
					}, {
						header: 'Раствор'
					}, {
						header: 'Доля',
						width: 60
					}]
				}
			}
		}
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel']
});
