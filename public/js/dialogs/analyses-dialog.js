
var analysisGroups = new Dino.data.ObjectDataSource();

function array_to_hash(arr, key, val) {
	hash = {}; 
	Dino.each(arr, function(item){ hash[item[key]] = item[val]; });
	return hash;
}



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
						header: 'Наименование',
						dataId: 'name'
					}, {
						header: 'Группа',
						width: 300,
						dataId: 'analysis_group_id',
						format: function(val) {
							return (val === '' || val === null || val === undefined) ? '' : analysisGroups.get(val);
						},
						editor: {
							dtype: 'dropdown-editor',
							components: {
								button: {
									cls: 'dino-icon-down',
									height: 10
								},
								dropdown: {
									data: analysisGroups
								}
							}
						}
					}]
				},
				onAdd: function() {
					
					var obj = {
						name: 'Новый анализ',
						analysis_group_id: null
					};
					
					this.data.add(obj);
					this.editBuffer.add(obj);
					
				}
			}
		},
	},
	onOpen: function() {
		
		// загружаем группы анализов
		Remote.AnalysisGroups.load_all().then(function(json){
			analysisGroups.set(array_to_hash(json, 'id', 'name')); //TODO рутинная опреация
		});
		
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel']
});

