


Dialogs.SolventDialog = $.dino({
	dtype: 'dialog',
	title: 'Раствор',
	renderTo: 'body',
	content: {
		dtype: 'box',
		layout: 'form',
		defaultItem: {
//			dtype: 'input',
			cls: 'dino-form-field',
//			changeOnBlur: true
		},
		items: [{
			dtype: 'dropdown-field',
			label: 'Растворитель',
			dataId: 'drug_solvent_id',
			format: function(val) {
				if(val === '' || val === undefined || val === null) return '';
				return DataSources.DrugSolvents.find_by_oid(val)['name'];
			},
			dataModel: {
				type: 'custom',
				data: DataSources.DrugSolvents,
				id: 'id',
				value: 'name'
			},
//			optionsFormat: {
//				id: 'id',
//				value: 'name'
//			},
//			components: {
//				dropdown: {
//					data: DataSources.DrugSolvents,
//					content: {
//						defaultItem: {
//							content: {
//								dataId: 'name'								
//							}
//						}						
//					}
//				}
//			}
		}, {
			dtype: 'text-field',
			label: 'Соотношение',
			dataId: 'content',
			changeOnBlur: true,
			format: function(val) { return ''+val+' мг/мл' },
			store: Dino.parsers.floatNumber,
			rawValueOnFocus: true,
			width: 120,
		}, {
			dtype: 'text-field',
			tag: 'solvent_vol',
			label: 'Объем',
			dataId: 'solvent_vol',
			format: function(val) { return ''+val+' мл' },
			changeOnBlur: true,
			rawValueOnFocus: true,
			store: Dino.parsers.floatNumber,
			width: 60,
		}]					
	},
	buttons: ['ok', 'cancel'],
	onClose: function(e) {
		
		if(e.button == 'ok') {
			this.dialogResult = this.data.val();			
		}
		
		Dino.Focusable.focusManager.clear();
	}
});