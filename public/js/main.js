



var Pages = {};
var Dialogs = {};

var DataSources = {
	Patients: new Dino.data.ArrayDataSource(),
	Analyses: new Dino.data.ArrayDataSource(),
	Drugs: new Dino.data.ArrayDataSource()
};

var Remote = {};

Remote.Patients = new Medic.remote.Collection('patients'),
Remote.Patient = Remote.Patients.object([
	'name',
	'sex',
	'patient_no', 
	'diagnosis', 
	'birth_date', 
	'birth_weight', 
	'admission_date',
	'admission_weight', 
]);


$(document).ready(function(){

	Application = new Dino.framework.Application({
		components: {
			logo: {
				dtype: 'box'
			},
			mainMenu: {
				dtype: 'main-menu',
				items: [{
					text: 'Пациенты',
					dropdownModel: {
						items: [{
							text: 'Новый пациент', tag: 'new-patient'
						}]
					}
				}, {
					text: 'Экспресс-карты'
				}, {
					text: 'Справочники',
					dropdownModel: {
						items: [
							{text: 'Анализы', tag: 'analyses'},
							{text: 'Питание/Препараты', tag: 'drugs'},
							{text: 'Пользователи'}
						]
					}
				}],
				onAction: function(e) {
					if(e.target.tag == 'new-patient') {
						
						var self = this;
						
						var val = {};
						
						Dialogs.EditPatientDialog.$bind( val );
						Dialogs.EditPatientDialog.$dataChanged();							
						Dialogs.EditPatientDialog.open(function(result){
							Remote.Patient.save(result, function(json){
								DataSources.Patients.add(json);
							});
						});
						
					}
					else if(e.target.tag == 'analyses') {
						Dialogs.AnalysesDialog.open();
					}
					else if(e.target.tag == 'drugs') {
						Dialogs.DrugsDialog.open();
					}
				}
			},
			content: {
				dtype: 'box',
				layout: 'stack-layout',
				items: [Pages.PatientsPage]
			}
		}
	});
	
	
	Dino.each(Dialogs, function(dlg){ $('body').append(dlg.el); });
	
	Application.root.content.layout.activate('patients');


	Remote.Patients.load_all().to(DataSources.Patients);

});