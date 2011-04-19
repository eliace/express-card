


Dino.data.DataSource.prototype.get_by_id = function(id) {
	var arr = this.val();
	for(var i in arr){
		if(arr[i]['id'] == id) return arr[i];
	}
	return null;	
}

var Snippets = {};


var Pages = {};
var Dialogs = {};

var DataSources = {
	Patients: new Dino.data.ArrayDataSource(),
	AnalysisGroups: new Dino.data.ArrayDataSource(),
	Analyses: new Dino.data.ArrayDataSource(),
	DrugUnits: new Dino.data.ArrayDataSource(),
	DrugSolvents: new Dino.data.ArrayDataSource(),
	DrugCategories: new Dino.data.ArrayDataSource(),
	DrugGroups: new Dino.data.ArrayDataSource(),
	Drugs: new Dino.data.ArrayDataSource(),
	AppointmentGroups: new Dino.data.ArrayDataSource(),
	ExpressCards: new Dino.data.ArrayDataSource(),
	ExpressCardAnalyses: new Dino.data.ArrayDataSource(),
	ExpressCardAppointments: new Dino.data.ArrayDataSource(),
};

var Remote = {};

Remote.Patients = new Medic.remote.Collection('patients');
Remote.AnalysisGroups = new Medic.remote.Collection('analysis_groups');
Remote.Analyses = new Medic.remote.Collection('analyses');
Remote.DrugUnits = new Medic.remote.Collection('drug_units');
Remote.DrugSolvents = new Medic.remote.Collection('drug_solvents');
Remote.DrugCategories = new Medic.remote.Collection('drug_categories');
Remote.DrugGroups = new Medic.remote.Collection('drug_groups');
Remote.Drugs = new Medic.remote.Collection('drugs');
Remote.AppointmentGroups = new Medic.remote.Collection('appointment_groups');
Remote.ExpressCard = new Medic.remote.Collection('express_card');
Remote.ExpressCardAnalyses = new Medic.remote.Collection('express_card_analyses');
Remote.ExpressCardAppointments = new Medic.remote.Collection('express_card_appointments');


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
Remote.Analysis = Remote.Analyses.object([
	'name',
	'analysis_group_id'
]);
Remote.Drug = Remote.Drugs.object([
	'name',
	'drug_group_id',
	'drug_unit_id',
	'drug_solvent_id',
	'effects',
	'content'
]);



function array_to_hash(arr, key, val) {
	hash = {}; 
	Dino.each(arr, function(item){ hash[item[key]] = item[val]; });
	return hash;
}



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
				layout: 'stack',
				items: [Pages.PatientsPage]
			}
		}
	});
	
	
	Dino.each(Dialogs, function(dlg){ $('body').append(dlg.el); });
	
	Application.root.content.layout.activate('patients');


	Remote.Patients.load_all().to(DataSources.Patients);
	
	Remote.AnalysisGroups.load_all().to(DataSources.AnalysisGroups);
	Remote.DrugUnits.load_all().to(DataSources.DrugUnits);
	Remote.DrugSolvents.load_all().to(DataSources.DrugSolvents).then(function(){ DataSources.DrugSolvents.add({id: null, name: ''}, 0); });
//	Remote.DrugCategories.load_all().to(DataSources.DrugCategories);
	Remote.DrugGroups.load_all().to(DataSources.DrugGroups);
	Remote.AppointmentGroups.load_all().to(DataSources.AppointmentGroups);

});