
var analysisGroups = new Dino.data.ObjectDataSource();


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
						dtype: 'dropdown-grid-column',
						width: 300,
						dataId: 'analysis_group_id',
						dropdownData: DataSources.AnalysisGroups
					}]
				},
				objectFactory: function() {
					return {
						name: 'Новый анализ',
						analysis_group_id: null
					};
				}
			}
		},
	},
	onOpen: function() {
		// загружаем анализы
		Remote.Analyses.load_all().to(DataSources.Analyses); //FIXME это должно измениться на работу с пейджером
	},
	onClose: function(e) {
		if(e.button == 'save') {
			if( this.save() ) growl.info('Изменения в справочнике сохранены.');
		}
	},
	headerButtons: ['close'],
	buttons: ['save', 'cancel']
});



Dialogs.AnalysesDialog.save = function() {
	
	var result = false;
	
	this.content.grid.editBuffer.flush(function(val, action){
		
		if(action == 'Delete')
			Remote.Analysis.remove(val);			
		else if(action == 'Add')
			Remote.Analysis.create(val);			
		else if(action == 'Update')
			Remote.Analysis.update(val);			
		
		result = true;
  });
	
	return result;
}
