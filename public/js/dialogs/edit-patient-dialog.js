

Dialogs.EditPatientDialog = $.dino({
	dtype: 'dialog',
	title: 'Пациент',
	content: {
		dtype: 'box',
		layout: 'form-layout',
		items: [{
			dtype: 'textfield',
			label: 'Номер',
			dataId: 'patient_no',
			changeOnBlur: true
		}, {
			dtype: 'textfield',
			label: 'Имя',
			dataId: 'name',
			changeOnBlur: true
		}, {
			dtype: 'select',
			label: 'Пол',
			dataId: 'sex',
			options: {
				'male': 'муж',
				'female': 'жен'
			}
		}, {
			dtype: 'datefield',
			label: 'Дата рождения',
			dataId: 'birth_date'
		}, {
			dtype: 'textfield',
			label: 'Вес при рождении',
			dataId: 'birth_weight',
			changeOnBlur: true
		}, {
			dtype: 'datefield',
			label: 'Дата поступления',
			dataId: 'admission_date'
		}, {
			dtype: 'textfield',
			label: 'Вес при поступлении',
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


