


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
			dataId: 'solvent',
			format: function(val) {
				if(val === '' || val === undefined || val === null) return '';
				return DataSources.DrugSolvents.find_by_oid(val)['name'];
			},
			optionsFormat: {
				id: 'id',
				value: 'name'
			},
			components: {
				dropdown: {
					data: DataSources.DrugSolvents,
					content: {
						defaultItem: {
							content: {
								dataId: 'name'								
							}
						}						
					}
				}
			}
		}, {
			dtype: 'text-field',
			label: 'Объем',
			dataId: 'solvent_vol',
			changeOnBlur: true,
			width: 60,
//			style: {'padding': '3px'}
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