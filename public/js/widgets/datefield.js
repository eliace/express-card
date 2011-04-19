


Dino.declare('Medic.widgets.DateField', 'Dino.widgets.DropdownField', {
	
	defaultOptions: {
		cls: 'dino-form-field',
		components: {
			input: {
				format: function(val) {return val}
			},
			button: {
				icon: 'silk-icon-date'
//				events: {
//					'click': function(e, w){
//						if(!w.states.is('disabled'))
//							w.parent.input.el.datepick('show');
//					}
//				}				
			},
			'dropdown!': {
				dtype: 'box'
			}
		}
	},
	
	$afterBuild: function() {
		var self = this;
		this.input.el.datepick({
			defaultDate: new Date(),
//			showOnFocus: true,
			dateFormat: $.datepick.ISO_8601,
			onSelect: function(dates) {
				var date0 = dates[0];
				self.setValue($.datepick.formatDate($.datepick.ISO_8601, date0));
			}
		});
	},
	
	showDropdown: function() {
		this.input.el.datepick('show');
	},
	
	hideDropdown: function() {
		this.input.el.datepick('hide');
	}
	
	
}, 'datefield');





Dino.declare('Medic.widgets.DateEditor', 'Dino.widgets.DropdownEditor', {
	
	defaultOptions: {
		dropdownOnFocus: true,
    components: {
      input: {
        format: function(val){ return val; }
      },
      button: {
        cls: 'silk-icon-date'
      }
    },
    onCreated: function() {
      var self = this;
      
      this.input.el.datepick({
        dateFormat: $.datepick.ISO_8601, 
        showOnFocus: false, 
        onSelect: function(dates){
          var date = dates[0];
          self.setValue($.datepick.formatDate($.datepick.ISO_8601, date));
        }, 
        onClose: function(){
          if(self.parent) self.parent.stopEdit();
        }
      });              
    },
    overrides: {
      showDropdown: function() {
        this.input.el.datepick('show');                
      }
    }
		
	}
	
}, 'date-editor');
