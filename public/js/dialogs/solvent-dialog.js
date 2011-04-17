


Dialogs.SolventDialog = $.dino({
	dtype: 'dialog',
	title: 'Раствор',
	renderTo: 'body',
	content: {
		dtype: 'box',
		layout: 'form',
		defaultItem: {
			dtype: 'input',
			width: 60,
			changeOnBlur: true
		},
		items: [{
			label: 'Растворитель',
			dataId: 'solvent'
		}, {
			label: 'Объем',
			dataId: 'solvent_vol'
		}]					
	},
	buttons: ['ok', 'cancel'],
	onClose: function(e) {
		
		if(e.button == 'ok') {
			this.dialogResult = this.data.val();			
		}
		
	}
});