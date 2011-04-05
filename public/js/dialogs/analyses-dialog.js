
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
						id: 'temp_'+Dino.timestamp(),
						name: 'Новый анализ',
						analysis_group_id: null
					};
					
					this.data.add(obj);
					this.editBuffer.add(obj);
					
				},
				onDelete: function(){
					var self = this;
          this.selection.each(function(item){
            var val = item.data.val();
            self.editBuffer.del(val);
            item.data.del();
          });
					this.selection.clear();
				},
				onUpdate: function(e) {
					this.editBuffer.upd(e.row.data.get());					
				}
			}
		},
	},
	onOpen: function() {

		analysisGroups.set(array_to_hash(DataSources.AnalysisGroups.get(), 'id', 'name')); //TODO рутинная опреация

		// загружаем анализы
		Remote.Analyses.load_all().to(DataSources.Analyses);

//		// загружаем группы анализов
//		Remote.AnalysisGroups.load_all().then(function(json){
//			analysisGroups.set(array_to_hash(json, 'id', 'name')); //TODO рутинная опреация
//			
//			// загружаем анализы
//			Remote.Analyses.load_all().to(DataSources.Analyses);
//		});
				
	},
	onClose: function(e) {
		if(e.button == 'save') {
			this.save();
		}
	},
	headerButtons: ['close'],
	buttons: ['save', 'cancel']
});



Dialogs.AnalysesDialog.save = function() {
	this.content.grid.editBuffer.flush(function(val, action){
		
		if(action == 'Delete')
			Remote.Analysis.remove(val);			
		else if(action == 'Add')
			Remote.Analysis.create(val);			
		else if(action == 'Update')
			Remote.Analysis.update(val);			
		
  });
}
