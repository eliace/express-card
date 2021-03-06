


Pages.PatientsPage = $.dino({
	dtype: 'box',
	tag: 'patients',
	cls: 'patients-page',
	components: {
		list: {
			dtype: 'box',
			layout: 'float',
			data: DataSources.Patients,
			dynamic: true,
			height: 'auto',
			defaultItem: {
				dtype: 'box',
				cls: 'patient-item dino-corner-all',
				layout: 'float',
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
						layout: 'float',
						tag: 'buttons',
						defaultItem: {
							dtype: 'action-icon',
							cls: 'dino-clickable patient-control',
							onAction: function() {
								
								if(this.tag == 'patient-analyses') {
									Dialogs.PatientAnalysesDialog.open();
								}
								else if(this.tag == 'express-card') {
									
//									var obj = {
//										patient_id: this.data.get('id'),
//										weight: 3,
//										calc_weight: 3.2,
//										appointments: [],
//										analyses: []
//									}
									
									Remote.ExpressCards.load('today', {patient_id: this.data.get('id')}).then(function(json){
										
										Dialogs.ExpressCardDialog.$bind( json );
										Dialogs.ExpressCardDialog.$dataChanged();
										Dialogs.ExpressCardDialog.open(function(result){
											
											Remote.ExpressCard.save(result);
											
										});										
									});
									
									
								}
								
							},
							onCreated: function() {
								this.el.tipTip({edgeOffset: 4});								
							}
						},
						items: [/*{
							cls: 'info-button patient-control dino-clickable',
							tooltip: 'Карта пациента',
						}, */{
							cls: 'roster-button',
							tooltip: 'Заполнить экспресс-карту',
							tag: 'express-card'							
						}/*, {
							cls: 'analysis-button',
							tooltip: 'Назначить анализы',
							tag: 'patient-analyses'
						}*/, {
							cls: 'discharge-button',
							tooltip: 'Выписать',
						}],
					}]
				}]
			}			
		}
	}
});
