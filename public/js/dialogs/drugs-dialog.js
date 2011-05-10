
var drugGroups = new Dino.data.ObjectDataSource();
var drugCategories = new Dino.data.ObjectDataSource();
var drugUnits = new Dino.data.ObjectDataSource();
var drugSolvents = new Dino.data.ObjectDataSource();


var drugEffectNames = {
	fats: 'Жиры',
	proteins: 'Белки',
	carbohyds: 'Углеводы',
	calories: 'Калории',
	mg: 'Mg',
	k: 'K',
	ca: 'Ca',
	na: 'Na'
	
}



Dialogs.DrugsDialog = $.dino({
	dtype: 'dialog',
	title: 'Справочник "Питание/препараты"',
	renderTo: 'body',
	data: DataSources.Drugs,
	height: '80%',
	content: {
		dtype: 'box',
		width: 900,
		components: {
			grid: {
				dtype: 'dictionary-grid',
				cls: 'dino-border-all',
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
						editor: {
							dataModel: {
								data: DataSources.DrugGroups
							}							
						}
//						dropdownData: DataSources.DrugGroups
					}, {
						header: 'Состав',
						dataId: 'effects',
						editable: false,
						cls: 'dialog-column',
						updateOnValueChange: true,
						format: function(val) {
							s_a = [];
							Dino.each(val, function(v, i){s_a.push(drugEffectNames[i]+': '+v);})
							return s_a.join(', '); 
						},
						events: {
							'click': function(e, w) {
								
								Dialogs.EffectsDialog.$bind( Dino.deep_copy(w.data.val()) );
								Dialogs.EffectsDialog.$dataChanged();
								Dialogs.EffectsDialog.open(function(result){
									// FIXME
									for(var i in result) if(result[i]) result[i] = parseFloat(result[i]);
									
									w.data.set( Dino.filter(result, function(val, i){return val}) );
									
									w.getParent(Dino.widgets.Grid).editBuffer.upd(w.data.source.val());
								});
								
							}
						}
					}, {
						header: 'Ед.',
						dtype: 'dropdown-grid-column',
						dataId: 'drug_unit_id',
						editor: {
							dataModel: {
								data: DataSources.DrugUnits
							}							
						},
//						dropdownData: DataSources.DrugUnits,
						width: 60
					}/*, {
						header: 'Раствор',
						width: 120,
						dtype: 'dropdown-grid-column',
						dataId: 'drug_solvent_id',
						editor: {
							dataModel: {
								data: DataSources.DrugSolvents
							}							
						},
//						dropdownData: DataSources.DrugSolvents
					}*/, {
						header: 'Базовый раствор',
//						dataId: 'content',
						cls: 'dialog-column',
						format: function() { 
							var val = this.data.val();
							var s = (val.content) ? ' '+val.content+' мг/мл' : '';
							return (val.drug_solvent_id) ? ''+DataSources.DrugSolvents.get_by_id(val.drug_solvent_id).name + s : ''; 
						},
						editable: false,
						updateOnValueChange: true,
						events: {
							'click': function(e, w) {
								
//								var self = this;

								Dialogs.SolventDialog.content.getItem('solvent_vol').el.parent().parent().addClass('hidden');
								
								Dialogs.SolventDialog.opt('title', 'Раствор для '+w.data.get('name'));
								Dialogs.SolventDialog.$bind( Dino.deep_copy(w.data.val()) );
								Dialogs.SolventDialog.$dataChanged();
								Dialogs.SolventDialog.open(function(result){
									w.data.set(result);
									w.getParent(Dino.widgets.Grid).editBuffer.upd(w.data.val());

//									result.solvent_vol = parseFloat(result.solvent_vol);
//									self.data.set(result);
//									calc_appointment_dose( self.parent.getRow() );
								});						
								
							}
						},					
						width: 180
					}]
				},
				objectFactory: function() {
					return {
						name: 'Новый препарат',
						drug_category_id: null,
						drug_group_id: null,
						drug_effects: {},
						drug_unit_id: null,
						drug_solvent_id: null,
						effects: {},
						content: 0
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

