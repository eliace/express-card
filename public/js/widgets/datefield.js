


Dino.declare('Medic.widgets.DateField', 'Dino.widgets.ComboField', {
	
	defaultOptions: {
		cls: 'dino-form-field dino-corner-all',
		components: {
			input: {
				readOnly: true,
				updateOnValueChange: true
			},
			button: {
				dtype: 'icon-button',
				icon: 'led-icon-calendar_1',
				events: {
					'click': function(e, w){
						if(!w.states.is('disabled'))
							w.parent.input.el.datepick('show');
					}
				}				
			}
		}
	},
	
	$afterBuild: function() {
		var self = this;
		this.input.el.datepick({
			defaultDate: new Date(),
			showOnFocus: true,
			dateFormat: $.datepick.ISO_8601,
			onSelect: function(dates) {
				var date0 = dates[0];
				self.setValue($.datepick.formatDate($.datepick.ISO_8601, date0));
			}
		});
	}
	
}, 'datefield');





Dino.declare('Medic.widgets.DateEditor', 'Dino.widgets.DropdownEditor', {
	
	defaultOptions: {
    components: {
      input: {
        format: function(val){ return val; }
      },
      button: {
        cls: 'led-icon-calendar_1'
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
