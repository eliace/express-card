


class Patient < ActiveRecord::Base
	has_many :express_cards
end


class AnalysisGroup < ActiveRecord::Base
	has_many :analyses
end


class Analysis < ActiveRecord::Base
	belongs_to :analysis_group
end


class DrugUnit < ActiveRecord::Base
	
end

class DrugSolvent < ActiveRecord::Base
	
end

class DrugGroup < ActiveRecord::Base
#	belongs_to :drug_category
	has_many :drugs
end

class Drug < ActiveRecord::Base
	belongs_to :drug_group
	belongs_to :drug_unit
	belongs_to :drug_solvent
	
	def as_json(o=nil)
		json = super.as_json(o).merge(:_class => self.class.name)
		json['effects'] = effects.nil? ? {} : JSON.parse(effects) 
		json
	end
		
	
	
	
end

class ExpressCard < ActiveRecord::Base
	belongs_to :patient
end

class ExpressCardAnalysis < ActiveRecord::Base
	belongs_to :express_card
end

class ExpressCardAppointments < ActiveRecord::Base
	belongs_to :express_card
	belongs_to :appointment_group
end

class AppointmentGroup < ActiveRecord::Base
#	has_many :drug_groups	
end
