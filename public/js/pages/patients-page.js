


Pages.PatientsPage = $.dino({
	dtype: 'box',
	tag: 'patients',
	cls: 'patients-page',
	components: {
		list: {
			dtype: 'box',
			layout: 'float-layout',
			data: DataSources.Patients,
			dynamic: true,
			height: 'auto',
			defaultItem: {
				dtype: 'box',
				cls: 'patient-item dino-corner-all',
				layout: 'float-layout',
				updateOnValueChange: true,
				items: [{
					dtype: 'box',
					cls: 'patient-item-icon'
				}, {
					dtype: 'box',
					cls: 'patient-item-info',
					tag: 'patient-info',
					items: [{
						dtype: 'text',
						cls: 'patient-item-id',
						dataId: 'patient_no'
					}, {
						dtype: 'text',
						cls: 'patient-item-name',
						dataId: 'name',
						extensions: [Dino.Clickable],
						onClick: function() {
							
							var self = this;
							
							var val_copy = Dino.deep_copy(this.data.source.val());
							Dialogs.EditPatientDialog.$bind( val_copy );
							Dialogs.EditPatientDialog.$dataChanged();							
							Dialogs.EditPatientDialog.open(function(result){
								Remote.Patient.save(result);								
								self.parent.data.set(result);
							});
						}
					}, {
						dtype: 'text',
						cls: 'patient-item-diagnosis',
						dataId: 'diagnosis'
					}, {
						dtype: 'box',
						layout: 'float-layout',
						tag: 'buttons',
						items: [/*{
							dtype: 'box',
							cls: 'info-button patient-control dino-clickable',
							tooltip: 'Карта пациента',
						}, */{
							dtype: 'box',
							cls: 'roster-button patient-control dino-clickable',
							tooltip: 'Заполнить экспресс-карту',
						}, {
							dtype: 'box',
							cls: 'analysis-button patient-control dino-clickable',
							tooltip: 'Назначить анализы',
						}, {
							dtype: 'box',
							cls: 'discharge-button patient-control dino-clickable',
							tooltip: 'Выписать',
						}]
					}]
				}]		
			}			
		}
	}
});
