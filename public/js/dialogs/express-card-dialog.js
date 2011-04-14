
//var expressCard = new Dino.data.ObjectDataSource();



Dialogs.ExpressCardDialog = $.dino({
	dtype: 'dialog',
	title: 'Экспресс-карта',
	renderTo: 'body',
//	width: 1000,
	height: '90%',
//	data: expressCard,
	content: {
		dtype: 'box',
		layout: 'stack',
		items: [Snippets.AnalysesTab, Snippets.AppointmentsTab]	
	},
  buttonSet: {
    'next': {text: 'Далее >>', tag: 'next'},
    'prev': {text: '<< Назад', tag: 'prev'},
  },
//	buttons: ['cancel', 'next'],
	headerButtons: ['close'],
	onBeforeOpen: function() {
		this.content.layout.activate('analyses');
		this.activePage = this.content.getItem('analyses');
		this.opt({
			title: '	Экспресс-карта: Анализы',
			buttons: ['cancel', 'next']
		});		
	},
	onOpen: function() {
//		Remote.ExpressCardAnalyses.load_all().to(DataSources.ExpressCardAnalyses);
		
		Remote.Analyses.load('classification', {}, function(json){
			analysesClassification.set(json);
		});

		Remote.Drugs.load('classification', {}, function(json){
			drugsClassification.set(json);
		});
		
		//TODO здесь нужно загружать экспресс-карту, но пока используем шаблон
		var ec = {
			weight: 3,
			calc_weight: 3.1,
			appointments: [],
			analyses: []
		};
		this.$bind(ec);
		this.$dataChanged();
		
	},
	onClose: function(e) {
		
		if(e.button == 'next') {
			// с анализов переходим на препараты
			if(this.activePage.tag == 'analyses') {
				this.content.layout.activate('appointments');
				this.activePage = this.content.getItem('appointments');
				this.opt({
					title: '	Экспресс-карта: Препараты',
					buttons: ['prev', 'cancel', 'save']
				});
				this.layout.update();
			}
			e.cancel();
		}
		else if(e.button == 'prev') {
			// с препаратов возвращаемся к анализам
			if(this.activePage.tag == 'appointments') {
				this.content.layout.activate('analyses');
				this.activePage = this.content.getItem('analyses');
				this.opt({
					title: '	Экспресс-карта: Анализы',
					buttons: ['cancel', 'next']
				});
				this.layout.update();
			}
			e.cancel();
		}
		
	}
});
