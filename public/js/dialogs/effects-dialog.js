


Dialogs.EffectsDialog = $.dino({
	dtype: 'dialog',
	title: 'Состав',
	renderTo: 'body',
	content: {
		dtype: 'box',
		layout: 'column',
		components: {
			energyBox: {
				dtype: 'box',
				style: {'padding': 8},
				layout: 'form',
				defaultItem: {
					dtype: 'text-input',
					width: 60,
					changeOnBlur: true
				},
				items: [/*{
					dtype: 'text',
					text: 'На 100 г'
				}, */{
					label: 'Белки',
					dataId: 'proteins'
				}, {
					label: 'Жиры',
					dataId: 'fats'
				}, {
					label: 'Углеводы',
					dataId: 'carbohyds'
				}, {
					label: 'Калории',
					dataId: 'calories'
				}]				
			},
			microelementBox: {
				dtype: 'box',
				style: {'padding': 8},
				layout: 'form',
				defaultItem: {
					dtype: 'text-input',
					width: 60,
					changeOnBlur: true
				},
				items: [{
					label: 'K',
					dataId: 'k'
				}, {
					label: 'Ca',
					dataId: 'ca'
				}, {
					label: 'Na',
					dataId: 'na'
				}, {
					label: 'Mg',
					dataId: 'mg'
				}]					
				
			}
		}
		
		
	},
	buttons: ['ok', 'cancel'],
	onClose: function(e) {
		
		if(e.button == 'ok') {
			this.dialogResult = this.data.val();			
		}
		
	}
});