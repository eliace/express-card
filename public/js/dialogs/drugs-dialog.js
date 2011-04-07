
var drugGroups = new Dino.data.ObjectDataSource();
var drugCategories = new Dino.data.ObjectDataSource();
var drugUnits = new Dino.data.ObjectDataSource();
var drugSolvents = new Dino.data.ObjectDataSource();



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
						header: 'Наименование',
						dataId: 'name'
					}/*, {
						header: 'Категория',
						dtype: 'dropdown-grid-column',
						dataId: 'drug_category_id',
						dropdownData: DataSources.DrugCategories
					}*/, {
						header: 'Группа',
						width: 120,
						dtype: 'dropdown-grid-column',
						dataId: 'drug_group_id',
						dropdownData: DataSources.DrugGroups
					}, {
						header: 'Параметры',
						dataId: 'effects'
					}, {
						header: 'Ед.',
						dtype: 'dropdown-grid-column',
						dataId: 'drug_unit_id',
						dropdownData: DataSources.DrugUnits,
						width: 60
					}, {
						header: 'Раствор',
						width: 120,
						dtype: 'dropdown-grid-column',
						dataId: 'drug_solvent_id',
						dropdownData: DataSources.DrugSolvents
					}, {
						header: 'Доля',
						dataId: 'content',
						format: function(val) { return (val) ? ''+val+'%' : ''; },
						width: 60
					}]
				},
				objectFactory: function() {
					return {
						name: 'Новый препарат',
						drug_category_id: null,
						drug_group_id: null,
						drug_effects: {},
						drug_unit_id: null,
						drug_solvent_id: null
					};
				}
			}
		}
	},
	onOpen: function() {
		Remote.Drugs.load_all().to(DataSources.Drugs);
	},
	onClose: function(e) {
		if(e.button == 'save') {
			if( this.save() ) growl.info('Изменения в справочнике сохранены.');
		}
	},
	headerButtons: ['close'],
	buttons: ['save', 'cancel']
});


Dialogs.DrugsDialog.save = function() {
	
	var result = false;
	
	this.content.grid.editBuffer.flush(function(val, action){
		
		if(action == 'Delete')
			Remote.Drug.remove(val);			
		else if(action == 'Add')
			Remote.Drug.create(val);			
		else if(action == 'Update')
			Remote.Drug.update(val);			
		
		result = true;
  });
	
	return result;
}

