

Dialogs.EditPatientDialog = $.dino({
	dtype: 'dialog',
	title: 'Пациент',
	content: {
		dtype: 'box',
		layout: 'form',
		style: {'padding': '5px'},
		defaultItem: {
			cls: 'dino-form-field'
		},
		items: [{
			dtype: 'text-field',
			label: 'Номер',
			dataId: 'patient_no',
			width: 60,
			changeOnBlur: true
		}, {
			dtype: 'text-field',
			label: 'Имя',
			dataId: 'name',
			changeOnBlur: true
		}, {
			dtype: 'dropdown-field',
			label: 'Пол',
			width: 60,
			dataId: 'sex',
			optionsFormat: {id: 0, value: 1},
			components: {
				dropdown: {
					data: [['male', 'муж'], ['female', 'жен']],
					content: {
						defaultItem: {
							content: {
								dataId: 1
							}
						}						
					}
				}
			}
		}, {
			dtype: 'datefield',
			label: 'Дата рождения',
			width: 100,
			dataId: 'birth_date'
		}, {
			dtype: 'text-field',
			label: 'Вес при рождении',
			width: 60,
			dataId: 'birth_weight',
			changeOnBlur: true
		}, {
			dtype: 'datefield',
			label: 'Дата поступления',
			width: 100,
			dataId: 'admission_date'
		}, {
			dtype: 'text-field',
			label: 'Вес при поступлении',
			width: 60,
			dataId: 'admission_weight',
			changeOnBlur: true
		}, {
			dtype: 'textarea',
			label: 'Диагноз',
			dataId: 'diagnosis',
			changeOnBlur: true
		}]
	},
	headerButtons: ['close'],
	buttons: ['ok', 'cancel'],
	onClose: function(e) {
		if(e.button == 'ok') this.dialogResult = this.data.val();
	}
});


